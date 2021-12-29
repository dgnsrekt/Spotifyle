from django.db import models
from django.contrib.auth.models import User
from game_api.models import Game

# TODO: Create when the first player plays the game.
class ScoreBoard(models.Model):
    game = models.OneToOneField(Game, on_delete=models.CASCADE, primary_key=True)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.BigIntegerField(null=True)

    constraints = models.constraints.UniqueConstraint(
        fields=["game", "player"], name="players_score"
    )
