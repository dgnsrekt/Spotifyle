import urllib
from typing import Optional

from ninja import Field, Schema
from pydantic import HttpUrl, validator


class URL(Schema):
    url: HttpUrl


class SpotifyToken(Schema):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str
    expires_at: float


class SpotifyProfile(Schema):
    username: str = Field(alias="id")
    display_name: str
    country: Optional[str]
    email: Optional[str]  # email type?
    premium: Optional[bool] = Field(alias="product")
    image: Optional[str] = Field(alias="images")

    @validator("premium", pre=True)
    def convert_product(cls, product):
        if product == "premium":
            return True
        return False

    @validator("image", pre=True)
    def convert_images(cls, images):
        if len(images) > 0:
            image = URL(**images.pop())
            return image.url.path
        return None


class User(Schema):
    id: int
    username: str


class JsonWebToken(Schema):
    access_token: str
    token_type: str


class AuthorizationResponse(Schema):
    user: User
    jwt: JsonWebToken
    state: str
    game_code: Optional[str] = Field(alias="state")

    @validator("game_code")
    def parse_game_code(cls, state: str):
        state = urllib.parse.unquote(state)
        state, *game_code = state.split(":")

        if not game_code:
            return None
        return game_code.pop()
