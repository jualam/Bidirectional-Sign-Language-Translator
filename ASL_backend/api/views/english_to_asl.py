from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser
from rest_framework.response import Response
from ..services import build_translation_sequence
from ..models import ASLVideo
from ollama import chat

OLLAMA_MODEL = "llama3.2:3b"

@api_view(["POST"])
#@parser_classes([FormParser])
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
    
    signs = english_to_signs(text, conversation_context)
    result = match_asl_signs_to_videos(signs)
    
    return Response(
        {
            "message": "English to ASL translation sequence generated.",
            "words": result["words"],
            "sequence": result["sequence"],
            "missing_words": result["missing_words"],
            "missing_letters": result["missing_letters"]
        }
    )

#TODO: store these in the database (maybe)
#TODO: add words here after testing translation
ignore = ['are', 'is', 'am', 'was', 'will', 'to', 'the', 'a', 'an']
replace = {
    "i'm":"i",
    "me":"i",
    "my":"i",
    "your":"you",
    "wasn't":"not"
}
def english_to_signs(text, conversation_context=""):
    words = [word.lower() for word in text.split() if word.strip()]
    signs = []
    for word in words:
        if word in ignore:
            continue
        elif word in replace: 
            signs.append(replace[word])
        else: 
            signs.append(word)  
    return signs
    

def match_asl_signs_to_videos(sign_sequence):
    # 1.Ollama returns sign tokens.
    # 2.We try to match those tokens against ASLVideo.token.
    # 3.Matchnig rows return the stored video path/url for the frontend.
    cleaned_sequence = [
        token.strip().lower()
        for token in sign_sequence
        if isinstance(token, str) and token.strip()
    ]
    return build_translation_sequence(" ".join(cleaned_sequence))
