import os
import json
#from click import prompt
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Gemini API Key
API_KEY = os.getenv("GEMINI_API_KEY")

# Create Gemini Client
client = genai.Client(api_key=API_KEY)


def translate_text(text: str, source_language: str, target_language: str):
    """
    Translate text using Gemini AI.

    Args:
        text (str): Text entered by the user.
        source_language (str): Selected source language.
        target_language (str): Selected target language.

    Returns:
        dict:
        {
            "detected_language": "...",
            "translated_text": "..."
        }
    """

    # -----------------------------
    # Create Prompt
    # -----------------------------
    if source_language.lower() == "auto detect":

        prompt = f"""
You are a professional language translator.

Detect the source language automatically.

Translate the following text into {target_language}.

Return ONLY valid JSON.

JSON format:

{{
    "detected_language":"...",
    "translated_text":"..."
}}

Do not write explanations.

Text:

{text}
"""

    else:

        prompt = f"""
You are a professional language translator.

Translate the following text from {source_language} to {target_language}.

Return ONLY valid JSON.

JSON format:

{{
    "detected_language":"{source_language}",
    "translated_text":"..."
}}

Do not write explanations.

Text:

{text}
"""

    # -----------------------------
    # Call Gemini
    # -----------------------------
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    # -----------------------------
    # Parse JSON Response
    # -----------------------------
    response_text = response.text.strip()

    # Remove Markdown code fences if present
    if response_text.startswith("```json"):
        response_text = response_text.replace("```json", "")
        response_text = response_text.replace("```", "")
        response_text = response_text.strip()

    result = json.loads(response_text)

    return result
   