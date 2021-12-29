from django.apps import AppConfig


class PlayApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "play_api"

    def ready(self):
        from . import signals
