import json
from urllib import error, request as urllib_request

from PIL import Image
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from ultralytics import YOLO

from .services import build_translation_sequence


# Local Ollama server endpoint
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "llama3.1:8b"


def _post_to_ollama(prompt):
    payload = json.dumps(
        {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
        }
    ).encode("utf-8")
    request = urllib_request.Request(
        OLLAMA_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib_request.urlopen(request, timeout=30) as response:
            body = json.loads(response.read().decode("utf-8"))
    except (error.URLError, TimeoutError, json.JSONDecodeError):
        return None
    return body.get("response", "").strip() or None


def asl_signs_to_english_text(recognized_signs, conversation_context=""):
    cleaned_signs = [sign.strip() for sign in recognized_signs if isinstance(sign, str) and sign.strip()]
    if not cleaned_signs:
        return {
            "translation": "",
            "used_llm": False,
            "prompt": None,
        }

    if len(cleaned_signs) == 1:
        return {
            "translation": cleaned_signs[0],
            "used_llm": False,
            "prompt": None,
        }

    prompt = f"""You are assisting an ASL-to-English translation system.
Input will be a sequence of recognized ASL sign meanings and optional conversational context.
Your task is to produce the most likely natural English translation.

Rules:
- Use the recognized sign meanings as the primary source of truth.
- Use conversational context only to resolve ambiguity or improve fluency.
- Preserve intended meaning, not literal ASL word order.
- Output clear, grammatically correct English.
- Do not add information not supported by the signs or context.
- If confidence is low, prefer the simplest faithful interpretation.
- Return only one natural English sentence or phrase.

Recognized signs: {json.dumps(cleaned_signs)}
Conversation context: {conversation_context or "None"}"""

    llm_text = _post_to_ollama(prompt)
    return {
        "translation": llm_text or " ".join(cleaned_signs),
        "used_llm": bool(llm_text),
        "prompt": prompt,
    }


def english_text_to_asl_plan(text, conversation_context=""):
    prompt = f"""You are assisting an English-to-ASL translation system.
Your task is to convert an English sentence into a concise ASL-ready sign sequence.
These sign tokens will later be matched against sign names stored in the local database.

Rules:
- First identify the core meaning of the sentence.
- Extract the main subject, verb, and object when applicable.
- Remove filler words and unnecessary function words.
- Prefer concept-based translation over word-for-word English order.
- Use conversational context only to choose the most appropriate ASL meaning.
- Return short, semantically faithful output.
- Return JSON with keys subject, verb, object, and asl_sign_sequence.

English text: {text}
Conversation context: {conversation_context or "None"}"""

    llm_text = _post_to_ollama(prompt)
    if llm_text:
        try:
            parsed = json.loads(llm_text)
            if isinstance(parsed, dict):
                sequence = parsed.get("asl_sign_sequence", [])
                if isinstance(sequence, list):
                    parsed["asl_sign_sequence"] = [
                        item.strip().lower()
                        for item in sequence
                        if isinstance(item, str) and item.strip()
                    ]
                    parsed["used_llm"] = True
                    parsed["prompt"] = prompt
                    return parsed
        except json.JSONDecodeError:
            pass

    words = [word.lower() for word in text.split() if word.strip()]
    return {
        "subject": words[0] if words else "",
        "verb": words[1] if len(words) > 1 else "",
        "object": " ".join(words[2:]) if len(words) > 2 else "",
        "asl_sign_sequence": words,
        "used_llm": False,
        "prompt": prompt,
    }


def match_asl_signs_to_videos(sign_sequence):
    # Current placeholder flow:
    # 1.Ollama returns sign tokens.
    # 2.We try to match those tokens against ASLVideo.token.
    # 3.Matchnig rows return the stored video path/url for the frontend.
    # 4.cloudinary can be used too, but this shold be okay to do also
    # TODO: adjust this later
    cleaned_sequence = [
        token.strip().lower()
        for token in sign_sequence
        if isinstance(token, str) and token.strip()
    ]
    return build_translation_sequence(" ".join(cleaned_sequence))


@api_view(["GET"])
def hello(request):
    return Response(
        {
            "message": "Backend is working",
            "status": "ok",
        }
    )


@api_view(["POST"])
@parser_classes([MultiPartParser])
def asl_to_english(request):
    blob_images = request.data.getlist("images", [])
    conversation_context = request.data.get("context", "")
    images = []

    for blob_image in blob_images:
        images.append(Image.open(blob_image))

    model = YOLO("api/model/10-class-no-background.pt")
    results = model(images)

    meanings = []
    seen_classes = []
    for result in results:
        if result.boxes:
            for cls in result.boxes.cls:
                class_id = int(cls)
                if not seen_classes or seen_classes[-1] != class_id:
                    seen_classes.append(class_id)
                    meanings.append(result.names[class_id])

    english_result = asl_signs_to_english_text(meanings, conversation_context)
    return Response(
        {
            "message": "ASL to English translation generated.",
            "recognized_signs": meanings,
            "translation": english_result["translation"],
            "used_llm": english_result["used_llm"],
        }
    )


@api_view(["POST"])
def english_to_asl(request):
    text = request.data.get("text", "")
    conversation_context = request.data.get("context", "")
    if not isinstance(text, str) or not text.strip():
        return Response(
            {
                "message": "Provide English text to translate.",
                "sequence": [],
            },
            status=400,
        )

    translation_plan = english_text_to_asl_plan(text, conversation_context)
    result = match_asl_signs_to_videos(translation_plan["asl_sign_sequence"])
    return Response(
        {
            "message": "English to ASL translation sequence generated.",
            "sequence": result["sequence"],
        }
    )
