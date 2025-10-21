import time
from pathlib import Path
from typing import Optional, List, Dict, Any

import numpy as np
from fastapi import FastAPI, HTTPException, Query, Request
from pydantic import BaseModel, Field
from transformers import AutoTokenizer, AutoModel
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchValue, MatchAny

import torch
import logging

# ---------------- LOGGING SETUP ----------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("BGE-SERVER")

# ---------------- CONFIG ----------------
MODEL_NAME = "intfloat/multilingual-e5-small"   # huggingface model name
QDRANT_URL = "http://localhost:6333"

# Multi-entity collections
COLLECTIONS = {
    "services": "services-bge",
    "users": "users-bge", 
    "shops": "shops-bge",
    "products": "products-bge"
}

# Default collection for backward compatibility
DEFAULT_COLLECTION = "services-bge"
# ----------------------------------------

# ---------------- HF MODEL SETUP ----------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Loading model {MODEL_NAME} on {device}")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME).to(device)
model.eval()
logger.info("Model and tokenizer loaded successfully")

qdrant = QdrantClient(url=QDRANT_URL)
logger.info(f"Connected to Qdrant at {QDRANT_URL}")


def embed_text(text: str) -> np.ndarray:
    t0 = time.perf_counter()
    logger.info(f"Embedding text: {text[:50]}{'...' if len(text) > 50 else ''}")

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=512
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        emb = outputs.last_hidden_state[:, 0, :]
        emb = torch.nn.functional.normalize(emb, p=2, dim=1)

    vec = emb[0].cpu().numpy().astype("float32")
    elapsed = (time.perf_counter() - t0) * 1000
    logger.info(f"Generated embedding of dim {vec.shape[0]} in {elapsed:.2f} ms")
    return vec

# ---------------- FASTAPI ----------------
app = FastAPI(title="BGE HuggingFace Qdrant API")

# ---------------- SCHEMAS ----------------
class EmbedRequest(BaseModel):
    text: str = Field(..., example="عيادة باطنة في كوم حماده")

class EmbedResponse(BaseModel):
    embedding: List[float]
    dim: int
    time_ms: float

class SearchFilters(BaseModel):
    city: Optional[str] = None
    tags: Optional[List[str]] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

class SearchRequest(BaseModel):
    query: str = Field(..., example="دكتور باطنة")
    limit: int = Field(10, ge=1, le=50)
    filters: Optional[SearchFilters] = None
    collection: Optional[str] = Field(None, example="services")  # services, users, shops, products

class MultiSearchRequest(BaseModel):
    entities: dict = Field(..., example={
        "services": {"enabled": True, "query": "دكتور", "limit": 5},
        "users": {"enabled": True, "query": "محمد", "limit": 5}
    })
    location: Optional[dict] = None

class SearchHit(BaseModel):
    id: str
    location: Optional[Dict[str, Any]] = None
    score: float

class SearchResponse(BaseModel):
    results: List[SearchHit]
    took_ms: float

# ---------------- HELPERS ----------------
def build_filter(f: Optional[SearchFilters]) -> Optional[Filter]:
    if not f:
        return None
    must = []
    if f.city:
        logger.info(f"Applying filter: city={f.city}")
        must.append(FieldCondition(key="city", match=MatchValue(value=f.city)))
    if f.tags:
        logger.info(f"Applying filter: tags={f.tags}")
        must.append(FieldCondition(key="tags", match=MatchAny(any=f.tags)))
    return Filter(must=must) if must else None

# ---------------- ENDPOINTS ----------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    start_time = time.perf_counter()
    response = await call_next(request)
    elapsed = (time.perf_counter() - start_time) * 1000
    logger.info(f"Completed {request.method} {request.url} in {elapsed:.2f} ms")
    return response

@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    try:
        logger.info(f"/embed called with text length {len(req.text)}")
        t0 = time.perf_counter()
        emb = embed_text(req.text)
        took_ms = (time.perf_counter() - t0) * 1000
        logger.info(f"/embed response ready in {took_ms:.2f} ms")
        return EmbedResponse(
            embedding=emb.tolist(),
            dim=emb.shape[0],
            time_ms=took_ms
        )
    except Exception as e:
        logger.exception("Error in /embed")
        raise HTTPException(status_code=500, detail=str(e))

def search_collection(collection_name: str, query: str, limit: int = 10, filters=None):
    """Search a specific collection"""
    try:
        emb = embed_text(query)
        q_filter = build_filter(filters)
        
        t0 = time.perf_counter()
        hits = qdrant.search(
            collection_name=collection_name,
            query_vector=emb.tolist(),
            limit=limit,
            query_filter=q_filter,
        )
        took_ms = (time.perf_counter() - t0) * 1000.0
        logger.info(f"Search {collection_name}: {len(hits)} results in {took_ms:.2f} ms")
        
        results = []
        for h in hits:
            p = h.payload
            results.append(SearchHit(
                id=p.get("id"),
                location=p.get("location"),
                score=h.score,
            ))
        
        return results, took_ms
    except Exception as e:
        logger.error(f"Error searching {collection_name}: {e}")
        return [], 0

@app.post("/search", response_model=SearchResponse)
def search(req: SearchRequest):
    try:
        logger.info(f"/search called with query='{req.query}', limit={req.limit}")
        
        # Determine collection to search
        if req.collection and req.collection in COLLECTIONS:
            collection_name = COLLECTIONS[req.collection]
        else:
            collection_name = DEFAULT_COLLECTION  # Backward compatibility
        
        results, took_ms = search_collection(collection_name, req.query, req.limit, req.filters)
        
        logger.info(f"/search completed with {len(results)} hits")
        return SearchResponse(results=results, took_ms=took_ms)

    except Exception as e:
        logger.exception("Error in /search")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/multi_search")
def multi_search(req: MultiSearchRequest):
    """Search across multiple entity types"""
    try:
        logger.info(f"/multi_search called with entities: {list(req.entities.keys())}")
        
        all_results = {}
        total_took_ms = 0
        
        for entity_type, config in req.entities.items():
            if not config.get("enabled", False):
                continue
                
            if entity_type not in COLLECTIONS:
                logger.warning(f"Unknown entity type: {entity_type}")
                continue
            
            collection_name = COLLECTIONS[entity_type]
            query = config.get("query", "")
            limit = config.get("limit", 10)
            
            logger.info(f"Searching {entity_type}: '{query}' (limit={limit})")
            
            results, took_ms = search_collection(collection_name, query, limit)
            all_results[entity_type] = results
            total_took_ms += took_ms
        
        total_results = sum(len(results) for results in all_results.values())
        logger.info(f"/multi_search completed: {total_results} total results")
        
        return {
            "results": all_results,
            "took_ms": total_took_ms,
            "summary": {entity: len(results) for entity, results in all_results.items()}
        }
        
    except Exception as e:
        logger.exception("Error in /multi_search")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search", response_model=SearchResponse)
def search_get(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    collection: str = Query("services", description="Collection to search: services, users, shops, products"),
    city: str = Query(None, description="Filter by city"),
    tags: str = Query(None, description="Filter by tags (comma-separated)")
):
    logger.info(f"/search GET called with query='{query}', collection='{collection}'")
    filters = SearchFilters(
        city=city,
        tags=tags.split(",") if tags else None
    )
    req = SearchRequest(query=query, limit=limit, filters=filters, collection=collection)
    return search(req)

@app.get("/")
def root():
    logger.info("Health check called")
    return {"status": "ok", "message": "BGE-HF API running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)