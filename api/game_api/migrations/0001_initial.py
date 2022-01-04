# Generated by Django 4.0 on 2022-01-04 03:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('assets', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('game_code', models.SlugField(max_length=256)),
                ('task_id', models.SlugField(max_length=256)),
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
