from fastapi import FastAPI, Request, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.services.translator import translate_text

app = FastAPI(
    title="AI Language Translator",
    description="Translate text using Gemini AI",
    version="1.0.0"
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request
        }
    )


@app.post("/translate")
async def translate(
    text: str = Form(...),
    source_language: str = Form(...),
    target_language: str = Form(...)
):
    result = translate_text(
        text=text,
        source_language=source_language,
        target_language=target_language
    )
    return {
        "translated_text": result["translated_text"],
        "detected_language": result.get("detected_language")
    }