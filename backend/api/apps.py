import sys

from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        """
        Override ready method to ensure storage is properly initialized
        This runs after Django loads all apps
        """
        # Skip during management commands like migrate, etc.
        if (
            "migrate" in sys.argv
            or "makemigrations" in sys.argv
            or "collectstatic" in sys.argv
        ):
            return

        from django.conf import settings

        # Only proceed if we're using Cloudflare R2
        if not settings.USE_CLOUDFLARE_R2:
            return

        # Import modules needed for storage modification
        from django.core.files.storage import default_storage

        # Log what Django thinks the default storage is
        storage_class = default_storage.__class__.__name__
        print(f"Default storage before fix: {storage_class}")

        # Import our storage class
        from api.storage import CloudflareR2Storage

        # Create a new storage instance
        r2_storage = CloudflareR2Storage()

        # Method 1: Override the _wrapped attribute
        if hasattr(default_storage, "_wrapped"):
            print("Replacing default_storage._wrapped with R2 storage")
            default_storage._wrapped = r2_storage

        # Method 2: Monkey-patch default_storage's __class__
        if hasattr(default_storage, "__class__"):
            print("Monkey-patching default_storage.__class__")
            default_storage.__class__ = CloudflareR2Storage

        # Verify what we ended up with
        storage_class = default_storage.__class__.__name__
        print(f"Storage after fix: {storage_class}")
