from django.contrib.auth.models import User
from django.db import models


# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    display_name = models.SlugField(max_length=100, null=True)
    image = models.SlugField(max_length=50, unique=True)
    occupation = models.CharField(max_length=50)
    country = models.CharField(max_length=50, null=True)
    bio = models.TextField(null=True)
    twitter = models.SlugField(max_length=50, null=True)

    def __self__(self):
        return self.user.username
