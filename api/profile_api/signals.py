from django.db.models.signals import post_save
# from django.contrib.auth.models import User
from django.dispatch import receiver

import auth_api
from auth_api.spotify import create_spotify_session_with_token

from . import schemas
from .models import Profile


@receiver(post_save, sender=auth_api.models.SpotifyToken)
def create_profile(sender, instance, created, **kwargs):
    if not created:
        return

    spotify_token = auth_api.schemas.SpotifyToken.from_orm(instance)
    session = create_spotify_session_with_token(spotify_token=spotify_token)
    # TODO: Need to check if token is still valid after this.
    # Also, need to check on refresh token auto save function.
    response = session.get("https://api.spotify.com/v1/me")
    spotify_profile = auth_api.schemas.SpotifyProfile(**response.json())

    profile = schemas.Profile(user_id=instance.owner.id, **spotify_profile.dict())
    Profile.objects.create(**profile.dict())
