# sql2qdrant.py - Multi-Entity Vector Search Setup with Geolocation
import time
import numpy as np
import pymysql
from pathlib import Path
from transformers import AutoTokenizer, AutoModel
import torch
from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, PointStruct, Distance

# ---------------- CONFIG ----------------
MODEL_NAME = "intfloat/multilingual-e5-small"
QDRANT_URL = "http://localhost:6333"

# --- UPDATED: Queries now include locationLat and locationLon ---
COLLECTIONS = {
    "services-bge": {
        "query": "SELECT id, embeddingText, locationLat, locationLon FROM Service WHERE embeddingText IS NOT NULL AND deletedAt IS NULL",
        "id_field": "id",
        "text_field": "embeddingText"
    },
    "users-bge": {
        # User model doesn't have location, so the query is unchanged. It will use the default location.
        "query": "SELECT id, name, bio, role FROM User WHERE role IN ('PROVIDER', 'DELIVERY') AND deletedAt IS NULL",
        "id_field": "id",
        "text_field": "combined_text"
    },
    "shops-bge": {
        "query": "SELECT id, name, description, city, locationLat, locationLon FROM Shop WHERE deletedAt IS NULL",
        "id_field": "id", 
        "text_field": "combined_text"
    },
    "products-bge": {
        # Products get their location from the shop they belong to via a JOIN
        "query": """
            SELECT p.id, p.name, p.description, p.embeddingText, s.locationLat, s.locationLon 
            FROM Product p
            JOIN Shop s ON p.shopId = s.id
            WHERE p.isActive = 1 AND p.deletedAt IS NULL
        """,
        "id_field": "id",
        "text_field": "combined_text"
    }
}

DB_NAME = "daleelai"
DB_USER = "root"
DB_PASS = "Mido@@192005"
DB_HOST = "127.0.0.1"
DB_PORT = 3306
BATCH_SIZE = 50

# Default location (used as a fallback)
DEFAULT_LAT = 31.0345728
DEFAULT_LON = 30.4676864
# ----------------------------------------


# ---------------- EMBEDDING ----------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME).to(device)
model.eval()

def embed_text(text: str) -> np.ndarray:
    """Encode text into a normalized vector using transformers"""
    inputs = tokenizer(text or "", return_tensors="pt",
                       truncation=True, padding=True, max_length=512).to(device)
    with torch.no_grad():
        model_output = model(**inputs)
        embeddings = model_output.last_hidden_state[:, 0]
    emb = embeddings[0].cpu().numpy()
    emb = emb.astype("float32")
    norm = np.linalg.norm(emb)
    return emb if norm == 0 else emb / norm
# ----------------------------------------

def fetch_entity_data(conn, collection_name):
    """Fetch data for a specific entity type"""
    config = COLLECTIONS[collection_name]
    with conn.cursor() as cur:
        cur.execute(config["query"])
        return cur.fetchall()

# --- NEW Helpers: discover join tables and fetch tags/categories ---
def _find_tables(conn, includes):
    placeholders = " AND ".join(["table_name LIKE %s"] * len(includes))
    sql = f"SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND {placeholders}"
    like_params = [f"%{inc}%" for inc in includes]
    with conn.cursor() as cur:
        cur.execute(sql, like_params)
        return [row[0] for row in cur.fetchall()]

def _try_fetch(cur, sql, params):
    try:
        cur.execute(sql, params)
        return cur.fetchall()
    except Exception:
        return None

def fetch_service_tags(conn, service_id):
    try:
        tables = _find_tables(conn, ["Service", "tags"]) or []
        with conn.cursor() as cur:
            for tbl in tables:
                # Try A -> service, B -> tag
                rows = _try_fetch(cur, f"SELECT t.name FROM `{tbl}` j JOIN `tags` t ON j.B = t.id WHERE j.A = %s", (service_id,))
                if rows is None:
                    # Try reversed
                    rows = _try_fetch(cur, f"SELECT t.name FROM `{tbl}` j JOIN `tags` t ON j.A = t.id WHERE j.B = %s", (service_id,))
                if rows:
                    return [r[0] for r in rows if r and r[0]]
    except Exception:
        pass
    return []

