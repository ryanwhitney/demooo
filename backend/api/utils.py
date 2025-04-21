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


def delete_track_files(track_or_path):
    """
    Delete all files associated with a track or path

    Args:
        track_or_path: Either a Track object or a dict with audio_file key,
                      or a string representing the base path
    """
    # Handle different input types
    if hasattr(track_or_path, "audio_file"):  # Track object
        if not track_or_path.audio_file:
            return
        base_path = track_or_path.audio_file
        track_id = track_or_path.id
    elif isinstance(track_or_path, dict) and "audio_file" in track_or_path:  # Dict
        if not track_or_path["audio_file"]:
            return
        base_path = track_or_path["audio_file"]
        track_id = track_or_path.get("id", None)
    elif isinstance(track_or_path, str):  # Direct path string
        base_path = track_or_path
        track_id = None  # We don't know the ID in this case
    else:
        print(
            f"Warning: Unsupported type for delete_track_files: {type(track_or_path)}"
        )
        return

    try:
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
                        elif subdir == "320" and track_id:
                            # Try to delete MP3 file directly if we have the ID
                            mp3_path = f"{dir_path}/{track_id}.mp3"
                            if default_storage.exists(mp3_path):
                                default_storage.delete(mp3_path)

                    # Attempt to delete the empty subdirectory itself
                    try:
                        default_storage.delete(dir_path)
                    except Exception as e:
                        print(f"Could not delete subdirectory {dir_path}: {e}")
            except Exception as e:
                print(f"Error deleting files in {subdir}: {e}")

        # Finally, try to delete the base directory
        try:
            if default_storage.exists(base_path):
                default_storage.delete(base_path)
        except Exception as e:
            print(f"Could not delete base directory {base_path}: {e}")
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
