import re
from pathlib import Path
from django.conf import settings
from .models import ASLVideo

WORD_RE = re.compile(r"[a-zA-Z]+")
VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm", ".m4v"}

def normalize_token(value):
    return value.lower().strip()
#This extracts clean English words.
def tokenize_text(text):
    return [normalize_token(match.group(0)) for match in WORD_RE.finditer(text)]

def video_payload(video, source):
    return {
        "id": video.id,
        "token": video.token,
        "kind": video.kind,
        "source": source,
        "url": video.video.url,
    }

def build_translation_sequence(text):
    # This is a temporary matcher for the current prototype.
    # It assumes the LLM returns tokens that can be matched directly to ASLVideo.token.
    # TODO: update this once the final video dataset and token naming rules are decided.
    words = tokenize_text(text)
    sequence = []
    missing_words = []
    missing_letters = []

    word_videos = {
        video.token: video
        for video in ASLVideo.objects.filter(kind=ASLVideo.Kind.WORD, token__in=words)
    }

    requested_letters = sorted({letter for word in words for letter in word})
    letter_videos = {
        video.token: video
        for video in ASLVideo.objects.filter(kind=ASLVideo.Kind.LETTER, token__in=requested_letters)
    }

    for word in words:
        word_video = word_videos.get(word)
        if word_video:
            sequence.append(video_payload(word_video, "word"))
            continue

        missing_words.append(word)
        for letter in word:
            letter_video = letter_videos.get(letter)
            if letter_video:
                sequence.append(video_payload(letter_video, "fingerspell"))
            else:
                missing_letters.append(letter)
                sequence.append(
                    {
                        "id": None,
                        "token": letter,
                        "kind": ASLVideo.Kind.LETTER,
                        "source": "missing-letter",
                        "url": None,
                    }
                )
    return {
        "words": words,
        "sequence": sequence,
        "missing_words": missing_words,
        "missing_letters": sorted(set(missing_letters)),
    }
def sync_asset_videos():
    # This helper is for when local sign videos are added under MEDIA_ROOT
    # such as D:\ASL-Translator\ASL_backend\assets.
    # TODO: revisit if you later store videos differently or rename tokens.
    created = 0
    updated = 0
    skipped = []
    assets_path = Path(settings.MEDIA_ROOT)
    assets_path.mkdir(parents=True, exist_ok=True)

    for path in sorted(assets_path.iterdir()):
        if not path.is_file() or path.suffix.lower() not in VIDEO_EXTENSIONS:
            continue

        token = normalize_token(path.stem)
        if len(token) == 1 and token.isalpha():
            kind = ASLVideo.Kind.LETTER
        elif token.isalpha():
            kind = ASLVideo.Kind.WORD
        else:
            skipped.append(path.name)
            continue

        video, was_created = ASLVideo.objects.update_or_create(
            kind=kind,
            token=token,
            defaults={"video": path.name},
        )
        if was_created:
            created += 1
        else:
            updated += 1

    return {
        "created": created,
        "updated": updated,
        "skipped": skipped,
    }
