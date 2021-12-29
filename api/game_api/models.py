from django.contrib.auth.models import User
from django.db import models

from assets.models import SpotifyAsset


# Create your models here.
class Game(models.Model):
    game_code = models.SlugField(max_length=32)
    publisher = models.ForeignKey(User, on_delete=models.CASCADE)
    task_id = models.SlugField(max_length=32)
    processed = models.BooleanField(default=False)
    name = models.CharField(max_length=256)


class Stage(models.Model):
    class PuzzleType(models.IntegerChoices):
        # TODO Change the names once we have the final idea
        ARTIST_TRIVIA = 1
        FIND_TRACK_ART = 2
        MULTIPLE_TRACK_LOCK_IN = 3

    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    puzzle_type = models.IntegerField(choices=PuzzleType.choices)
    question = models.TextField(null=True, blank=True)


class Choice(models.Model):
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE)
    description = models.CharField(max_length=256, null=True)
    spotify_asset = models.ForeignKey(SpotifyAsset, on_delete=models.CASCADE)
    correct = models.BooleanField()
