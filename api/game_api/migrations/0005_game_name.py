# Generated by Django 4.0 on 2021-12-28 18:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game_api', '0004_game_processed_game_task_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='name',
            field=models.CharField(default='fakename', max_length=256),
            preserve_default=False,
        ),
    ]
