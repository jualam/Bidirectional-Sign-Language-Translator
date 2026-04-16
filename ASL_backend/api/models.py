from django.db import models


class ASLVideo(models.Model):
    class Kind(models.TextChoices):
        WORD = "word", "Word"
        LETTER = "letter", "Letter"

    token = models.CharField(max_length=80)
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.WORD)
    video = models.FileField(upload_to="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["kind", "token"],
                name="unique_asl_video_kind_token",
            )
        ]
        ordering = ["kind", "token"]

    def save(self, *args, **kwargs):
        self.token = self.token.lower().strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.kind}: {self.token}"
