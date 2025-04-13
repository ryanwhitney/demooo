import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class User(AbstractUser):
    """Extended user model with UUID primary key"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self):
        return self.username


class Profile(models.Model):
    """Profile model with UUID and linked to custom User model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.TextField(max_length=80, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


def track_upload_path(instance, filename):
    """
    Generate file path for track uploads:
    audio/artists/<user_id>/tracks/<track_id>/<filename>
    """
    return f'audio/artists/{instance.artist.id}/tracks/{instance.id}/{filename}'


class Track(models.Model):
    """Model for audio tracks uploaded by users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    artist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tracks', db_column='user_id')
    title = models.CharField(max_length=125)
    title_slug = models.SlugField(max_length=255)  # longer to allow for slug dashes
    description = models.TextField(blank=True)
    audio_file = models.FileField(max_length=255, upload_to=track_upload_path)
    audio_length = models.IntegerField(default=0)
    audio_waveform_data = models.JSONField(blank=True, null=True)
    audio_waveform_resolution = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.artist.username}"

    class Meta:
        ordering = ['-created_at']