from django.db.models.signals import post_save
from django.dispatch import receiver
from auth_api import models as auth_models
from . import tasks


@receiver(post_save, sender=auth_models.SpotifyToken)
def update_user_assets(sender, instance, created, **kwargs):
    status = tasks.get_users_top_data.delay(owner_id=instance.owner.id)  # TODO: rename function?
