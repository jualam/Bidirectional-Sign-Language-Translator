from django.urls import path
from .views import asl_to_english, english_to_asl, health

urlpatterns = [
    path("health/", health, name="health"),
    path("asl-to-english/", asl_to_english, name="asl-to-english"),
    path("english-to-asl/", english_to_asl, name="english-to-asl"),
]
