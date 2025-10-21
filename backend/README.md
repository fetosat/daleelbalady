# Daleel Balady AI Backend

An AI-powered chat backend for **Daleel Balady (دليل بلدي)** — a smart assistant that helps users find jobs, services, and professionals in their city.
The backend combines **Google Gemini AI**, **FastAPI (Python) for vector search**, and **Socket.IO for realtime chat**.

---

## ✨ Features

* 🤖 **Friendly AI Assistant** (Arabic + English support).
* 🔍 **Category & Service Search** using vector search in Python (FastAPI).
* 📍 **Location-Aware Queries** – AI requests the user’s location if needed.
* 🔄 **Recursive AI Calls** – conversation context (user + AI + function results) is maintained.
* ⚡ **Realtime Communication** with Socket.IO (perfect for chat UIs).
* 🛠 **Modular Handlers** (`ai-magic.js`, `handle_ai.js`, helpers, etc.).

---

## 📂 Project Structure

```
daleelbalady-ai-backend/
├── server.js              # Express + Socket.IO entry point
├── handler/
│   ├── ai-magic.js        # Wrapper for Gemini API (function-calling JSON)
│   ├── handle_ai.js       # Main recursive AI handler (conversation loop)
│   ├── ai-helpers.js      # Helpers to format model + function replies
│   └── ai-rules.js        # (Optional) Rules & generators for structured inputs
├── python/
│   ├── api.py             # FastAPI search backend (vector search)
│   ├── BGE-ONNX.py        # Example: embedding model with ONNX Runtime
│   └── models/            # (Optional) embeddings, DB models, etc.
├── package.json
├── requirements.txt       # Python dependencies
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

### 1. Clone repo

```bash
git clone https://github.com/yourusername/daleelbalady-ai-backend.git
cd daleelbalady-ai-backend
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup environment

Create a `.env` file:

```ini
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 5. Start servers

* Start FastAPI (Python search API):

```bash
python3 python/api.py
```

* Start Express + Socket.IO:

```bash
npm run dev
```

---

## 🔌 How It Works

1. **Frontend (chatbox)** sends user messages over Socket.IO → `user_message`.
2. **`handle_ai.js`** builds/updates the conversation context.
3. **`ai-magic.js`** sends the context to Gemini:

   * If AI decides to **chat only** → function = `reply_to_user`.
   * If AI decides to **search** → function = `query_category`.
4. If `query_category`:

   * Calls the Python FastAPI `/search` endpoint.
   * Adds results back into the conversation.
   * AI summarizes & replies to user in a short, friendly style.
5. If location is missing:

   * AI requests location → backend emits `request_location`.
   * Frontend responds with `location_response`.
6. Final reply is sent as **JSON → parsed to chat messages**.

---

## 🧩 Example Conversation Flow

**User:** "عايز دكتور عيون"
**AI:** (function call → `query_category`)
**Python API:** returns list of ophthalmologists in "كوم حماده".
**AI:** "تمام ✅ لقيتلك دكتور عيون: د. أحمد منصور 👨‍⚕️ 📞 01012345678.
تحب أشوفلك كمان دكاترة؟"

---

## 🗂 Files Explained

* **server.js** → Main server (Express + Socket.IO).
* **ai-magic.js** → Calls Gemini with structured prompt, expects JSON back.
* **handle\_ai.js** → Orchestrates conversation, recursive AI → function → AI flow.
* **ai-helpers.js** → Helper utilities to wrap replies into `contents[]`.
* **ai-rules.js** → Extra formatting rules for AI inputs/outputs.
* **python/api.py** → FastAPI search service.
* **python/BGE-ONNX.py** → Example: load embeddings with ONNX Runtime.

---

## 🔮 Roadmap

* [ ] Frontend chatbox (React/Vue/Svelte) with Socket.IO client.
* [ ] Improve embedding model + DB indexing for faster search.
* [ ] Add caching for repeated queries.
* [ ] Multi-city / GPS precision search.

---

## 📜 License

MIT License – free to use, modify, and distribute.

---

💡 Built with love for **Daleel Balady** 🌍
