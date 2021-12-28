from typing import List

from celery import shared_task
from django.contrib.auth.models import User
from pydantic import parse_obj_as
from requests.models import PreparedRequest

import auth_api

from . import models
from .schemas import SpotifyArtist, SpotifyAssets, SpotifyTrack


@shared_task(bind=True)
def get_users_top_data(self, *, owner_id):
    observer = User.objects.get(id=owner_id)
    token = auth_api.models.SpotifyToken.objects.get(owner_id=owner_id)
    spotify_token = auth_api.schemas.SpotifyToken.from_orm(token)
    session = auth_api.spotify.create_spotify_session_with_token(spotify_token=spotify_token)

    user_asset_list = []

    for time_range in ["short_term", "medium_term", "long_term"]:
        for offset in range(5):
            params = {"limit": 50, "time_range": time_range, "offset": offset}
            self.update_state(state="DOWNLOADING", meta=params)

            track_request = PreparedRequest()
            track_request.prepare_url("https://api.spotify.com/v1/me/top/tracks", params)

            response = session.get(track_request.url)
            tracks = response.json().get("items")
            if tracks:
                user_asset_list += parse_obj_as(List[SpotifyTrack], tracks)

            artist_request = PreparedRequest()
            artist_request.prepare_url("https://api.spotify.com/v1/me/top/artists", params)

            response = session.get(artist_request.url)
            artists = response.json().get("items")
            if artists:
                user_asset_list += parse_obj_as(List[SpotifyArtist], artists)

    spotify_assets = SpotifyAssets(__root__=user_asset_list)

    for index, asset in enumerate(spotify_assets):
        object, created = models.SpotifyAsset.objects.get_or_create(**asset.dict())
        if created:
            object.observers.add(observer)
            self.update_state(
                state="UPDATING", meta={"current": index, "total": len(spotify_assets)}
            )
