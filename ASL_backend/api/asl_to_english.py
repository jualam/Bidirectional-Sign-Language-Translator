from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from PIL import Image
from ultralytics import YOLO

@api_view(["POST"])
@parser_classes([MultiPartParser])
def asl_to_english(request):
    blob_images = request.data.getlist("images", [])
    images = []
    
    for blob_image in blob_images:
        images.append(Image.open(blob_image))
    
    model = YOLO("api/model/10-class-no-background.pt")
    results = model(images)
    
    sentence = []
    meanings = []
    for result in results:
        if result.boxes:
            for cls in result.boxes.cls:
                if len(sentence) == 0:
                    sentence.append(cls)
                    meanings.append(result.names[int(cls)])
                elif not (sentence[-1] == cls):
                    sentence.append(cls)
                    meanings.append(result.names[int(cls)])
        
    
    response = Response({"message": "ASL to English placeholder", "images": meanings})
       
    return response