from django.core.management.base import BaseCommand
from api.services import sync_asset_videos
"""
cd ASL_backend
.\venv\Scripts\python.exe manage.py sync_asl_videos
What it does:

Looks inside settings.BASE_VIDEO_PATH
Finds video files.
Reads the filename.
Creates or updates an ASLVideo database row.
For your current files:

words/hello.mp4
words/yes.mp4
it created:

word hello words/hello.mp4
word yes words/yes.mp4
This is the command you should run every time you add new videos.
"""
class Command(BaseCommand):
    help = "Sync local videos from ASL_backend/assets into the ASLVideo database table."

    def handle(self, *args, **options):
        result = sync_asset_videos()
        self.stdout.write(
            self.style.SUCCESS(
                f"Synced ASL videos: {result['created']} created, {result['updated']} updated."
            )
        )
        if result["skipped"]:
            self.stdout.write(f"Skipped unsupported filenames: {', '.join(result['skipped'])}")
