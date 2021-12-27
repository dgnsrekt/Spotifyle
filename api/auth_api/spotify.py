from django.conf import settings
from requests_oauthlib import OAuth2Session
from requests.auth import HTTPBasicAuth
from oauthlib.oauth2 import BackendApplicationClient

from . import schemas

SPOTIFY_CLIENT = settings.SPOTIFY_CLIENT
SPOTIFY_SECRET = settings.SPOTIFY_SECRET
SPOTIFY_REDIRECT = settings.SPOTIFY_REDIRECT

SPOTIFY_REDIRECT = "http://localhost:8000/api/auth/callback"

SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"


def create_spotify_session():
    scope = [
        "user-read-private",
        "user-read-email",
        "user-read-playback-position",
        "user-top-read",
        "user-read-recently-played",
    ]

    session = OAuth2Session(
        SPOTIFY_CLIENT,
        scope=scope,
        redirect_uri=SPOTIFY_REDIRECT,
    )
    return session


def create_spotify_oauth2_url(*, state):
    session = create_spotify_session()
    url, _state = session.authorization_url(SPOTIFY_AUTHORIZE_URL, state=state)
    return schemas.URL(url=url)


def get_spotify_token_from_callback(*, callback_code):
    session = create_spotify_session()
    token = session.fetch_token(SPOTIFY_TOKEN_URL, code=callback_code, client_secret=SPOTIFY_SECRET)
    return schemas.SpotifyToken(**token)


def create_spotify_session_with_token(*, spotify_token: schemas.SpotifyToken):
    extras = {"client_id": SPOTIFY_CLIENT, "client_secret": SPOTIFY_SECRET}
    include = {"access_token", "refresh_token", "token_type", "expires_in"}
    token = spotify_token.dict(include=include)

    session = OAuth2Session(
        client_id=SPOTIFY_CLIENT,
        token=token,
        auto_refresh_url=SPOTIFY_TOKEN_URL,
        auto_refresh_kwargs=extras,
    )
    return session


def create_spotify_backend_session():
    basic_auth = HTTPBasicAuth(SPOTIFY_CLIENT, SPOTIFY_SECRET)
    client = BackendApplicationClient(client_id=SPOTIFY_CLIENT)
    session = OAuth2Session(client=client)
    _ = session.fetch_token(SPOTIFY_TOKEN_URL, auth=basic_auth)
    return session
