from ninja import Schema, Field
from pydantic import validator, HttpUrl
from auth_api.schemas import SpotifyProfile
from typing import Optional


class SpotifyPublicProfile(SpotifyProfile):
    followers: Optional[int]
    external_urls: Optional[HttpUrl]
    type: str
    uri: str

    @validator("followers", pre=True)
    def parse_followers(cls, followers):
        return followers.get("total")

    @validator("external_urls", pre=True)
    def parse_external_urls(cls, external_urls):
        return external_urls.get("spotify")
