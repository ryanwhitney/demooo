import json
import os
import tempfile
import subprocess
from pathlib import Path

import graphene
import librosa
import numpy as np
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils.text import slugify
from graphene_file_upload.scalars import Upload
from graphql_jwt.decorators import login_required

from ..models import Track
from ..types.track import TrackType


def generate_waveform(file_path, resolution=200):
    """Generate waveform data from an audio file and return duration."""
    try:
        # Load the audio file with librosa
        y, sr = librosa.load(file_path, sr=None)

        # Calculate duration in seconds
        duration = librosa.get_duration(y=y, sr=sr)

        # Calculate segments for the resolution
        hop_length = max(1, len(y) // resolution)
        # Generate waveform data using RMS energy
        waveform_data = []
        for i in range(0, len(y), hop_length):
            if len(waveform_data) >= resolution:
                break  # Ensure we don't generate more than resolution

            chunk = y[i : i + hop_length]
            if len(chunk) > 0:
                rms = np.sqrt(np.mean(chunk**2))
                waveform_data.append(float(rms))
        # Normalize values between 0 and 1
        if waveform_data:
            max_val = max(waveform_data)
            if max_val > 0:  # Avoid division by zero
                # clamp to 2 decimal points
                waveform_data = [
                    float(f"{(val / max_val):.2f}") for val in waveform_data
                ]

        return waveform_data, round(duration)
    except Exception as e:
        print(f"Error generating waveform: {str(e)}")
        return [], 0


def get_audio_duration(file_path):
    """Get the duration of an audio file in seconds."""
    try:
        # Load the audio file with librosa
        y, sr = librosa.load(file_path, sr=None)
        # Calculate duration in seconds
        duration = librosa.get_duration(y=y, sr=sr)
        # Round to nearest second
        return round(duration)
    except Exception as e:
        print(f"Error getting audio duration: {str(e)}")
        return 0


def convert_audio_to_mp3(input_file_path, output_dir):
    """
    Convert audio file to MP3 format for cross-browser compatibility.

    Args:
        input_file_path: Path to the input audio file
        output_dir: Directory to save the converted file

    Returns:
        Path to the converted MP3 file, or None if conversion failed
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Generate output file path with .mp3 extension
        output_filename = f"{Path(input_file_path).stem}.mp3"
        output_file_path = os.path.join(output_dir, output_filename)

        # Run ffmpeg to convert audio to MP3
        # -y: Overwrite output file if it exists
        # -i: Input file
        # -vn: No video
        # -ar 44100: Set audio sampling rate to 44.1 kHz
        # -ac 2: Set number of audio channels to 2 (stereo)
        # -b:a 192k: Set audio bitrate to 192 kbps
        command = [
            "ffmpeg",
            "-y",
            "-i",
            input_file_path,
            "-vn",
            "-ar",
            "44100",
            "-ac",
            "2",
            "-b:a",
            "192k",
            output_file_path,
        ]

        # Run the command without storing the unused result
        subprocess.run(command, check=True, capture_output=True, text=True)

        # Verify the file was created and has content
        if os.path.exists(output_file_path) and os.path.getsize(output_file_path) > 0:
            return output_file_path
        else:
            print("FFmpeg completed but output file is missing or empty")
            return None

    except subprocess.CalledProcessError as e:
        print(f"Error converting audio with ffmpeg (exit code {e.returncode}):")
        print(f"Command: {' '.join(command)}")
        print(f"stdout: {e.stdout}")
        err_msg = f"stderr: {e.stderr}"
        print(err_msg)
        return None
    except Exception as e:
        print(f"Unexpected error converting audio: {str(e)}")
        import traceback

        traceback.print_exc()
        return None


class UploadTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String()
        file = Upload(required=True)

    @login_required
    def mutate(self, info, title, file, description=None):
        user = info.context.user
        title_slug = slugify(title)
        if user.tracks.filter(title_slug=title_slug):
            raise Exception(
                "You already have a track with that title. "
                "Please choose a different one."
            )

        track = Track(
            artist=user,
            title=title,
            title_slug=slugify(title),
            description=description or "",
        )
        track.save()

        # Create a temporary directory to process the audio
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save the uploaded file to a temporary file
            original_filename = file.name
            _, original_ext = os.path.splitext(original_filename)
            artist_id = str(user.id)
            track_id = str(track.id)
            temp_file_path = os.path.join(temp_dir, f"original{original_ext}")

            with open(temp_file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # Save the original file first
            orig_dir_path = f"{artist_id}/audio/{track_id}/orig"
            orig_filename = f"{track_id}{original_ext}"
            orig_full_path = f"{orig_dir_path}/{orig_filename}"

            with open(temp_file_path, "rb") as f:
                file_content = f.read()
                orig_storage_path = default_storage.save(
                    orig_full_path, ContentFile(file_content)
                )

            print(f"Original file saved: {orig_storage_path}")

            # Always convert to MP3 with 320kbps bitrate
            print(f"Converting audio file to MP3 with 320kbps bitrate...")
            converted_file_path = convert_audio_to_mp3(temp_file_path, temp_dir)

            if converted_file_path:
                # Save the converted MP3 file
                mp3_dir_path = f"{artist_id}/audio/{track_id}/320"
                mp3_filename = f"{track_id}.mp3"
                mp3_full_path = f"{mp3_dir_path}/{mp3_filename}"

                with open(converted_file_path, "rb") as f:
                    file_content = f.read()
                    mp3_storage_path = default_storage.save(
                        mp3_full_path, ContentFile(file_content)
                    )

                base_path = f"{artist_id}/audio/{track_id}"
                track.audio_file = base_path
                track.save()
                print(f"MP3 file saved: {mp3_storage_path}")
                print(f"TRACK SAVED: {track.title} (ID: {track_id})")

                try:
                    waveform_data, duration = generate_waveform(
                        converted_file_path, resolution=200
                    )

                    # Store the waveform and length
                    track.audio_waveform_data = json.dumps(waveform_data)
                    track.audio_waveform_resolution = len(waveform_data)
                    track.audio_length = duration
                    track.save()
                    print(f"Generated waveform with {len(waveform_data)} data points")
                    print(f"Audio duration: {duration} seconds")

                except Exception as e:
                    print(f"Error processing audio: {str(e)}")
                    # Set default empty waveform data
                    track.audio_waveform_data = json.dumps([])
                    track.audio_waveform_resolution = 0
                    track.save()
            else:
                # Clean up the original file since conversion failed
                try:
                    default_storage.delete(orig_storage_path)
                except Exception as e:
                    print(f"Error cleaning up original file: {str(e)}")

                # Throw an error for failed conversion
                raise Exception(
                    f"Failed to convert audio file to MP3. "
                    "Please try again or contact support."
                )

        return UploadTrack(track=track)


class UpdateTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        tags = graphene.String()

    @login_required
    def mutate(self, info, id, title=None, description=None, tags=None):
        try:
            track = Track.objects.get(pk=id)
        except Track.DoesNotExist:
            raise Exception("Track not found")

        if track.artist != info.context.user:
            raise Exception("You do not have permission to update this track")

        if title is not None:
            track.title = title
        if description is not None:
            track.description = description
        if tags is not None:
            track.tags = tags

        track.save()
        return UpdateTrack(track=track)


class DeleteTrack(graphene.Mutation):
    success = graphene.Boolean()

    class Arguments:
        id = graphene.ID(required=True)

    @login_required
    def mutate(self, info, id):
        try:
            track = Track.objects.get(pk=id)
        except Track.DoesNotExist:
            raise Exception("Track not found")

        if track.artist != info.context.user:
            raise Exception("You do not have permission to delete this track")

        if track.audio_file:
            try:
                # Get the base directory path
                base_path = str(track.audio_file)

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
                # Note: Some backends may not support directory deletion
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

        track.delete()
        return DeleteTrack(success=True)
