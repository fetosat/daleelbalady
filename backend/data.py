import torch
import open_clip
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

# ---- Load CLIP model ----
model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32-quickgelu", pretrained="laion400m_e32"
)
tokenizer = open_clip.get_tokenizer("ViT-B-32-quickgelu")


def get_text_embedding(text: str):
    tokens = tokenizer([text])
    with torch.no_grad(), torch.cuda.amp.autocast(enabled=False):  # disable cuda if not available
        features = model.encode_text(tokens)
        features /= features.norm(dim=-1, keepdim=True)
    return features.cpu().numpy().astype("float32")[0]


# ---- Connect to Qdrant ----
qdrant = QdrantClient("http://localhost:6333")
collection_name = "services"

# ---- Example array of services ----
services = [
    {
        "id": "GM_CAFE_001",
        "name": "كازينو الريحاني",
        "description": "مقهى كازينو الريحاني، مكان للجلوس والاستمتاع بالمشروبات في شارع فاطمة الزهراء.",
        "category": "مقاهي ومطاعم",
        "tags": ["كازينو", "الريحاني", "مقهى", "كافيه", "جلسات"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "كازينو الريحاني مقهى كازينو الريحاني، مكان للجلوس والاستمتاع بالمشروبات في شارع فاطمة الزهراء. كازينو الريحاني مقهى كافيه جلسات",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_002",
        "name": "Star Café (ستار كافيه)",
        "description": "ستار كافيه، مقهى يقدم مجموعة متنوعة من المشروبات ويعمل على مدار الساعة.",
        "category": "مقاهي ومطاعم",
        "tags": ["star cafe", "ستار", "كافيه", "مقهى"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "Star Café (ستار كافيه) ستار كافيه، مقهى يقدم مجموعة متنوعة من المشروبات ويعمل على مدار الساعة. star cafe ستار كافيه مقهى",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_003",
        "name": "كافيه كوم حماده",
        "description": "كافيه في كوم حماده، مكان مريح للجلوس والاسترخاء.",
        "category": "مقاهي ومطاعم",
        "tags": ["كافيه", "كوم حماده", "جلسات"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "كافيه كوم حماده كافيه في كوم حماده، مكان مريح للجلوس والاسترخاء. كافيه كوم حماده جلسات",
        "phone": "null",
        "sub_category": "كافيه"
    },
    {
        "id": "GM_CAFE_004",
        "name": "سلسلة مطاعم القشيط",
        "description": "سلسلة مطاعم القشيط متخصصة في تقديم أطباق اللحوم المتنوعة والمشويات.",
        "category": "مقاهي ومطاعم",
        "tags": ["مطعم", "القشيط", "لحوم", "مشويات"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "سلسلة مطاعم القشيط سلسلة مطاعم القشيط متخصصة في تقديم أطباق اللحوم المتنوعة والمشويات. مطعم القشيط لحوم مشويات",
        "phone": "null",
        "sub_category": "مطعم لحوم"
    },
    {
        "id": "GM_CAFE_005",
        "name": "مطعم بابا عبده",
        "description": "مطعم بابا عبده متخصص في وجبات الكريب ويعمل على مدار الساعة.",
        "category": "مقاهي ومطاعم",
        "tags": ["مطعم", "بابا عبده", "كريب", "وجبات سريعة"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "مطعم بابا عبده مطعم بابا عبده متخصص في وجبات الكريب ويعمل على مدار الساعة. مطعم بابا عبده كريب وجبات سريعة",
        "phone": "null",
        "sub_category": "مطعم كريب"
    },
    {
        "id": "GM_CAFE_006",
        "name": "3boud cafe (كافيه عبود)",
        "description": "مقهى عبود في شارع مستشفى الحجاز، يقدم خدمة ممتازة ومشروبات متنوعة.",
        "category": "مقاهي ومطاعم",
        "tags": ["عبود", "كافيه", "3boud cafe", "مقهى"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "3boud cafe (كافيه عبود) مقهى عبود في شارع مستشفى الحجاز، يقدم خدمة ممتازة ومشروبات متنوعة. عبود كافيه 3boud cafe مقهى",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_007",
        "name": "Italiano Cafe (كافيه إيطاليانو)",
        "description": "كافيه إيطاليانو يقدم مشروبات متنوعة وجلسات على مدار الساعة.",
        "category": "مقاهي ومطاعم",
        "tags": ["italiano", "cafe", "كافيه", "إيطاليانو", "مقهى"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "Italiano Cafe (كافيه إيطاليانو) كافيه إيطاليانو يقدم مشروبات متنوعة وجلسات على مدار الساعة. italiano cafe كافيه إيطاليانو مقهى",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_008",
        "name": "كافيه ع المريخ",
        "description": "كافيه ع المريخ يقدم مشاريب جميلة ومعاملة حسنة.",
        "category": "مقاهي ومطاعم",
        "tags": ["كافيه", "ع المريخ", "مقهى", "مشروبات"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "كافيه ع المريخ كافيه ع المريخ يقدم مشاريب جميلة ومعاملة حسنة. كافيه ع المريخ مقهى مشروبات",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_009",
        "name": "Gazala Cafe (كافيه غزالة)",
        "description": "كافيه غزالة مكان للجلوس وتناول المشروبات.",
        "category": "مقاهي ومطاعم",
        "tags": ["gazala", "cafe", "غزالة", "كافيه", "مقهى"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "Gazala Cafe (كافيه غزالة) كافيه غزالة مكان للجلوس وتناول المشروبات. gazala cafe غزالة كافيه مقهى",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_010",
        "name": "كافيه حدوته",
        "description": "كافيه وكافتيريا حدوتة في شارع المصنع.",
        "category": "مقاهي ومطاعم",
        "tags": ["كافيه", "حدوته", "كافتيريا", "مقهى"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "كافيه حدوته كافيه وكافتيريا حدوتة في شارع المصنع. كافيه حدوته كافتيريا مقهى",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_011",
        "name": "مطعم كوكب تاني",
        "description": "مطعم وكافيه كوكب تاني، مكان هادئ يطل على النيل ومناسب للتصوير.",
        "category": "مقاهي ومطاعم",
        "tags": ["مطعم", "كوكب تاني", "كافيه", "نيل", "تصوير"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "مطعم كوكب تاني مطعم وكافيه كوكب تاني، مكان هادئ يطل على النيل ومناسب للتصوير. مطعم كوكب تاني كافيه نيل تصوير",
        "phone": "null",
        "sub_category": "مطعم"
    },
    {
        "id": "GM_CAFE_012",
        "name": "كافتيريا القبليه",
        "description": "كافتيريا القبليه للمشروبات والجلسات.",
        "category": "مقاهي ومطاعم",
        "tags": ["كافتيريا", "القبليه"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "كافتيريا القبليه كافتيريا القبليه للمشروبات والجلسات. كافتيريا القبليه",
        "phone": "null",
        "sub_category": "كافتيريا"
    },
    {
        "id": "GM_CAFE_013",
        "name": "كافتيريا على طريق اسكندرية الزراعي",
        "description": "مقهى لشرب الشاي على طريق الأسكندريه الزراعي.",
        "category": "مقاهي ومطاعم",
        "tags": ["كافتيريا", "مقهى", "شاي", "طريق زراعي"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "كافتيريا على طريق اسكندرية الزراعي مقهى لشرب الشاي على طريق الأسكندريه الزراعي. كافتيريا مقهى شاي طريق زراعي",
        "phone": "null",
        "sub_category": "مقهى شاي"
    },
    {
        "id": "GM_CAFE_014",
        "name": "مطعم ابو محمد",
        "description": "مطعم ابو محمد يقدم سندوتشات كبدة وسجق.",
        "category": "مقاهي ومطاعم",
        "tags": ["مطعم", "ابو محمد", "كبدة", "سجق", "سندوتشات"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "مطعم ابو محمد مطعم ابو محمد يقدم سندوتشات كبدة وسجق. مطعم ابو محمد كبدة سجق سندوتشات",
        "phone": "null",
        "sub_category": "مطعم"
    },
    {
        "id": "GM_CAFE_015",
        "name": "مطعم وكافتيريا في مليحه",
        "description": "مطعم وكافتيريا إزاكايا في منطقة مليحه، يوفر جلسات داخلية وطعام سفري.",
        "category": "مقاهي ومطاعم",
        "tags": ["مطعم", "كافتيريا", "مليحه", "إزاكايا"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "مطعم وكافتيريا في مليحه مطعم وكافتيريا إزاكايا في منطقة مليحه، يوفر جلسات داخلية وطعام سفري. مطعم كافتيريا مليحه إزاكايا",
        "phone": "null",
        "sub_category": "إزاكايا"
    },
    {
        "id": "GM_CAFE_016",
        "name": "Elkhan Cafee (الخان كافيه)",
        "description": "مقهى الخان يقدم خدمات عالية المستوى.",
        "category": "مقاهي ومطاعم",
        "tags": ["elkhan", "الخان", "كافيه", "مقهى"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "Elkhan Cafee (الخان كافيه) مقهى الخان يقدم خدمات عالية المستوى. elkhan الخان كافيه مقهى",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_017",
        "name": "Time out cafe (تايم أوت كافيه)",
        "description": "تايم أوت كافيه مكان جميل وخدمة على أعلى مستوى.",
        "category": "مقاهي ومطاعم",
        "tags": ["time out", "تايم أوت", "كافيه", "مقهى"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "Time out cafe (تايم أوت كافيه) تايم أوت كافيه مكان جميل وخدمة على أعلى مستوى. time out تايم أوت كافيه مقهى",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_018",
        "name": "4 seasons cofee (فور سيزونز كافيه)",
        "description": "مقهى فور سيزونز للمشروبات والجلسات، مفتوح على مدار الساعة.",
        "category": "مقاهي ومطاعم",
        "tags": ["4 seasons", "فور سيزونز", "كافيه", "مقهى"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "4 seasons cofee (فور سيزونز كافيه) مقهى فور سيزونز للمشروبات والجلسات، مفتوح على مدار الساعة. 4 seasons فور سيزونز كافيه مقهى",
        "phone": "null",
        "sub_category": "مقهى"
    },
    {
        "id": "GM_CAFE_019",
        "name": "كافيه ليالى",
        "description": "كافيه ليالي، مكان محترم وخدمة أكثر احتراما.",
        "category": "مقاهي ومطاعم",
        "tags": ["كافيه", "ليالى", "مقهى"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "كافيه ليالى كافيه ليالي، مكان محترم وخدمة أكثر احتراما. كافيه ليالى مقهى",
        "phone": "null",
        "sub_category": "كافيه"
    },
    {
        "id": "GM_CAFE_020",
        "name": "Cheers cafe and restaurant (تشيرز كافيه ومطعم)",
        "description": "تشيرز كافيه ومطعم يقدم خدمة محترمة.",
        "category": "مقاهي ومطاعم",
        "tags": ["cheers", "تشيرز", "كافيه", "مطعم"],
        "userId": "google_maps_import_user",
        "city": "كوم حماده",
        "location": {"lat": 30.76125, "lon": 30.71189},
        "createdAt": "2024-05-21T10:00:00Z",
        "embedding_text": "Cheers cafe and restaurant (تشيرز كافيه ومطعم) تشيرز كافيه ومطعم يقدم خدمة محترمة. cheers تشيرز كافيه مطعم",
        "phone": "null",
        "sub_category": "كافيه ومطعم"
    }
]
# ---- Prepare batch points ----
points = []
for service in services:
    embedding = get_text_embedding(service["embedding_text"])

    payload = {
        "id": service["id"],
        "name": service["name"],
        "description": service["description"],
        "phone": service.get("phone", ""),
        "category": service["category"],
        "sub_category": service.get("sub_category", ""),
        "tags": service["tags"],
        "userId": service["userId"],
        "city": service["city"],
        "location": {
            "lat": service["location"]["lat"],
            "lon": service["location"]["lon"]
        },
        "createdAt": service["createdAt"]
    }

    point = PointStruct(
        id=str(uuid.uuid4()),
        vector={"embedding_text": embedding},  # ✅ match collection config
        payload=payload
    )
    points.append(point)

# ---- Upsert batch into Qdrant ----
if points:
    qdrant.upsert(
        collection_name=collection_name,
        wait=True,
        points=points
    )
    print(
        f"✅ Inserted {len(points)} services into Qdrant collection '{collection_name}'")
