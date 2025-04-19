import os
from django.conf import settings
from django.core.files.storage import default_storage


def ensure_storage_path_exists(path):
    """
    Handle storage paths for both local and cloud backends
    For local storage, creates directories
    For cloud storage (R2), does nothing as directories aren't needed
    """
    # Check if we're using local file system
    is_local = not getattr(settings, "USE_CLOUDFLARE_R2", False)

    if is_local:
        # For local storage, create directories
        try:
            full_path = default_storage.path(path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
        except Exception as e:
            print(f"Warning: Could not create directory: {e}")
    # For cloud storage, directories don't need to be created


def delete_track_files(track):
    """Delete all files associated with a track"""
    if not track.audio_file:
        return

    try:
        # Get the base path
        base_path = track.audio_file

        # Try to delete subdirectories and their contents
        for subdir in ["orig", "320"]:
            try:
                dir_path = f"{base_path}/{subdir}"
                # Check if directory exists
                if default_storage.exists(dir_path):
                    # List and delete all files in the directory
                    try:
                        _, files = default_storage.listdir(dir_path)
                        for file in files:
                            default_storage.delete(f"{dir_path}/{file}")
                    except NotImplementedError:
                        # Some storage backends don't support listdir
                        # Try direct deletion of known files
                        if subdir == "orig":
                            # Try to delete by pattern matching
                            pass  # Implement if needed
                        elif subdir == "320":
                            # Try to delete MP3 file directly
                            mp3_path = f"{dir_path}/{track.id}.mp3"
                            if default_storage.exists(mp3_path):
                                default_storage.delete(mp3_path)
            except Exception as e:
                print(f"Error deleting files in {subdir}: {e}")
    except Exception as e:
        print(f"Error during track file deletion: {e}")


def get_r2_storage():
    """
    Get a direct R2 storage instance, bypassing Django's default_storage.

    This ensures we're using the R2 storage directly when needed.
    """
    if settings.USE_CLOUDFLARE_R2:
        # Import here to avoid circular imports
        from api.storage import CloudflareR2Storage

        return CloudflareR2Storage()
    else:
        # Fall back to default storage if R2 is not enabled
        return default_storage
