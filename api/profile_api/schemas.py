from typing import Optional

from faker import Faker
from ninja import Field, Schema
from pydantic import HttpUrl, validator

from auth_api.schemas import SpotifyProfile


def create_fake_occupation():
    fake = Faker()
    return fake.job().title()


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
    occupation: str = create_fake_occupation()
    country: Optional[str]
    bio: Optional[str]
    twitter: Optional[str]
    data_loaded: bool = False


class UpdateProfile(Schema):
    bio: Optional[str]
    twitter: Optional[str]
