from rest_framework.decorators import api_view
from rest_framework.response import Response


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
    texts = request.data.get("texts", [])
    return Response({"message": "English to ASL placeholder", "texts": texts})
