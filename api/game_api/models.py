from django.contrib.auth.models import User
from django.db import models

from assets.models import SpotifyAsset


# Create your models here.
class Game(models.Model):
    game_code = models.SlugField(max_length=32)
    publisher = models.ForeignKey(User, on_delete=models.CASCADE)


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
    spotify_assert = models.ManyToManyField(SpotifyAsset)
    correct = models.BooleanField()


# TODO: Create when the first player plays the game.
class ScoreBoard(models.Model):
    game = models.OneToOneField(Game, on_delete=models.CASCADE, primary_key=True)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.BigIntegerField(null=True)

    constraints = models.constraints.UniqueConstraint(
        fields=["game", "player"], name="players_score"
    )
