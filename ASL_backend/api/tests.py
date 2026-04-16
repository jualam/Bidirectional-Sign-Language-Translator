from django.test import TestCase
from rest_framework.test import APIClient

from .models import ASLVideo


class EnglishToASLTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        ASLVideo.objects.create(
            kind=ASLVideo.Kind.WORD,
            token="hello",
            video="hello.mp4",
        )
        ASLVideo.objects.create(
            kind=ASLVideo.Kind.LETTER,
            token="c",
            video="c.mp4",
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
        self.assertEqual(response.data["sequence"][0]["url"], "/assets/hello.mp4")

    def test_falls_back_to_letter_videos_for_missing_words(self):
        response = self.client.post(
            "/api/english-to-asl/",
            {"text": "cat"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["missing_words"], ["cat"])
        self.assertEqual(response.data["sequence"][0]["token"], "c")
        self.assertEqual(response.data["sequence"][0]["source"], "fingerspell")
        self.assertIn("a", response.data["missing_letters"])
        self.assertIn("t", response.data["missing_letters"])