def fetch_product_tags(conn, product_id):
    try:
        tables = _find_tables(conn, ["Product", "tags"]) or []
        with conn.cursor() as cur:
            for tbl in tables:
                rows = _try_fetch(cur, f"SELECT t.name FROM `{tbl}` j JOIN `tags` t ON j.B = t.id WHERE j.A = %s", (product_id,))
                if rows is None:
                    rows = _try_fetch(cur, f"SELECT t.name FROM `{tbl}` j JOIN `tags` t ON j.A = t.id WHERE j.B = %s", (product_id,))
                if rows:
                    return [r[0] for r in rows if r and r[0]]
    except Exception:
        pass
    return []

def fetch_service_categories(conn, service_id):
    cat_ids, cat_slugs = [], []
    try:
        tables = _find_tables(conn, ["Category", "Service"]) or []
        with conn.cursor() as cur:
            for tbl in tables:
                rows = _try_fetch(cur, f"SELECT c.id, c.slug FROM `{tbl}` j JOIN `Category` c ON j.B = c.id WHERE j.A = %s", (service_id,))
                if rows is None:
                    rows = _try_fetch(cur, f"SELECT c.id, c.slug FROM `{tbl}` j JOIN `Category` c ON j.A = c.id WHERE j.B = %s", (service_id,))
                if rows:
                    for r in rows:
                        if r and r[0]:
                            cat_ids.append(str(r[0]))
                            if len(r) > 1 and r[1]:
                                cat_slugs.append(str(r[1]))
                    break
    except Exception:
        pass
    return list(dict.fromkeys(cat_ids)), list(dict.fromkeys(cat_slugs))

# --- UPDATED: Handles new columns from the SQL queries ---
def generate_combined_text(row, collection_name):
    """Generate searchable text for different entity types"""
    if collection_name == "services-bge":
        return row[1]  # embeddingText is the second column
    
    elif collection_name == "users-bge":
        id_val, name, bio, role = row
        combined = f"{name or ''} {bio or ''} {role or ''}".strip()
        return combined if combined else "provider"
    
    elif collection_name == "shops-bge":
        # Unpack row, ignoring lat/lon for text generation
        id_val, name, description, city, _, _ = row
        combined = f"{name or ''} {description or ''} {city or ''}".strip()
        return combined if combined else "shop"
    
    elif collection_name == "products-bge":
        # Unpack row, ignoring lat/lon for text generation
        id_val, name, description, embedding_text, _, _ = row
        if embedding_text:
            return embedding_text
        else:
            combined = f"{name or ''} {description or ''}".strip()
            return combined if combined else "product"
    
    return ""

# --- NEW: Helper function to extract location data from a row ---
def extract_location(row, collection_name):
    """Extracts lat and lon from a DB row based on the collection type."""
    try:
        if collection_name == "services-bge":
            # lat is column 3 (index 2), lon is column 4 (index 3)
            return float(row[2]), float(row[3])
        elif collection_name == "shops-bge":
            # lat is column 5 (index 4), lon is column 6 (index 5)
            return float(row[4]), float(row[5])
        elif collection_name == "products-bge":
            # lat is column 5 (index 4), lon is column 6 (index 5) from the JOINed shop
            return float(row[4]), float(row[5])
    except (TypeError, ValueError, IndexError):
        # Handles cases where location is NULL, not a number, or column doesn't exist (like for users)
        return None, None
    # Default case for collections without location (e.g., users)
    return None, None


