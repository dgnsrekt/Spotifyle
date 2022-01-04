from django.contrib.auth.models import User
from django.db import models
from django.db.models import Sum

from game_api.models import Game


class ScoreBoard(models.Model):
    game = models.OneToOneField(Game, on_delete=models.CASCADE)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.BigIntegerField(null=True)

    constraints = models.constraints.UniqueConstraint(
        fields=["game", "player"], name="players_score"
    )


class PlayerProfile(models.Model):
    player = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    consumed_stars = models.IntegerField(default=0)
    biggest_gainer = models.BigIntegerField(default=0)
    biggest_loser = models.BigIntegerField(default=0)

    def update_gainers_and_losers(self, wager):
        if wager > self.biggest_gainer:
            self.biggest_gainer = wager

        if wager < self.biggest_loser:
            self.biggest_loser = wager

        self.save()

    @property
    def points(self):
        points = (
            ScoreBoard.objects.filter(player=self.player).aggregate(Sum("score")).get("score__sum")
        )
        if points is None:
            return 0
        return points

    @property
    def stars(self):
        return ScoreBoard.objects.filter(game__publisher=self.player).count()

    @property
    def available_stars(self):
        return self.stars - self.consumed_stars

    def consume_star(self):
        self.consumed_stars += 1
        self.save()
