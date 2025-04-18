import os
import tempfile
import subprocess
import time
import uuid
from pathlib import Path

import graphene
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from graphene_file_upload.scalars import Upload
from graphql_jwt.decorators import login_required

from ..types.profile import ProfileType


def generate_short_unique_id():
    """Generate a short but unique ID based on time and randomness"""
    # Get seconds since epoch, modulo 10000 (cycles every ~3 hours)
    t = int(time.time()) % 10000
    # Get random 2-byte hex string (provides 65536 possibilities)
    r = uuid.uuid4().hex[:4]
    return f"{t}{r}"  # e.g. "596583af"


def optimize_image(input_file_path, output_dir, max_size=1200):
    """
    Optimize and resize image for profile picture, always converting to JPG.
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Generate a unique filename with short ID
        unique_id = generate_short_unique_id()
        output_filename = f"profile_{unique_id}.jpg"
        output_file_path = os.path.join(output_dir, output_filename)

        # Run imagemagick to optimize the image and convert to jpg
        command = [
            "convert",
            input_file_path,
            "-resize",
            f"{max_size}x{max_size}^",  # Resize any size image (^) to max_size
            "-gravity",
            "center",  # Center the crop
            "-extent",
            f"{max_size}x{max_size}",  # Crop to exact dimensions
            "-strip",  # Remove metadata
            "-quality",
            "92%",  # Higher quality (85% → 92%)
            "-sampling-factor",
            "4:2:0",  # Chroma subsampling for JPG
            "-interlace",
            "JPEG",  # Progressive JPEG
            "-colorspace",
            "sRGB",  # Consistent color space
            output_file_path,
        ]

        # Run the command
        subprocess.run(command, check=True, capture_output=True, text=True)

        # Verify the file was created and has content
        if os.path.exists(output_file_path) and os.path.getsize(output_file_path) > 0:
            return output_file_path, output_filename
        else:
            print("Image optimization completed but output file is missing or empty")
            return None, None

    except Exception as e:
        print(f"Error optimizing image: {str(e)}")
        return None, None


class UpdateProfile(graphene.Mutation):
    profile = graphene.Field(ProfileType)

    class Arguments:
        name = graphene.String()
        bio = graphene.String()
        location = graphene.String()
        profile_picture = Upload(required=False)

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
            try:
                # Check file extension
                original_filename = profile_picture.name
                _, original_ext = os.path.splitext(original_filename)
                allowed_extensions = [
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".gif",
                    ".webp",
                    ".svg",
                    ".bmp",
                    ".tiff",
                    ".tif",
                    ".avif",
                    ".heic",
                    ".ico",
                ]
                if original_ext.lower() not in allowed_extensions:
                    raise Exception(
                        f"Invalid image format. Please upload one of: {', '.join(allowed_extensions)}"
                    )

                # Create a temporary directory for processing
                with tempfile.TemporaryDirectory() as temp_dir:
                    # Save uploaded file to temp directory
                    temp_file_path = os.path.join(temp_dir, f"original{original_ext}")
                    with open(temp_file_path, "wb") as f:
                        for chunk in profile_picture.chunks():
                            f.write(chunk)

                    # Define paths for storage
                    user_id = str(user.id)
                    base_path = f"{user_id}/img/profile"

                    # Create directories if they don't exist
                    for subdir in ["orig", "new"]:
                        path = f"{base_path}/{subdir}"
                        if not default_storage.exists(path):
                            try:
                                os.makedirs(default_storage.path(path), exist_ok=True)
                            except Exception:
                                # If the default_storage doesn't support local path, just continue
                                pass

                    # Clear existing files from directories
                    try:
                        # Remove all files in orig directory
                        if default_storage.exists(f"{base_path}/orig"):
                            _, files = default_storage.listdir(f"{base_path}/orig")
                            for file in files:
                                default_storage.delete(f"{base_path}/orig/{file}")

                        # Remove all files in new directory
                        if default_storage.exists(f"{base_path}/new"):
                            _, files = default_storage.listdir(f"{base_path}/new")
                            for file in files:
                                default_storage.delete(f"{base_path}/new/{file}")
                    except Exception as e:
                        print(f"Warning: Could not clear old files: {e}")
                        # Continue anyway - it's better to add new files than to fail completely

                    # Generate unique filename for the original image
                    orig_filename = f"profile_{uuid.uuid4().hex}{original_ext}"
                    orig_path = f"{base_path}/orig/{orig_filename}"

                    # Save original image
                    with open(temp_file_path, "rb") as f:
                        default_storage.save(orig_path, ContentFile(f.read()))

                    # Optimize image (convert to JPG)
                    optimized_file_path, optimized_filename = optimize_image(
                        temp_file_path, temp_dir
                    )
                    if not optimized_file_path:
                        raise Exception("Failed to optimize image")

                    # Save optimized JPG image with unique filename
                    optimized_path = f"{base_path}/new/{optimized_filename}"
                    with open(optimized_file_path, "rb") as f:
                        default_storage.save(optimized_path, ContentFile(f.read()))

                    # Update profile with full path to the optimized image
                    # This will ensure it points to the exact file with timestamp
                    profile.profile_picture = optimized_path
                    print(
                        f"Profile picture updated for user {user_id} at path {optimized_path}"
                    )

            except Exception as e:
                print(f"Error updating profile picture: {str(e)}")
                raise Exception(f"Failed to update profile picture: {str(e)}")

        # Save profile changes
        profile.save()
        return UpdateProfile(profile=profile)
