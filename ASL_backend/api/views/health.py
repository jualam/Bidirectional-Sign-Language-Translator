from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response

@api_view(["GET"])
def health(request):
    return Response(
        {
            "message": "Backend is working",
            "status": "ok",
        }
    )