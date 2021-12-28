from typing import Optional

from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from django.http import Http404
from django.shortcuts import get_object_or_404
from ninja import Router
from oauthlib.common import generate_token
from oauthlib.oauth2 import rfc6749

from . import jwt, models, schemas, spotify
from .schemas import URL

router = Router()


@router.get("", response=URL, url_name="auth")
def get_spotify_user_authorization_url(request, game_code: Optional[str] = None):
    state = generate_token()

    if game_code:
        state = f"{state}:{game_code}"

    return spotify.create_spotify_oauth2_url(state=state)


@router.post("", response=schemas.AuthorizationResponse, url_name="auth")
def verify_spotify_authorization(request, code: str, state: str):
    try:
        spotify_token = spotify.get_spotify_token_from_callback(callback_code=code)
        session = spotify.create_spotify_session_with_token(spotify_token=spotify_token)
        response = session.get("https://api.spotify.com/v1/me")
    except rfc6749.errors.InvalidGrantError as e:
        raise Http404(e.error)

    spotify_user = schemas.SpotifyProfile(**response.json())
    include = {"username", "email"}
    owner, owner_created = User.objects.get_or_create(**spotify_user.dict(include=include))

    try:
        token, token_created = models.SpotifyToken.objects.get_or_create(
            owner=owner, **spotify_token.dict()
        )
    except IntegrityError as e:
        models.SpotifyToken.objects.filter(owner=owner).update(**spotify_token.dict())
        token = get_object_or_404(models.SpotifyToken, owner=owner)
        token_created = False
        token.save()

    verified_user = schemas.User.from_orm(owner)

    jwt_token = jwt.create_access_token(verified_user=verified_user)

    return schemas.AuthorizationResponse(user=verified_user, jwt=jwt_token, state=state)


@router.get("callback")
def callback_debugger(request, code: str, state: str):
    print(code)
    print(state)
    return code
