import pytest
from . import schemas
from auth_api import jwt
import auth_api
from django.urls import reverse


@pytest.fixture
def route():
    return reverse("api-1.0.0:profile")


@pytest.fixture
def spotify_public_profile_response():
    response = {
        "display_name": "Kevin",
        "external_urls": {"spotify": "https://open.spotify.com/user/run2dos"},
        "followers": {"href": None, "total": 1},
        "href": "https://api.spotify.com/v1/users/run2dos",
        "id": "run2dos",
        "images": [
            {
                "height": None,
                "url": "https://i.scdn.co/image/ab6775700000ee85004a552710e8ae74d71aa0dc",
                "width": None,
            }
        ],
        "type": "user",
        "uri": "spotify:user:run2dos",
    }
    return response


def test_spotify_public_profile_schema(spotify_public_profile_response):
    user = schemas.SpotifyPublicProfile(**spotify_public_profile_response)
    assert user.uri == "spotify:user:run2dos"
    assert user.type == "user"
    assert user.external_urls.scheme == "https"
    assert user.external_urls.path == "/user/run2dos"
    assert user.external_urls.query == None
    assert user.followers == 1


@pytest.mark.skip(reason="limit calls to spotify api.")
def test_public_profile_route(db, client, route, django_user_model):
    verified_user = auth_api.schemas.User(id=1, username="run2dos")
    user = django_user_model.objects.create_user(
        id=1, username="run2dos", email="run2dos@gmail.com"
    )
    token = jwt.create_access_token(verified_user=verified_user)
    headers = {"HTTP_AUTHORIZATION": f"Bearer {token.access_token}"}
    response = client.get(route, format="json", **headers)

    assert route == "/api/profile"
    assert response.json().get("username") == "run2dos"
    assert response.json().get("display_name") == "Kevin"
    assert response.json().get("country") == None
    assert response.json().get("email") == None
    assert response.json().get("premium") == None
    assert response.json().get("followers") == 1
    assert response.json().get("type") == "user"
    assert response.json().get("uri") == "spotify:user:run2dos"