def process_collection(conn, qdrant, collection_name):
    """Process a single collection"""
    print(f"\n🔄 Processing collection: {collection_name}")
    
    rows = fetch_entity_data(conn, collection_name)
    print(f"[info] fetched {len(rows)} rows for {collection_name}")
    
    if not rows:
        print(f"[warning] No data found for {collection_name}, skipping...")
        return
    
    test_emb = embed_text("test")
    dim = test_emb.shape[0]
    
    try:
        qdrant.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
        print(f"[ok] Recreated Qdrant collection '{collection_name}' (dim={dim})")
    except Exception as e:
        print(f"[error] Failed to create collection {collection_name}: {e}")
        return
    
    batch = []
    total = 0
    failed = 0
    
    for row in rows:
        try:
            entity_id = str(row[0])
            text = generate_combined_text(row, collection_name)
            
            if not text:
                print(f"[warning] Empty text for {entity_id}, skipping...")
                failed += 1
                continue
            
            emb = embed_text(text)
            
            # --- UPDATED: Get location from row and fall back to default ---
            lat, lon = extract_location(row, collection_name)
            final_lat = lat if lat is not None else DEFAULT_LAT
            final_lon = lon if lon is not None else DEFAULT_LON

            # --- NEW: Fetch tags/categories for vector-side filtering ---
            extra_payload = {}
            try:
                if collection_name == "services-bge":
                    s_tags = fetch_service_tags(conn, entity_id)
                    if s_tags:
                        extra_payload["tags"] = s_tags
                    cat_ids, cat_slugs = fetch_service_categories(conn, entity_id)
                    if cat_ids:
                        extra_payload["categoryIds"] = cat_ids
                    if cat_slugs:
                        extra_payload["categorySlugs"] = cat_slugs
                elif collection_name == "products-bge":
                    p_tags = fetch_product_tags(conn, entity_id)
                    if p_tags:
                        extra_payload["tags"] = p_tags
            except Exception:
                pass
            
            point = PointStruct(
                id=entity_id,
                vector=emb.tolist(),
                payload={
                    "id": entity_id,
                    "embedding_text": text[:500],
                    "entity_type": collection_name.replace("-bge", ""),
                    "location": {
                        "lat": final_lat,
                        "lon": final_lon,
                    },
                    **extra_payload,
                },
            )
            batch.append(point)
            
            if len(batch) >= BATCH_SIZE:
                qdrant.upsert(collection_name=collection_name, points=batch, wait=True)
                total += len(batch)
                print(f"[{collection_name}] inserted {total} points")
                batch = []
                
        except Exception as e:
            print(f"[error] Failed to process {entity_id}: {e}")
            failed += 1
            continue
    
    if batch:
        qdrant.upsert(collection_name=collection_name, points=batch, wait=True)
        total += len(batch)
    
    print(f"[{collection_name}] ✅ Completed: {total} inserted, {failed} failed")
    return total

def main():
    print("🚀 Starting Multi-Entity Vector Database Setup with Geolocation...")
    print(f"Model: {MODEL_NAME}")
    print(f"Collections: {list(COLLECTIONS.keys())}")
    print("=" * 60)
    
    try:
        conn = pymysql.connect(
            host=DB_HOST, user=DB_USER, password=DB_PASS,
            database=DB_NAME, port=DB_PORT, cursorclass=pymysql.cursors.Cursor
        )
        print(f"✅ Connected to MySQL: {DB_NAME}")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        return
    
    try:
        qdrant = QdrantClient(url=QDRANT_URL)
        print(f"✅ Connected to Qdrant: {QDRANT_URL}")
    except Exception as e:
        print(f"❌ Failed to connect to Qdrant: {e}")
        conn.close()
        return
    
    total_processed = 0
    for collection_name in COLLECTIONS.keys():
        try:
            count = process_collection(conn, qdrant, collection_name)
            if count:
                total_processed += count
        except Exception as e:
            print(f"❌ Failed to process {collection_name}: {e}")
            continue
    
    conn.close()
    print("\n" + "=" * 60)
    print(f"🎉 Multi-entity setup completed!")
    print(f"📊 Total entities processed: {total_processed}")
    print(f"🔍 Collections ready: {list(COLLECTIONS.keys())}")

if __name__ == "__main__":
    main()