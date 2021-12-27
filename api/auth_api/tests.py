from urllib.parse import parse_qs, unquote, urlparse

import pytest
from django.urls import reverse

from . import jwt, schemas
from .schemas import URL


@pytest.fixture
def route():
    return reverse("api-1.0.0:auth")


def test_get_spotify_user_authorization_url(client, route):
    assert route == "/api/auth"

    response = client.get(route)
    assert response.status_code == 200

    url = URL(**response.json())
    result = urlparse(url.url)

    assert result.netloc == "accounts.spotify.com"
    assert result.path == "/authorize"

    query = parse_qs(result.query)
    for q in ["response_type", "client_id", "redirect_uri", "scope", "state"]:
        assert query.get(q)


def test_get_spotify_user_authorization_url_with_game_code(client, route):
    game_code = 1234567890
    route = route + f"?game_code={game_code}"
    assert route == "/api/auth?game_code=1234567890"

    response = client.get(route)
    assert response.status_code == 200

    url = URL(**response.json())
    result = urlparse(url.url)

    assert result.netloc == "accounts.spotify.com"
    assert result.path == "/authorize"

    query = parse_qs(result.query)

    for q in ["response_type", "client_id", "redirect_uri", "scope", "state"]:
        assert query.get(q)

    state = query.get("state").pop()
    state, result = state.split(":")
    assert result == str(game_code)


def test_verify_spotify_authorization_with_invalid_grant(client, route):
    code = "AQDkHKBBIaLrRL5q7gzqc94asSRRMiiD3HYpscOkmoPbTXZ4iI9RcjpqkcPH8EDMT1No1upbcv4OaqM2rrlFckD4aLTKBVFS1lPBWX_yjd1xZD9EUNBBR0vtWehNZ2"
    state = "XZ2YjHCxSBQpdpfSyMLeIdmG4FMaRH"
    route = route + f"?code={code}&state={state}"
    response = client.post(route)
    assert response.json() == {"detail": "Not Found"}
    assert response.status_code == 404


@pytest.fixture
def spotify_profile_response():
    response = {
        "country": "US",
        "display_name": "Kevin",
        "email": "run2dos@gmail.com",
        "id": "run2dos",
        "product": "premium",
        "images": [
            {
                "height": None,
                "url": "https://i.scdn.co/image/ab6775700000ee85004a552710e8ae74d71aa0dc",
                "width": None,
            }
        ],
    }
    return response


def test_spotify_profile_schema(spotify_profile_response):
    user = schemas.SpotifyProfile(**spotify_profile_response)
    assert user.username == "run2dos"
    assert user.country == "US"
    assert user.display_name == "Kevin"
    assert user.email == "run2dos@gmail.com"
    assert user.premium == True
    assert user.image == "/image/ab6775700000ee85004a552710e8ae74d71aa0dc"


@pytest.fixture
def create_user(db, django_user_model):
    def make_user(**kwargs):
        return django_user_model.objects.create_user(**kwargs)

    return make_user


def test_jwt_access_token(db, spotify_profile_response, create_user):
    spotify_user = schemas.SpotifyProfile(**spotify_profile_response)
    include = {"username", "email"}
    user = create_user(**spotify_user.dict(include=include))
    verified_user = schemas.User.from_orm(user)
    jwt_token = jwt.create_access_token(verified_user=verified_user)

    assert jwt_token.dict().get("access_token")
    assert jwt_token.token_type == "Bearer"

    jwt_verified_user = jwt.verify_access_token(token=jwt_token)
    assert verified_user == jwt_verified_user

    state = "PCYY2E0s3BorADqeANyx2KyvyVuUeH%3Agame_keinv"

    auth = schemas.AuthorizationResponse(user=verified_user, jwt=jwt_token, state=state)

    assert auth.state == state
    assert auth.game_code == "game_keinv"
