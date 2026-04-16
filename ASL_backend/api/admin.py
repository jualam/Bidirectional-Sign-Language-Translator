from django.contrib import admin
from .models import ASLVideo

@admin.register(ASLVideo)
class ASLVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "token", "kind", "video", "updated_at")
    list_filter = ("kind",)
    search_fields = ("token",)
