# Generated by Django 4.0 on 2021-12-28 00:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='spotifyasset',
            old_name='image_path',
            new_name='image',
        ),
        migrations.RenameField(
            model_name='spotifyasset',
            old_name='preview_path',
            new_name='preview',
        ),
    ]