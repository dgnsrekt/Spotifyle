# Generated by Django 4.0 on 2022-01-04 03:40

from django.db import migrations, models
import django.db.models.deletion


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
                ('access_token', models.SlugField(max_length=255)),
                ('token_type', models.CharField(max_length=25)),
                ('expires_in', models.IntegerField()),
                ('refresh_token', models.SlugField(max_length=255)),
                ('expires_at', models.IntegerField()),
                ('owner', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='auth.user')),
            ],
        ),
    ]
