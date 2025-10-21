import time
from pathlib import Path
from typing import Optional, List, Dict, Any

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from transformers import AutoTokenizer
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchValue, MatchAny, MatchText

# ---------------- CONFIG ----------------
MODEL_DIR = Path("C:/Users/xdev/Documents/quran/onnx-bge-m3")
ONNX_PATH = MODEL_DIR / "model.onnx"
COLLECTION_NAME = "services-bge"
QDRANT_URL = "http://localhost:6333"
TRY_PROVIDERS = ["OpenVINOExecutionProvider", "CPUExecutionProvider"]
# ----------------------------------------

# ---------------- ONNX SETUP ----------------


def load_session(onnx_path: Path):
    last_exc = None
    for p in TRY_PROVIDERS:
        try:
            sess = ort.InferenceSession(str(onnx_path), providers=[p])
            print(f"[info] ONNX Runtime started with provider: {p}")
            return sess
        except Exception as e:
            last_exc = e
    # fallback
    return ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])


def prepare_inputs(tokenizer, text: str):
    toks = tokenizer(
        text,
        return_tensors="np",
        truncation=True,
        padding="max_length",
        max_length=512,
    )
    return {k: (v if isinstance(v, np.ndarray) else np.asarray(v)) for k, v in toks.items()}


def extract_cls_embedding(onnx_outputs):
    out0 = onnx_outputs[0]
    if out0.ndim == 3:
        emb = out0[0, 0, :]
    elif out0.ndim == 2:
        emb = out0[0, :]
    else:
        emb = out0.reshape(out0.shape[0], -1)[0]
    return emb


def normalize_vector(v: np.ndarray):
    v = v.astype("float32")
    norm = np.linalg.norm(v)
    return v if norm == 0 else v / norm


# ---------------- FASTAPI ----------------
app = FastAPI(title="BGE ONNX Qdrant API")

tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR))
session = load_session(ONNX_PATH)
qdrant = QdrantClient(url=QDRANT_URL)

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


class SearchHit(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    tags: Optional[List[str]] = None
    location: Optional[Dict[str, Any]] = None
    score: float


class SearchResponse(BaseModel):
    results: List[SearchHit]
    took_ms: float

# ---------------- HELPERS ----------------


def embed_text(text: str) -> np.ndarray:
    t0 = time.perf_counter()
    inputs = prepare_inputs(tokenizer, text)
    expected = {inp.name for inp in session.get_inputs()}
    filtered = {k: v for k, v in inputs.items() if k in expected}
    outputs = session.run(None, filtered)
    emb = normalize_vector(extract_cls_embedding(outputs))
    print(f"[debug] embedded text in {(time.perf_counter()-t0)*1000:.2f} ms")
    return emb


def build_filter(f: Optional[SearchFilters]) -> Optional[Filter]:
    if not f:
        return None
    must = []
    if f.city:
        must.append(FieldCondition(key="city", match=MatchValue(value=f.city)))
    if f.tags:
        must.append(FieldCondition(key="tags", match=MatchAny(any=f.tags)))
        # Location filter: if lat/lon provided, filter points within ~5km radius
        if f.lat is not None and f.lon is not None:
            # Qdrant geo filtering: use a custom filter or payload field
            must.append({
                "geo": {
                    "location": {
                        "lat": f.lat,
                        "lon": f.lon,
                        "radius": 5000  # meters
                    }
                }
            })
    return Filter(must=must) if must else None

# ---------------- ENDPOINTS ----------------


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    try:
        emb = embed_text(req.text)
        return EmbedResponse(
            embedding=emb.tolist(),
            dim=emb.shape[0],
            time_ms=0.0,  # could track per request if needed
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search", response_model=SearchResponse)
def search(req: SearchRequest):
    try:
        emb = embed_text(req.query)
        q_filter = build_filter(req.filters)

        t0 = time.perf_counter()
        hits = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=("embedding_text", emb.tolist()),
            limit=req.limit,
            query_filter=q_filter,
        )
        took_ms = (time.perf_counter() - t0) * 1000.0

        results = []
        for h in hits:
            p = h.payload
            results.append(SearchHit(
                id=p.get("id"),
                name=p.get("name"),
                description=p.get("description"),
                phone=p.get("phone"),
                city=p.get("city"),
                tags=p.get("tags"),
                location=p.get("location"),
                score=h.score,
            ))

        return SearchResponse(results=results, took_ms=took_ms)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search", response_model=SearchResponse)
def search_get(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    city: str = Query(None),
    tags: str = Query(None)
):
    filters = SearchFilters(
        city=city,
        tags=tags.split(",") if tags else None
    )
    req = SearchRequest(query=query, limit=limit, filters=filters)
    return search(req)


@app.get("/")
def root():
    return {"status": "ok", "message": "BGE-ONNX API running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("BGE-ONNX:app", host="0.0.0.0", port=8000, reload=True)
