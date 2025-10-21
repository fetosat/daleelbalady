from transformers import AutoTokenizer, AutoModel
from optimum.onnxruntime import ORTModelForFeatureExtraction

model_id = "BAAI/bge-m3"

# Export to ONNX format
ort_model = ORTModelForFeatureExtraction.from_pretrained(
    model_id,
    export=True
)
ort_model.save_pretrained("./onnx-bge-m3")

# Save tokenizer too
tokenizer = AutoTokenizer.from_pretrained(model_id)
tokenizer.save_pretrained("./onnx-bge-m3")
