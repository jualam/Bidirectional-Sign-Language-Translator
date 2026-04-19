from django.test import TestCase
from rest_framework.test import APIClient

from .models import ASLVideo
from .views import asl_signs_to_english_text, english_text_to_asl_plan


class EnglishToASLTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        ASLVideo.objects.create(
            kind=ASLVideo.Kind.WORD,
            token="hello",
            path="words/hello.mp4",
        )
        ASLVideo.objects.create(
            kind=ASLVideo.Kind.LETTER,
            token="c",
            path="letters/c.MOV",
        )

    def test_returns_word_video_when_word_exists(self):
        response = self.client.post(
            "/api/english-to-asl/",
            {"text": "hello"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["sequence"][0]["token"], "hello")
        self.assertEqual(response.data["sequence"][0]["source"], "word")
        self.assertEqual(response.data["sequence"][0]["path"], "/words/hello.mp4")

    def test_falls_back_to_letter_videos_for_missing_words(self):
        response = self.client.post(
            "/api/english-to-asl/",
            {"text": "cat"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["sequence"][0]["token"], "c")
        self.assertEqual(response.data["sequence"][0]["source"], "fingerspell")
        self.assertEqual(response.data["sequence"][0]["path"], "/letters/c.MOV")


class TranslationHelperTests(TestCase):
    def test_english_text_to_asl_plan_falls_back_to_simple_sequence(self):
        result = english_text_to_asl_plan("I need help")

        self.assertEqual(result["asl_sign_sequence"], ["i", "need", "help"])
        
