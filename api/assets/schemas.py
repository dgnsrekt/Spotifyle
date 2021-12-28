from typing import List, Optional, Union

from ninja import Field, Schema
from pydantic import HttpUrl, validator


class URL(Schema):
    url: HttpUrl


class SpotifyAssetSchema(Schema):
    name: str
    spotify_uri: str = Field(alias="id")


class SpotifyTrack(SpotifyAssetSchema):
    image: Optional[str] = Field(alias="album")
    preview: Optional[str] = Field(alias="preview_url")
    spotify_type: str = Field(alias="type")

    @validator("preview", pre=True, allow_reuse=True)
    def parse_preview_path(cls, preview_url):
        if not preview_url:
            return None
        preview = URL(url=preview_url)
        return preview.url.path

    @validator("image", pre=True, allow_reuse=True)
    def parse_image_path(cls, asset):
        images = asset.get("images")
        if not images:
            return None

        image_url = images[0].get("url")
        if not image_url:
            return None

        image = URL(url=image_url)
        return image.url.path


class SpotifyArtist(SpotifyAssetSchema):
    image: Optional[str] = Field(alias="images")
    spotify_type: str = Field(alias="type")

    @validator("image", pre=True, allow_reuse=True)
    def parse_image_path(cls, images):
        if not images:
            return None

        image_url = images[0].get("url")
        if not image_url:
            return None

        image = URL(url=image_url)
        return image.url.path


class SpotifyAssets(Schema):
    __root__: List[Union[SpotifyTrack, SpotifyArtist]]

    def __len__(self):
        return len(self.__root__)

    def __iter__(self):
        return iter(self.__root__)
