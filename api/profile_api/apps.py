from django.apps import AppConfig


class ProfileApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "profile_api"

    def ready(self):
        import profile_api.signals
