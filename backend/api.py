from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List, Optional
import torch
from transformers import AutoTokenizer, AutoModel
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
import uvicorn

app = FastAPI(title="Daleel Balady Search API", version="1.0")

# ---- Global placeholders (lazy load later) ----
tokenizer = None
model = None
qdrant = QdrantClient("http://localhost:6333")
collection_name = "services-bge"

def load_model():
    global tokenizer, model
    if model is None:
        print("🔄 Loading BGE-M3 model...")
        model_name = "BAAI/bge-m3"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(
            model_name,
            device_map="auto",
            torch_dtype=torch.float16,
            # quantization_config=BitsAndBytesConfig(load_in_8bit=True) # if CUDA
        )

def get_text_embedding(text: str):
    load_model()  # ensure model is loaded once
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(model.device)
    with torch.no_grad():
        embeddings = model(**inputs).last_hidden_state[:, 0]
        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
    return embeddings.cpu().numpy().astype("float32")[0]

class SearchResult(BaseModel):
    score: float
    name: Optional[str]
    description: Optional[str]
    phone: Optional[str]
    city: Optional[str]
    tags: Optional[List[str]]

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "Daleel Balady API is running 🚀"}

@app.get("/search", response_model=List[SearchResult])
def search_services(
    query: str,
    limit: int = 10,
):
    embedding = get_text_embedding(query)

    conditions = []

    qdrant_filter = Filter(must=conditions) if conditions else None

    results = qdrant.search(
        collection_name=collection_name,
        query_vector=("embedding_text", embedding),
        query_filter=qdrant_filter,
        limit=limit
    )

    return [
        SearchResult(
            score=r.score,
            name=r.payload.get("name"),
            description=r.payload.get("description"),
            phone=r.payload.get("phone"),
            city=r.payload.get("city"),
            tags=r.payload.get("tags")
        )
        for r in results
    ]

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
