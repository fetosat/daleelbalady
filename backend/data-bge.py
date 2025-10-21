import torch
from transformers import AutoTokenizer, AutoModel
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
import uuid

# ---- Load BGE-M3 model ----
model_name = "BAAI/bge-m3"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(
    model_name,
    device_map="auto",          # GPU if available, fallback CPU
    torch_dtype=torch.float16   # use fp16 for efficiency
)

def get_text_embedding(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(model.device)
    with torch.no_grad():
        embeddings = model(**inputs).last_hidden_state[:, 0]  # CLS token
        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
    return embeddings.cpu().numpy()[0].astype("float32")

# ---- Connect to Qdrant ----
qdrant = QdrantClient("http://localhost:6333")
collection_name = "services-bge"

# ---- Example array of services ----
services = [
    {
      "id": "GM_HEALTH_001",
      "name": "مركز د.رامي أبو خطوه",
      "description": "مركز متخصص في أمراض النساء والتوليد بإدارة الدكتور رامي أبو خطوه.",
      "tags": [
        "نساء وتوليد",
        "مركز طبي",
        "رامي أبو خطوه",
        "طبيب"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "مركز د.رامي أبو خطوه مركز متخصص في أمراض النساء والتوليد بإدارة الدكتور رامي أبو خطوه. نساء وتوليد مركز طبي رامي أبو خطوه طبيب",
      "phone": "null"
    },
    {
      "id": "GM_HEALTH_002",
      "name": "عيادة دكتور رائد فكيه العبد",
      "description": "عيادة متخصصة في جراحة الأعصاب للدكتور رائد فكيه العبد.",
      "tags": [
        "جراحة أعصاب",
        "عيادة",
        "رائد فكيه العبد",
        "طبيب"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة دكتور رائد فكيه العبد عيادة متخصصة في جراحة الأعصاب للدكتور رائد فكيه العبد. جراحة أعصاب عيادة رائد فكيه العبد طبيب",
      "phone": "+201025196646",

    },
    {
      "id": "GM_HEALTH_003",
      "name": "عيادة د/ رضا تميم لجراحة الأوعية الدموية والجراحة العامة",
      "description": "عيادة استشاري أول جراحة الأوعية الدموية والجراحة العامة الدكتور رضا تميم.",
      "tags": [
        "جراحة أوعية دموية",
        "جراحة عامة",
        "عيادة",
        "رضا تميم",
        "استشاري"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة د/ رضا تميم لجراحة الأوعية الدموية والجراحة العامة عيادة استشاري أول جراحة الأوعية الدموية والجراحة العامة الدكتور رضا تميم. جراحة أوعية دموية جراحة عامة عيادة رضا تميم استشاري",
      "phone": "+20453681821",

    },
    {
      "id": "GM_HEALTH_004",
      "name": "مستشفي مركز مكة الطبي",
      "description": "مستشفى ومركز طبي متكامل يقدم خدمات طبية متنوعة على مدار الساعة.",
      "tags": [
        "مستشفى",
        "مركز طبي",
        "مكة",
        "طوارئ",
        "رعاية صحية"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "مستشفي مركز مكة الطبي مستشفى ومركز طبي متكامل يقدم خدمات طبية متنوعة على مدار الساعة. مستشفى مركز طبي مكة طوارئ رعاية صحية",
      "phone": "+20453681371",

    },
    {
      "id": "GM_HEALTH_005",
      "name": "مستشفى كوم حماده العام",
      "description": "المستشفى العام لمركز ومدينة كوم حمادة، يقدم خدمات طبية شاملة.",
      "tags": [
        "مستشفى",
        "حكومي",
        "عام",
        "كوم حماده",
        "طوارئ"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "مستشفى كوم حماده العام المستشفى العام لمركز ومدينة كوم حمادة، يقدم خدمات طبية شاملة. مستشفى حكومي عام كوم حماده طوارئ",
      "phone": "+20453680007",

    },
    {
      "id": "GM_HEALTH_006",
      "name": "عيادة السمنة د.أحمد محمد عبده",
      "description": "عيادة متخصصة في علاج السمنة وتنسيق القوام بإشراف الدكتور أحمد محمد عبده.",
      "tags": [
        "سمنة",
        "تغذية",
        "تخسيس",
        "عيادة",
        "أحمد عبده"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة السمنة د.أحمد محمد عبده عيادة متخصصة في علاج السمنة وتنسيق القوام بإشراف الدكتور أحمد محمد عبده. سمنة تغذية تخسيس عيادة أحمد عبده",
      "phone": "+201068768285",

    },
    {
      "id": "GM_HEALTH_007",
      "name": "عيادة دكتور كرم بكار",
      "description": "عيادة متخصصة في الأمراض الباطنة للدكتور كرم بكار.",
      "tags": [
        "باطنة",
        "عيادة",
        "كرم بكار",
        "طبيب"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة دكتور كرم بكار عيادة متخصصة في الأمراض الباطنة للدكتور كرم بكار. باطنة عيادة كرم بكار طبيب",
      "phone": "+201284148038",

    },
    {
      "id": "GM_HEALTH_008",
      "name": "عيادة الدكتور مجدي ابوالفضل",
      "description": "عيادة طبية عامة للدكتور مجدي ابوالفضل.",
      "tags": [
        "طبيب",
        "عيادة",
        "مجدي ابوالفضل",
        "رعاية عامة"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة الدكتور مجدي ابوالفضل عيادة طبية عامة للدكتور مجدي ابوالفضل. طبيب عيادة مجدي ابوالفضل رعاية عامة",
      "phone": "+201060228958",

    },
    {
      "id": "GM_HEALTH_009",
      "name": "عيادة الدكتور حمدي عطية",
      "description": "عيادة متخصصة في طب الأطفال للدكتور حمدي عطية.",
      "tags": [
        "أطفال",
        "عيادة",
        "حمدي عطية",
        "طبيب"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة الدكتور حمدي عطية عيادة متخصصة في طب الأطفال للدكتور حمدي عطية. أطفال عيادة حمدي عطية طبيب",
      "phone": "null",

    },
    {
      "id": "GM_HEALTH_010",
      "name": "عيادة دكتور محمد سمير الدسوقي",
      "description": "عيادة طبية عامة للدكتور محمد سمير الدسوقي.",
      "tags": [
        "طبيب",
        "عيادة",
        "محمد سمير الدسوقي"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة دكتور محمد سمير الدسوقي عيادة طبية عامة للدكتور محمد سمير الدسوقي. طبيب عيادة محمد سمير الدسوقي",
      "phone": "+201005546461",

    },
    {
      "id": "GM_HEALTH_011",
      "name": "عيادة الدكتور أسامة الأجهوري لأمراض الباطنة والكبد",
      "description": "عيادة متخصصة في أمراض الباطنة والكبد والحميات ومناظير الجهاز الهضمي.",
      "tags": [
        "باطنة",
        "كبد",
        "حميات",
        "مناظير",
        "جهاز هضمي",
        "أسامة الأجهوري"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة الدكتور أسامة الأجهوري لأمراض الباطنة والكبد عيادة متخصصة في أمراض الباطنة والكبد والحميات ومناظير الجهاز الهضمي. باطنة كبد حميات مناظير جهاز هضمي أسامة الأجهوري",
      "phone": "+201003667072",

    },
    {
      "id": "GM_HEALTH_012",
      "name": "عيادة دكتور وليد عريقات (Dahab derma clinic)",
      "description": "عيادة متخصصة في الأمراض الجلدية والتجميل للدكتور وليد عريقات.",
      "tags": [
        "جلدية",
        "تجميل",
        "عيادة",
        "وليد عريقات",
        "dahab derma"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة دكتور وليد عريقات (Dahab derma clinic) عيادة متخصصة في الأمراض الجلدية والتجميل للدكتور وليد عريقات. جلدية تجميل عيادة وليد عريقات dahab derma",
      "phone": "+201094728594",

    },
    {
      "id": "GM_HEALTH_013",
      "name": "مركز رسم الاعصاب والعضلات د / محمد صبحى",
      "description": "مركز متخصص في رسم الأعصاب والعضلات بإدارة الدكتور محمد صبحى.",
      "tags": [
        "رسم أعصاب",
        "رسم عضلات",
        "فسيولوجيا عصبية",
        "مركز طبي",
        "محمد صبحى"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "مركز رسم الاعصاب والعضلات د / محمد صبحى مركز متخصص في رسم الأعصاب والعضلات بإدارة الدكتور محمد صبحى. رسم أعصاب رسم عضلات فسيولوجيا عصبية مركز طبي محمد صبحى",
      "phone": "+201014176511",

    },
    {
      "id": "GM_HEALTH_014",
      "name": "مستشفي الأندلس التخصصي",
      "description": "مستشفى الأندلس التخصصي يقدم خدمات طبية متنوعة ورعاية صحية متكاملة.",
      "tags": [
        "مستشفى",
        "الأندلس",
        "تخصصي",
        "رعاية صحية"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "مستشفي الأندلس التخصصي مستشفى الأندلس التخصصي يقدم خدمات طبية متنوعة ورعاية صحية متكاملة. مستشفى الأندلس تخصصي رعاية صحية",
      "phone": "+20453685500",

    },
    {
      "id": "GM_HEALTH_015",
      "name": "مركز الدكتور يونس السعيد للنساء والتوليد",
      "description": "مركز المدينة للدكتور يونس السعيد، متخصص في أمراض النساء والتوليد.",
      "tags": [
        "نساء وتوليد",
        "مركز طبي",
        "يونس السعيد",
        "المدينة"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "مركز الدكتور يونس السعيد للنساء والتوليد مركز المدينة للدكتور يونس السعيد، متخصص في أمراض النساء والتوليد. نساء وتوليد مركز طبي يونس السعيد المدينة",
      "phone": "+20453694570",

    },
    {
      "id": "GM_HEALTH_016",
      "name": "مستشفى الحجاز التخصصى",
      "description": "مستشفى الحجاز التخصصي يقدم خدمات طبية متنوعة بما في ذلك لمرضى التأمين الصحي.",
      "tags": [
        "مستشفى",
        "الحجاز",
        "تخصصي",
        "تأمين صحي"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "مستشفى الحجاز التخصصى مستشفى الحجاز التخصصي يقدم خدمات طبية متنوعة بما في ذلك لمرضى التأمين الصحي. مستشفى الحجاز تخصصي تأمين صحي",
      "phone": "+20453682149",

    },
    {
      "id": "GM_HEALTH_017",
      "name": "عيادة د. حمدي حبيبه لطب الأطفال وحديثي الولاده",
      "description": "عيادة متخصصة في طب ورعاية الأطفال وحديثي الولادة بإدارة الدكتور حمدي حبيبه.",
      "tags": [
        "أطفال",
        "حديثي الولادة",
        "عيادة",
        "حمدي حبيبه"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة د. حمدي حبيبه لطب الأطفال وحديثي الولاده عيادة متخصصة في طب ورعاية الأطفال وحديثي الولادة بإدارة الدكتور حمدي حبيبه. أطفال حديثي الولادة عيادة حمدي حبيبه",
      "phone": "+201002709847",

    },
    {
      "id": "GM_HEALTH_018",
      "name": "عيادة الدكتور ايمن البطران استشاري العظام والكسور",
      "description": "عيادة متخصصة في جراحة العظام وعلاج الكسور بإدارة الاستشاري الدكتور أيمن البطران.",
      "tags": [
        "عظام",
        "كسور",
        "جراحة العظام",
        "عيادة",
        "ايمن البطران"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "عيادة الدكتور ايمن البطران استشاري العظام والكسور عيادة متخصصة في جراحة العظام وعلاج الكسور بإدارة الاستشاري الدكتور أيمن البطران. عظام كسور جراحة العظام عيادة ايمن البطران",
      "phone": "null",

    },
    {
      "id": "GM_HEALTH_019",
      "name": "مركز الصفوه الطبي",
      "description": "مركز الصفوة الطبي يقدم خدمات طبية متنوعة.",
      "tags": [
        "مركز طبي",
        "الصفوة",
        "عيادات"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "مركز الصفوه الطبي مركز الصفوة الطبي يقدم خدمات طبية متنوعة. مركز طبي الصفوة عيادات",
      "phone": "+201023710267",

    },
    {
      "id": "GM_HEALTH_020",
      "name": "مركز الحياة الأفضل للتخاطب والصحة النفسية",
      "description": "مركز متخصص في خدمات التخاطب، الصحة النفسية، والتكامل الحسي.",
      "tags": [
        "تخاطب",
        "صحة نفسية",
        "تكامل حسي",
        "مركز"
      ],
      "userId": "google_maps_import_user",
      "city": "كوم حماده",
      "location": {
        "lat": 30.76125,
        "lon": 30.71189
      },
      "createdAt": "2024-05-21T10:00:00Z",
      "embedding_text": "مركز الحياة الأفضل للتخاطب والصحة النفسية مركز متخصص في خدمات التخاطب، الصحة النفسية، والتكامل الحسي. تخاطب صحة نفسية تكامل حسي مركز",
      "phone": "+201033978080",

    }
  ]
# ---- Prepare points for Qdrant ----
points = []
for service in services:
    embedding = get_text_embedding(service["embedding_text"])

    payload = {
        "id": service["id"],
        "name": service["name"],
        "description": service["description"],
        "phone": service.get("phone", ""),
        "tags": service["tags"],
        "userId": service["userId"],
        "city": service["city"],
        "location": service["location"],
        "createdAt": service["createdAt"]
    }

    point = PointStruct(
        id=str(uuid.uuid4()),
        vector={"embedding_text": embedding},  # ✅ match Qdrant vector name
        payload=payload
    )
    points.append(point)

# ---- Insert batch into Qdrant ----
if points:
    qdrant.upsert(
        collection_name=collection_name,
        wait=True,
        points=points
    )
    print(f"✅ Inserted {len(points)} services into Qdrant collection '{collection_name}'")
