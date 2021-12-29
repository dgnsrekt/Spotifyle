from django.db.models.signals import post_save
from django.dispatch import receiver

from profile_api.models import Profile
from .models import PlayerProfile


@receiver(post_save, sender=Profile)
def create_player_profile(sender, instance, created, **kwargs):
    if not created:
        return
    PlayerProfile.objects.create(player_id=instance.user_id)
