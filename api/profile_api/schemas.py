from ninja import Schema, Field
from pydantic import validator, HttpUrl
from auth_api.schemas import SpotifyProfile
from typing import Optional
from faker import Faker

fake = Faker()


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


class Profile(Schema):
    user_id: int
    display_name: Optional[str]
    image: Optional[str]
    occupation: str = fake.job().title()
    country: Optional[str]
    bio: Optional[str]
    twitter: Optional[str]


class UpdateProfile(Schema):
    bio: Optional[str]
    twitter: Optional[str]
