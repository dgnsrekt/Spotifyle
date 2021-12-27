import pytest
from . import schemas


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
