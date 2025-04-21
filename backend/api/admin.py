from api.models import Profile, Track, User
from api.utils import delete_track_files
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.urls import reverse
from django.utils.html import format_html


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"


class TrackInline(admin.TabularInline):
    model = Track
    extra = 0
    fields = ("title", "created_at", "audio_file_player")
    readonly_fields = ("created_at", "audio_file_player")
    fk_name = "artist"

    def audio_file_player(self, obj):
        if obj.audio_file:
            return format_html(
                '<audio controls><source src="{}" type="audio/mpeg"></audio>',
                obj.audio_url,
            )
        return "No audio file"

    audio_file_player.short_description = "Audio Preview"


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "date_joined",
        "track_count",
    )
    search_fields = ("username", "email", "first_name", "last_name")
    readonly_fields = ("id", "date_joined", "last_login")
    inlines = (ProfileInline, TrackInline)

    fieldsets = (
        (None, {"fields": ("id", "username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    def track_count(self, obj):
        count = obj.tracks.count()
        if count:
            url = reverse("admin:api_track_changelist") + f"?artist__id__exact={obj.id}"
            return format_html('<a href="{}">{} tracks</a>', url, count)
        return "0 tracks"

    track_count.short_description = "Tracks"

    def delete_model(self, request, obj):
        """Override to ensure user directory is deleted from storage after cascade"""
        # Store the user ID before deleting the model
        user_id = obj.id

        # Django will handle the cascade deletes for tracks
        super().delete_model(request, obj)

        # After the cascade delete, try to clean up the user's audio directory
        try:
            # Tracks might use a path like "{user_id}/audio/{track_id}/..."
            # Check if this directory exists in the storage
            from django.core.files.storage import default_storage

            base_user_path = f"{user_id}/audio"

            if default_storage.exists(base_user_path):
                # List and delete all subdirectories
                dirs, _ = default_storage.listdir(base_user_path)
                for dir_name in dirs:
                    track_path = f"{base_user_path}/{dir_name}"
                    # Since we're not using a Track object, use dict format
                    delete_track_files({"audio_file": track_path})

                # Delete the base directory itself
                default_storage.delete(base_user_path)
                print(f"Deleted user directory: {base_user_path}")
        except Exception as e:
            print(f"Error cleaning up user directory: {e}")

    def delete_queryset(self, request, queryset):
        """Override to ensure user directories are deleted when batch deleting"""
        # Store user IDs before deleting
        user_ids = [str(obj.id) for obj in queryset]

        # Delete the queryset (Django will handle cascade)
        super().delete_queryset(request, queryset)

        # Clean up all user directories
        from django.core.files.storage import default_storage

        for user_id in user_ids:
            try:
                base_user_path = f"{user_id}/audio"
                if default_storage.exists(base_user_path):
                    # List and delete all subdirectories
                    dirs, _ = default_storage.listdir(base_user_path)
                    for dir_name in dirs:
                        track_path = f"{base_user_path}/{dir_name}"
                        # Since we're not using a Track object, use dict format
                        delete_track_files({"audio_file": track_path})

                    # Delete the base directory itself
                    default_storage.delete(base_user_path)
                    print(f"Deleted user directory: {base_user_path}")
            except Exception as e:
                print(f"Error cleaning up user directory: {e}")


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ("title", "get_artist", "created_at", "has_audio", "audio_player")
    list_filter = ("created_at", "artist")
    search_fields = ("title", "description", "artist__username")
    readonly_fields = ("id", "created_at", "updated_at", "audio_player", "title_slug")

    fieldsets = (
        (None, {"fields": ("id", "title", "title_slug", "artist", "description")}),
        (
            "Audio",
            {
                "fields": (
                    "audio_file",
                    "audio_player",
                    "audio_length",
                    "audio_waveform_data",
                    "audio_waveform_resolution",
                ),
            },
        ),
        (
            "Metadata",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )

    def get_artist(self, obj):
        url = reverse("admin:api_user_change", args=[obj.artist.id])
        return format_html('<a href="{}">{}</a>', url, obj.artist.username)

    get_artist.short_description = "Artist"

    def has_audio(self, obj):
        return bool(obj.audio_file)

    has_audio.boolean = True
    has_audio.short_description = "Has Audio"

    def audio_player(self, obj):
        if obj.audio_file:
            return format_html(
                '<audio controls><source src="{}" type="audio/mpeg"></audio>',
                obj.audio_url,
            )
        return "No audio file"

    audio_player.short_description = "Audio Preview"

    def delete_model(self, request, obj):
        """Override to ensure track directory is deleted from storage"""
        if obj.audio_file:
            # Delete associated files using the utility function directly
            delete_track_files(obj)

            # Delete the model after files are deleted
            super().delete_model(request, obj)
        else:
            super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        """Override to ensure track directories are deleted when batch deleting"""
        # Delete files for each track using the utility function
        for obj in queryset:
            if obj.audio_file:
                delete_track_files(obj)

        # Delete the queryset
        super().delete_queryset(request, queryset)


# Register Profile model directly
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "created_at", "updated_at")
    search_fields = ("user__username", "name", "bio")
    readonly_fields = ("id", "created_at", "updated_at")
