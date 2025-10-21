import torch
from transformers import AutoTokenizer, AutoModel
from qdrant_client import QdrantClient

# ---- Load BGE-M3 model ----
model_name = "BAAI/bge-m3"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(
    model_name,
    device_map="auto",          # GPU if available, fallback CPU
    torch_dtype=torch.float16   # use fp16 for efficiency
)

def get_text_embedding(text: str):
    """Generate normalized embedding for text using BGE-M3"""
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(model.device)
    with torch.no_grad():
        embeddings = model(**inputs).last_hidden_state[:, 0]  # CLS token
        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
    return embeddings.cpu().numpy().astype("float32")[0]

# ---- Connect to Qdrant ----
qdrant = QdrantClient("http://localhost:6333")
collection_name = "services-bge"  # ✅ must match the collection where you inserted BGE embeddings

def search_services(keyword: str, top_k: int = 10):
    # Convert keyword into embedding
    embedding = get_text_embedding(keyword)

    # Search Qdrant
    results = qdrant.search(
        collection_name=collection_name,
        query_vector=("embedding_text", embedding),
        limit=top_k
    )

    # Format results
    services = []
    for r in results:
        services.append({
            "score": r.score,
            "name": r.payload.get("name"),
            "description": r.payload.get("description"),
            "phone": r.payload.get("phone"),
            "city": r.payload.get("city"),
            "tags": r.payload.get("tags")
        })
    return services

if __name__ == "__main__":
    keyword = input("Enter search keyword: ")
    results = search_services(keyword)

    print("\nTop Results:")
    for i, r in enumerate(results, 1):
        print(f"{i}. {r['name']}")
        print(f"   📞 {r['phone']} | 🏙️ {r['city']} | ⭐ {r['score']:.4f}")
        print(f"   {r['description']}")
        if r['tags']:
            print(f"   Tags: {', '.join(r['tags'])}\n")
        else:
            print("   Tags: -\n")
