# 🌍 AI Translator

An AI-powered language translator with a premium, glassmorphism-styled frontend and a FastAPI backend powered by **Google Gemini**. Enter text, pick a source and target language (or let it auto-detect), and get an instant translation.

---
## 🚀 Live Demo

You can access the deployed application here:

👉 **https://your-render-url.onrender.com**

No installation is required—just open the link in your browser and start translating text instantly.

## ✨ Features

- Translate between **10 languages** (English, Urdu, French, German, Spanish, Arabic, Hindi, Chinese, Japanese, Korean) plus **Auto Detect**
- AI-powered translation using **Gemini 2.5 Flash**
- Detected-language badge when source is set to Auto Detect
- Swap, clear, copy-to-clipboard, and live character counter
- Toast notifications, loading states, and smooth micro-interactions
- Light/dark mode toggle
- Fully responsive (desktop, tablet, mobile)
- Built with plain **HTML5 / CSS3 / vanilla JavaScript** — no frontend framework

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Jinja2 |
| AI Engine | Google Gemini API (`google-genai`) |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Env config | python-dotenv |
| Server | Uvicorn |

---

## 📁 Project Structure

```
project-root/
├── main.py                  # FastAPI app, routes, server entry point
├── .env                     # Environment variables (not committed)
├── requirements.txt         # Python dependencies
└── app/
    ├── services/
    │   └── translator.py    # Gemini API call + prompt logic
    ├── static/
    │   ├── style.css        # All styling (glassmorphism, themes, animations)
    │   └── script.js        # All frontend interactivity + fetch to /translate
    └── templates/
        └── index.html       # Main page (Jinja2 template)
```

⚠️ This structure is **required as-is** — `main.py` references `app/static`, `app/templates`, and `app.services.translator` by these exact paths. If any file is in the wrong folder, the server will fail to start or return 404s.

---

## ⚙️ Setup

### 1. Clone and enter the project

```bash
git clone <your-repo-url>
cd project-root
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install fastapi uvicorn jinja2 python-multipart python-dotenv google-genai
```

Or, if you have a `requirements.txt`:

```bash
pip install -r requirements.txt
```

**requirements.txt** (create this file if you don't have one):

```
fastapi
uvicorn
jinja2
python-multipart
python-dotenv
google-genai
```

> 🔑 `python-multipart` is easy to miss but **required** — FastAPI needs it to parse the form data sent by the Translate button. Without it, every translation request fails silently on the backend.

### 4. Add your Gemini API key

Create a `.env` file in the project root (same folder as `main.py`):

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a key from [Google AI Studio](https://aistudio.google.com/).

---

## ▶️ Running the app

```bash
uvicorn main:app --reload
```

Then open your browser to:

```
http://127.0.0.1:8000
```

⚠️ Always load the app through this URL. Do **not** open `index.html` directly as a file (`file:///...`) and do **not** use a separate tool like VS Code's Live Server — the page must be served *by FastAPI itself* so that `/static/...` assets and the `/translate` request resolve to the same server.

Interactive API docs (Swagger UI) are available at:

```
http://127.0.0.1:8000/docs
```

---

## 🔌 API Reference

### `POST /translate`

Translates text using Gemini AI.

**Request** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `text` | string | The text to translate |
| `source_language` | string | e.g. `"Auto Detect"`, `"English"`, `"Urdu"` |
| `target_language` | string | e.g. `"French"` |

**Response** — `application/json`

```json
{
  "translated_text": "Bonjour, comment ça va ?",
  "detected_language": "English"
}
```

`detected_language` is only meaningful when `source_language` was `"Auto Detect"`.

---

## 🛠️ Troubleshooting

**"Translation failed" toast on every request**
- Confirm `python-multipart` is installed (`pip install python-multipart`).
- Confirm `GEMINI_API_KEY` is set correctly in `.env`, and that `.env` sits in the same directory you run `uvicorn` from.
- Check the terminal running `uvicorn` for a Python traceback — that will show the real server-side error, which never appears in the browser console.

**Server won't start / `TemplateNotFound` or directory errors**
- Double-check the folder structure above exactly matches — `app/templates/index.html`, `app/static/style.css`, `app/static/script.js`, `app/services/translator.py`.

**It works in one browser but not another**
- Browser extensions (Grammarly, SEO toolbars, ad blockers, etc.) can inject scripts that interfere with `fetch()` requests on `localhost`. Test in an Incognito window first — if it works there, disable extensions for `localhost`/`127.0.0.1` one at a time to find the culprit.

**Frontend seems to "work" even with the server off**
- You're probably opening `index.html` directly as a file instead of via `http://127.0.0.1:8000`. Relative paths like `/translate` and `/static/script.js` only resolve correctly when the page is served by FastAPI.

**Changes to `script.js` or `style.css` don't show up**
- Hard refresh with `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac), or open DevTools → Network tab → check "Disable cache" → reload.

---

## 👤 Credits

Built with ❤️ by **Tayyab Saeed**