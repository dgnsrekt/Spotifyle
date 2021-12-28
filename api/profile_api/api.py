from django.contrib.auth.models import User
from django.http import Http404
from django.shortcuts import get_object_or_404
from ninja import Router

from auth_api import spotify

from . import models, schemas

SPOTIFY_PUBLIC_USER_URL = "https://api.spotify.com/v1/users/{username}"


router = Router()


@router.get("", response=schemas.SpotifyPublicProfile, url_name="profile")
def get_users_public_profile_information(request, username):
    session = spotify.create_spotify_backend_session()
    url = SPOTIFY_PUBLIC_USER_URL.format(username=username)
    response = session.get(url)
    if not response.ok:
        raise Http404("Profile Not Found.")
    return response.json()


@router.get("/me", response=schemas.Profile, url_name="me")
def get_current_users_profile(request):
    user = get_object_or_404(User, username=request.auth.username)
    return user.profile


@router.put("/me", response=schemas.Profile, url_name="me")
def update_current_users_profile(request, profile_update: schemas.UpdateProfile):
    user = get_object_or_404(User, username=request.auth.username)
    models.Profile.objects.filter(user=user).update(**profile_update.dict())
    return user.profile
