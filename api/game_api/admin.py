from django.contrib import admin
from .models import Game, Stage, Choice, ScoreBoard

# Register your models here.
admin.register(Game)
admin.register(Stage)
admin.register(Choice)
admin.register(ScoreBoard)
