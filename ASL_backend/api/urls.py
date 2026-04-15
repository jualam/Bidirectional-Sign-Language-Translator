from django.urls import path
from .views import english_to_asl, hello
from .asl_to_english import asl_to_english

urlpatterns = [
    path("hello/", hello, name="hello"),
    path("asl-to-english/", asl_to_english, name="asl-to-english"),
    path("english-to-asl/", english_to_asl, name="english-to-asl"),
]
