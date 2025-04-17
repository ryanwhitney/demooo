import os
import tempfile

import graphene
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from graphene_file_upload.scalars import Upload
from graphql_jwt.decorators import login_required

from ..types.profile import ProfileType

import os
import tempfile
import subprocess
from pathlib import Path


def optimize_image(input_file_path, output_dir, max_size=1024):
    """
    Optimize and resize image for profile picture.

    Args:
        input_file_path: Path to the input image file
        output_dir: Directory to save the optimized file
        max_size: Maximum dimension in pixels

    Returns:
        Path to the optimized image file, or None if optimization failed
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Generate output file path with original extension
        original_ext = Path(input_file_path).suffix
        output_filename = f"optimized{original_ext}"
        output_file_path = os.path.join(output_dir, output_filename)

        # Run imagemagick to optimize the image
        command = [
            "convert",
            input_file_path,
            "-resize",
            f"{max_size}x{max_size}>",  # Resize if larger than max_size
            "-strip",  # Remove metadata
            "-quality",
            "85%",  # Compress with 85% quality
            output_file_path,
        ]

        # Run the command
        subprocess.run(command, check=True, capture_output=True, text=True)

        # Verify the file was created and has content
        if os.path.exists(output_file_path) and os.path.getsize(output_file_path) > 0:
            return output_file_path
        else:
            print("Image optimization completed but output file is missing or empty")
            return None

    except subprocess.CalledProcessError as e:
        print(f"Error optimizing image (exit code {e.returncode}):")
        print(f"Command: {' '.join(command)}")
        print(f"stdout: {e.stdout}")
        print(f"stderr: {e.stderr}")
        return None
    except Exception as e:
        print(f"Unexpected error optimizing image: {str(e)}")
        import traceback

        traceback.print_exc()
        return None


class UpdateProfile(graphene.Mutation):
    profile = graphene.Field(ProfileType)

    class Arguments:
        name = graphene.String()
        bio = graphene.String()
        location = graphene.String()
        profile_picture = Upload(required=True)

    @login_required
    def mutate(self, info, name=None, bio=None, location=None, profile_picture=None):
        user = info.context.user
        profile = user.profile

        # Update text fields if provided
        if name is not None:
            profile.name = name
        if bio is not None:
            profile.bio = bio
        if location is not None:
            profile.location = location

        # Handle profile picture upload if provided
        if profile_picture is not None:
            with tempfile.TemporaryDirectory() as temp_dir:
                # Save the uploaded file to a temporary file
                original_filename = profile_picture.name
                _, original_ext = os.path.splitext(original_filename)
                # Check for allowed image formats
                allowed_extensions = [".jpg", ".jpeg", ".png", ".gif"]
                if original_ext.lower() not in allowed_extensions:
                    raise Exception(
                        f"Invalid image format. Please upload one of: {', '.join(allowed_extensions)}"
                    )

                user_id = str(user.id)
                temp_file_path = os.path.join(temp_dir, f"original{original_ext}")

                # Write the file in chunks
                with open(temp_file_path, "wb") as f:
                    for chunk in profile_picture.chunks():
                        f.write(chunk)

                # Save the original file
                orig_dir_path = f"{user_id}/profile/orig"
                orig_filename = f"profile{original_ext}"
                orig_full_path = f"{orig_dir_path}/{orig_filename}"

                with open(temp_file_path, "rb") as f:
                    file_content = f.read()
                    orig_storage_path = default_storage.save(
                        orig_full_path, ContentFile(file_content)
                    )

                print(f"Original profile picture saved: {orig_storage_path}")

                # Optimize and resize the image
                optimized_file_path = optimize_image(temp_file_path, temp_dir)

                if optimized_file_path:
                    # Find optimized image extension
                    _, optimized_ext = os.path.splitext(optimized_file_path)

                    # Save the optimized image
                    optimized_dir_path = f"{user_id}/profile/optimized"
                    optimized_filename = f"profile{optimized_ext}"
                    optimized_full_path = f"{optimized_dir_path}/{optimized_filename}"

                    with open(optimized_file_path, "rb") as f:
                        file_content = f.read()
                        optimized_storage_path = default_storage.save(
                            optimized_full_path, ContentFile(file_content)
                        )

                    # Delete old profile picture directories if they exist
                    if profile.profile_picture:
                        try:
                            old_base_path = profile.profile_picture
                            # Try to delete the original and optimized directories
                            for subdir in ["orig", "optimized"]:
                                try:
                                    old_dir = f"{old_base_path}/{subdir}"
                                    # List and delete all files in the directory
                                    files = default_storage.listdir(old_dir)[
                                        1
                                    ]  # [1] gets files, [0] gets directories
                                    for file in files:
                                        default_storage.delete(f"{old_dir}/{file}")
                                except Exception as e:
                                    print(
                                        f"Error cleaning up old profile picture {subdir}: {e}"
                                    )
                        except Exception as e:
                            print(f"Error deleting old profile pictures: {e}")

                    # Store the base directory path
                    base_path = f"{user_id}/profile"
                    profile.profile_picture = base_path
                    print(f"PROFILE PICTURE UPDATED: User {user_id}")
                else:
                    # Clean up the original file since optimization failed
                    try:
                        default_storage.delete(orig_storage_path)
                    except Exception as e:
                        print(f"Error cleaning up original profile picture: {str(e)}")

                    # Throw an error for failed optimization
                    raise Exception(
                        "Failed to process the image. "
                        "Please try again with a different image or contact support."
                    )

        profile.save()
        return UpdateProfile(profile=profile)
