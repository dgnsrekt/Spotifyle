# Generated by Django 4.0 on 2021-12-29 00:59

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('assets', '0002_rename_image_path_spotifyasset_image_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('game_code', models.SlugField(max_length=32)),
                ('task_id', models.SlugField(max_length=32)),
                ('processed', models.BooleanField(default=False)),
                ('name', models.CharField(max_length=256)),
                ('publisher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.user')),
            ],
        ),
        migrations.CreateModel(
            name='Stage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('puzzle_type', models.IntegerField(choices=[(1, 'Artist Trivia'), (2, 'Find Track Art'), (3, 'Multiple Track Lock In')])),
                ('question', models.TextField(blank=True, null=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='game_api.game')),
            ],
        ),
        migrations.CreateModel(
            name='Choice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=256, null=True)),
                ('correct', models.BooleanField()),
                ('spotify_asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='assets.spotifyasset')),
                ('stage', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='game_api.stage')),
            ],
        ),
    ]
