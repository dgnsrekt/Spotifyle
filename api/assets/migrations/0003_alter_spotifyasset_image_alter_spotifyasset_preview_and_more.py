# Generated by Django 4.0 on 2022-01-03 04:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0002_rename_image_path_spotifyasset_image_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='spotifyasset',
            name='image',
            field=models.SlugField(max_length=256, null=True),
        ),
        migrations.AlterField(
            model_name='spotifyasset',
            name='preview',
            field=models.SlugField(max_length=256, null=True),
        ),
        migrations.AlterField(
            model_name='spotifyasset',
            name='spotify_type',
            field=models.CharField(choices=[('AR', 'artist'), ('AL', 'album'), ('TR', 'track'), ('SH', 'show'), ('EP', 'episode')], max_length=16),
        ),
        migrations.AlterField(
            model_name='spotifyasset',
            name='spotify_uri',
            field=models.SlugField(max_length=256, unique=True),
        ),
    ]