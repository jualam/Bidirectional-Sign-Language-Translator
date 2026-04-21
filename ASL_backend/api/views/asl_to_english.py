from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from PIL import Image
from ultralytics import YOLO
from ollama import chat

OLLAMA_MODEL = "llama3.2:3b"

@api_view(["POST"])
@parser_classes([MultiPartParser])
def asl_to_english(request):
    blob_images = request.data.getlist("images", [])
    conversation_context = request.data.get("context", "")
    
    signs, classes = get_signs_from_images(blob_images);
    english = signs_to_english_text(signs, conversation_context)
    
    return Response(
        {
            "message": "ASL to English translation generated.",
            "recognized_signs": signs,
            "translation": english,
        }
    )

def get_signs_from_images(blob_images):
    images = []

    for blob_image in blob_images:
        images.append(Image.open(blob_image))

    model = YOLO("api/yolo/20-class-no-background.pt")
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
    return (meanings, seen_classes)

def signs_to_english_text(recognized_signs, conversation_context=""):
    cleaned_signs = [sign.strip() for sign in recognized_signs if isinstance(sign, str) and sign.strip()]
    if not cleaned_signs:
        return "";
    system_prompt = "You are assisting an ASL-to-English translation system. \
    Input will be one or more ASL sign meanings and optional conversational context. \
    Output one simple sentence that represents only the meaning of the signs. \
    Do not change I or you."
    
    if len(cleaned_signs) <= 1:
        return " ".join(cleaned_signs)
    
    user_prompt = f"Signs: {' '.join(cleaned_signs)}"
    if (conversation_context):
        user_input += f"\nConversation context: {conversation_context}"

    response = chat(
        model = OLLAMA_MODEL,
        messages = [
            {'role':'system', 'content':system_prompt},
            {'role':'user', 'content': user_prompt}
        ],
        options = {'temperature': 0}
    )
    return response.message.content
