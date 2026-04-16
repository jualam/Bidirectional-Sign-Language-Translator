from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services import build_translation_sequence


@api_view(["GET"])
def hello(request):
    return Response(
        {
            "message": "Backend is working",
            "status": "ok",
        }
    )


@api_view(["POST"])
def english_to_asl(request):
    text = request.data.get("text", "")
    if not isinstance(text, str) or not text.strip():
        return Response(
            {
                "message": "Provide English text to translate.",
                "words": [],
                "sequence": [],
                "missing_words": [],
                "missing_letters": [],
            },
            status=400,
        )

    result = build_translation_sequence(text)
    return Response(
        {
            "message": "English to ASL translation sequence generated.",
            **result,
        }
    )
