from ninja import Router
from auth_api import spotify
from . import schemas

SPOTIFY_PUBLIC_USER_URL = "https://api.spotify.com/v1/users/{username}"


router = Router()


@router.get("/me", response=schemas.SpotifyPublicProfile)
def get_users_public_profile_information(request):
    session = spotify.create_spotify_backend_session()
    url = SPOTIFY_PUBLIC_USER_URL.format(username=request.auth.username)
    response = session.get(url)
    return response.json()
