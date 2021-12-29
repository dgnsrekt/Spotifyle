from django.contrib import admin

from .models import Choice, Game, Stage

# Register your models here.
admin.register(Game)
admin.register(Stage)
admin.register(Choice)
