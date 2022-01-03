from django.contrib.auth.models import User
from django.db import models
from django.utils.translation import gettext_lazy


class SpotifyAsset(models.Model):
    class SpotifyType(models.TextChoices):
        ARTIST = "AR", gettext_lazy("artist")
        ALBUM = "AL", gettext_lazy("album")
        TRACK = "TR", gettext_lazy("track")
        SHOW = "SH", gettext_lazy("show")
        EPISODE = "EP", gettext_lazy("episode")

    observers = models.ManyToManyField(User)
    name = models.CharField(max_length=256)
    spotify_uri = models.SlugField(max_length=256, unique=True)
    spotify_type = models.CharField(max_length=16, choices=SpotifyType.choices)
    image = models.SlugField(max_length=256, null=True)
    preview = models.SlugField(max_length=256, null=True)

    def __str__(self):
        return self.name
