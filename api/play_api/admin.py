from django.contrib import admin

from .models import PlayerProfile, ScoreBoard

# Register your models here.
admin.register(ScoreBoard)
admin.register(PlayerProfile)
