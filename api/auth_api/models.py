from django.contrib.auth.models import User
from django.db import models


class SpotifyToken(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE)
    access_token = models.SlugField(max_length=255)
    token_type = models.CharField(max_length=25)
    expires_in = models.IntegerField()
    refresh_token = models.SlugField(max_length=255)
    expires_at = models.IntegerField()
