# Generated by Django 4.0 on 2021-12-27 00:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='SpotifyToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('access_token', models.SlugField(max_length=160)),
                ('token_type', models.CharField(max_length=25)),
                ('expires_in', models.IntegerField()),
                ('refresh_token', models.SlugField(max_length=160)),
                ('expires_at', models.IntegerField()),
                ('owner', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='auth.user')),
            ],
        ),
    ]
