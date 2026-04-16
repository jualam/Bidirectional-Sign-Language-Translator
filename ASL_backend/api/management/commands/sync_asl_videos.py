from django.core.management.base import BaseCommand
from api.services import sync_asset_videos
"""
cd ASL_backend
.\venv\Scripts\python.exe manage.py sync_asl_videos
What it does:

Looks inside ASL_backend/assets.
Finds video files.
Reads the filename.
Creates or updates an ASLVideo database row.
For your current files:

hello.mp4
yes.mp4
it created:

word hello hello.mp4
word yes yes.mp4
This is the command you should run every time you add new videos to the assets folder.

Example:

ASL_backend/assets/thank.mp4
ASL_backend/assets/you.mp4
ASL_backend/assets/t.mp4
Then run:

powershell

.\venv\Scripts\python.exe manage.py sync_asl_videos
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
