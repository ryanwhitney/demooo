from django.core.files.storage import default_storage


def delete_track_files(track_obj_or_path):
    """
    Delete all files associated with a track

    Args:
        track_obj_or_path: Either a Track object or a string path to the track files
    """
    # Determine the base path
    if isinstance(track_obj_or_path, str):
        base_path = track_obj_or_path
    else:
        # Assume it's a Track object
        if not track_obj_or_path.audio_file:
            return
        base_path = str(track_obj_or_path.audio_file)

    try:
        # Delete files in subdirectories first
        for subdir in ["orig", "320"]:
            try:
                subdir_path = f"{base_path}/{subdir}"

                # List all files in the subdirectory
                try:
                    _, files = default_storage.listdir(subdir_path)

                    # Delete each file in the subdirectory
                    for file in files:
                        file_path = f"{subdir_path}/{file}"
                        default_storage.delete(file_path)
                        print(f"Deleted file: {file_path}")

                except Exception as e:
                    print(f"Error listing files in {subdir_path}: {e}")

            except Exception as e:
                print(f"Error processing subdirectory {subdir}: {e}")

        # Try to delete the subdirectories and base directory
        try:
            for subdir in ["orig", "320"]:
                try:
                    default_storage.delete(f"{base_path}/{subdir}")
                except Exception as e:
                    print(f"Error deleting subdirectory {subdir}: {e}")

            # Try to delete the base directory last
            default_storage.delete(base_path)

        except Exception as e:
            print(f"Error during directory deletion: {e}")

        print(f"Deleted track directory structure: {base_path}")

    except Exception as e:
        print(f"Error deleting track files: {e}")
