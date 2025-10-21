# sql2qdrant.py - Multi-Entity Vector Search Setup
import time
import numpy as np
import pymysql
from pathlib import Path
from transformers import AutoTokenizer, AutoModel
import torch
from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, PointStruct, Distance

# ---------------- CONFIG ----------------
MODEL_NAME = "intfloat/multilingual-e5-small"  # change to your embedding model
QDRANT_URL = "http://localhost:6333"

# Multiple collections for different entity types
COLLECTIONS = {
    "services-bge": {
        "query": "SELECT id, embeddingText FROM Service WHERE embeddingText IS NOT NULL AND deletedAt IS NULL",
        "id_field": "id",
        "text_field": "embeddingText"
    },
    "users-bge": {
        "query": "SELECT id, name, bio, role FROM User WHERE role IN ('PROVIDER', 'DELIVERY') AND deletedAt IS NULL",
        "id_field": "id",
        "text_field": "combined_text"  # Will be generated from name + bio + role
    },
    "shops-bge": {
        "query": "SELECT id, name, description, city FROM Shop WHERE deletedAt IS NULL",
        "id_field": "id", 
        "text_field": "combined_text"  # Will be generated from name + description + city
    },
    "products-bge": {
        "query": "SELECT id, name, description, embeddingText FROM Product WHERE isActive = 1 AND deletedAt IS NULL",
        "id_field": "id",
        "text_field": "combined_text"  # Will use embeddingText or generate from name + description
    }
}

DB_NAME = "daleelai"
DB_USER = "root"
DB_PASS = "Mido@@192005"
DB_HOST = "127.0.0.1"
DB_PORT = 3306
BATCH_SIZE = 50

# Default location
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
        embeddings = model_output.last_hidden_state[:, 0]  # CLS token
    emb = embeddings[0].cpu().numpy()
    emb = emb.astype("float32")
    norm = np.linalg.norm(emb)
    return emb if norm == 0 else emb / norm
# ----------------------------------------


def ensure_collection(qdrant, dim: int):
    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
    )
    print(f"[ok] Qdrant collection '{COLLECTION_NAME}' ready (dim={dim})")


def fetch_entity_data(conn, collection_name):
    """Fetch data for a specific entity type"""
    config = COLLECTIONS[collection_name]
    with conn.cursor() as cur:
        cur.execute(config["query"])
        return cur.fetchall()

def generate_combined_text(row, collection_name):
    """Generate searchable text for different entity types"""
    if collection_name == "services-bge":
        return row[1]  # embeddingText
    
    elif collection_name == "users-bge":
        id_val, name, bio, role = row
        # Combine name, bio, and role for comprehensive search
        combined = f"{name or ''} {bio or ''} {role or ''}".strip()
        return combined if combined else "provider"
    
    elif collection_name == "shops-bge":
        id_val, name, description, city = row
        # Combine shop name, description, and city
        combined = f"{name or ''} {description or ''} {city or ''}".strip()
        return combined if combined else "shop"
    
    elif collection_name == "products-bge":
        id_val, name, description, embedding_text = row
        # Use existing embeddingText if available, otherwise combine name + description
        if embedding_text:
            return embedding_text
        else:
            combined = f"{name or ''} {description or ''}".strip()
            return combined if combined else "product"
    
    return ""


def process_collection(conn, qdrant, collection_name):
    """Process a single collection"""
    print(f"\n🔄 Processing collection: {collection_name}")
    
    # Fetch data
    rows = fetch_entity_data(conn, collection_name)
    print(f"[info] fetched {len(rows)} rows for {collection_name}")
    
    if not rows:
        print(f"[warning] No data found for {collection_name}, skipping...")
        return
    
    # Ensure collection exists
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
    
    # Batch insert
    batch = []
    total = 0
    failed = 0
    
    for row in rows:
        try:
            entity_id = str(row[0])  # First field is always ID
            text = generate_combined_text(row, collection_name)
            
            if not text:
                print(f"[warning] Empty text for {entity_id}, skipping...")
                failed += 1
                continue
            
            emb = embed_text(text)
            point = PointStruct(
                id=entity_id,
                vector=emb.tolist(),
                payload={
                    "id": entity_id,
                    "embedding_text": text[:500],  # Truncate for storage
                    "entity_type": collection_name.replace("-bge", ""),
                    "location": {
                        "lat": DEFAULT_LAT,
                        "lon": DEFAULT_LON,
                    },
                },
            )
            batch.append(point)
            
            if len(batch) >= BATCH_SIZE:
                qdrant.upsert(collection_name=collection_name, points=batch)
                total += len(batch)
                print(f"[{collection_name}] inserted {total} points")
                batch = []
                
        except Exception as e:
            print(f"[error] Failed to process {entity_id}: {e}")
            failed += 1
            continue
    
    # Insert remaining
    if batch:
        qdrant.upsert(collection_name=collection_name, points=batch)
        total += len(batch)
    
    print(f"[{collection_name}] ✅ Completed: {total} inserted, {failed} failed")
    return total

def main():
    print("🚀 Starting Multi-Entity Vector Database Setup...")
    print(f"Model: {MODEL_NAME}")
    print(f"Collections: {list(COLLECTIONS.keys())}")
    print("=" * 60)
    
    # DB connection
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            port=DB_PORT,
            cursorclass=pymysql.cursors.Cursor
        )
        print(f"✅ Connected to MySQL: {DB_NAME}")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        return
    
    # Init Qdrant
    try:
        qdrant = QdrantClient(url=QDRANT_URL)
        print(f"✅ Connected to Qdrant: {QDRANT_URL}")
    except Exception as e:
        print(f"❌ Failed to connect to Qdrant: {e}")
        conn.close()
        return
    
    # Process each collection
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
