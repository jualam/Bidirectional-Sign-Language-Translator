from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ASLVideo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("token", models.CharField(max_length=80)),
                ("kind", models.CharField(choices=[("word", "Word"), ("letter", "Letter")], default="word", max_length=10)),
                ("video", models.FileField(upload_to="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["kind", "token"],
            },
        ),
        migrations.AddConstraint(
            model_name="aslvideo",
            constraint=models.UniqueConstraint(fields=("kind", "token"), name="unique_asl_video_kind_token"),
        ),
    ]
