import json
import logging
import os
import subprocess
import tempfile
import time
from pathlib import Path

import graphene
import librosa
import numpy as np
from api.models import Track
from api.types.track import TrackType
from api.utils import delete_track_files, ensure_storage_path_exists
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils.text import slugify
from graphene_file_upload.scalars import Upload
from graphql_jwt.decorators import login_required
from pydub import AudioSegment

# Configure logging
logger = logging.getLogger("track_processing")
logger.setLevel(logging.INFO)
# Ensure we have a console handler
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)


def generate_waveform_pydub(file_path, resolution=200):
    start_time = time.time()
    logger.info(f"Starting pydub waveform generation for {file_path}")
    try:
        # Load audio file with pydub
        load_start = time.time()
        audio = AudioSegment.from_file(file_path)
        duration = len(audio) / 1000  # Duration in seconds
        load_end = time.time()
        logger.info(f"Pydub audio loading took {load_end - load_start:.2f} seconds")

        # Calculate waveform by splitting audio into chunks
        waveform_start = time.time()
        samples = audio.get_array_of_samples()
        step_size = max(1, len(samples) // resolution)

        waveform_data = []
        for i in range(0, len(samples), step_size):
            if len(waveform_data) >= resolution:
                break

            chunk = samples[i : i + step_size]
            if len(chunk) > 0:
                # Root mean square for this chunk
                rms = np.sqrt(np.mean(np.array(chunk).astype(np.float32) ** 2))
                waveform_data.append(float(rms))

        waveform_end = time.time()
        logger.info(
            f"Waveform calculation took {waveform_end - waveform_start:.2f} seconds"
        )

        # Normalize to 0-1
        if waveform_data:
            max_val = max(waveform_data)
            if max_val > 0:
                waveform_data = [round(val / max_val, 2) for val in waveform_data]

        end_time = time.time()
        logger.info(
            f"Total waveform generation took {end_time - start_time:.2f} seconds"
        )
        return waveform_data, round(duration)
    except Exception as e:
        end_time = time.time()
        logger.error(f"Error generating waveform with pydub: {str(e)}")
        logger.info(f"Falling back to librosa")
        # Fallback to librosa
        return generate_waveform_librosa(file_path, resolution)


def generate_waveform_librosa(file_path, resolution=200):
    """Legacy waveform generator using librosa (slower but more robust)."""
    start_time = time.time()
    logger.info(f"Starting librosa waveform generation for {file_path}")
    try:
        # Load the audio file with librosa
        load_start = time.time()
        y, sr = librosa.load(file_path, sr=None, res_type="kaiser_fast")
        load_end = time.time()
        logger.info(f"Audio loading took {load_end - load_start:.2f} seconds")

        # Calculate duration in seconds
        duration = librosa.get_duration(y=y, sr=sr)

        # Calculate segments for the resolution
        hop_length = max(1, len(y) // resolution)
        # Generate waveform data using RMS energy
        waveform_start = time.time()
        waveform_data = []
        for i in range(0, len(y), hop_length):
            if len(waveform_data) >= resolution:
                break  # Ensure we don't generate more than resolution

            chunk = y[i : i + hop_length]
            if len(chunk) > 0:
                rms = np.sqrt(np.mean(chunk**2))
                waveform_data.append(float(rms))
        waveform_end = time.time()
        logger.info(
            f"Waveform calculation took {waveform_end - waveform_start:.2f} seconds"
        )

        # Normalize values between 0 and 1
        if waveform_data:
            max_val = max(waveform_data)
            if max_val > 0:  # Avoid division by zero
                # clamp to 2 decimal points
                waveform_data = [round(val / max_val, 2) for val in waveform_data]

        end_time = time.time()
        logger.info(
            f"Total waveform generation took {end_time - start_time:.2f} seconds"
        )
        return waveform_data, round(duration)
    except Exception as e:
        end_time = time.time()
        logger.error(f"Error generating waveform: {str(e)}")
        logger.info(
            f"Failed waveform generation took {end_time - start_time:.2f} seconds"
        )
        return [], 0


# Use the faster pydub version by default
generate_waveform = generate_waveform_pydub


def get_audio_duration(file_path):
    """Get the duration of an audio file in seconds."""
    try:
        # Use pydub which is much faster than librosa for this task
        audio = AudioSegment.from_file(file_path)
        return round(len(audio) / 1000)
    except Exception as e:
        logger.error(f"Error getting audio duration with pydub: {str(e)}")
        try:
            # Fallback to librosa
            y, sr = librosa.load(file_path, sr=None)
            duration = librosa.get_duration(y=y, sr=sr)
            return round(duration)
        except Exception as e:
            logger.error(f"Error getting audio duration with librosa: {str(e)}")
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
    start_time = time.time()
    logger.info(f"Starting MP3 conversion for {input_file_path}")
    try:
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Generate output file path with .mp3 extension
        output_filename = f"{Path(input_file_path).stem}.mp3"
        output_file_path = os.path.join(output_dir, output_filename)

        # Try using pydub first (faster and no subprocess needed)
        try:
            pydub_start = time.time()
            audio = AudioSegment.from_file(input_file_path)
            # Export as MP3 with good quality
            audio.export(output_file_path, format="mp3", bitrate="192k")
            pydub_end = time.time()
            logger.info(f"Pydub conversion took {pydub_end - pydub_start:.2f} seconds")

            if (
                os.path.exists(output_file_path)
                and os.path.getsize(output_file_path) > 0
            ):
                end_time = time.time()
                logger.info(
                    f"MP3 conversion successful, took {end_time - start_time:.2f} seconds"
                )
                return output_file_path
            else:
                logger.warning("Pydub conversion failed, falling back to ffmpeg")
        except Exception as e:
            logger.warning(f"Pydub conversion error, falling back to ffmpeg: {str(e)}")

        # Fallback to ffmpeg
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

        # Run the command
        cmd_start = time.time()
        subprocess.run(command, check=True, capture_output=True, text=True)
        cmd_end = time.time()
        logger.info(f"ffmpeg subprocess took {cmd_end - cmd_start:.2f} seconds")

        # Verify the file was created and has content
        if os.path.exists(output_file_path) and os.path.getsize(output_file_path) > 0:
            end_time = time.time()
            logger.info(
                f"MP3 conversion successful, took {end_time - start_time:.2f} seconds"
            )
            return output_file_path
        else:
            end_time = time.time()
            logger.error("FFmpeg completed but output file is missing or empty")
            logger.info(f"Failed conversion took {end_time - start_time:.2f} seconds")
            return None

    except subprocess.CalledProcessError as e:
        end_time = time.time()
        logger.error(f"Error converting audio with ffmpeg (exit code {e.returncode})")
        logger.error(f"Command: {' '.join(command)}")
        logger.error(f"stdout: {e.stdout}")
        err_msg = f"stderr: {e.stderr}"
        logger.error(err_msg)
        logger.info(f"Failed MP3 conversion took {end_time - start_time:.2f} seconds")
        return None
    except Exception as e:
        end_time = time.time()
        logger.error(f"Unexpected error converting audio: {str(e)}")
        import traceback

        logger.error(traceback.format_exc())
        logger.info(f"Failed MP3 conversion took {end_time - start_time:.2f} seconds")
        return None


class UploadTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String()
        file = Upload(required=True)

    @login_required
    def mutate(self, info, title, file, description=None):
        total_start = time.time()
        logger.info(f"Starting track upload: '{title}' ({file.name})")

        user = info.context.user
        title_slug = slugify(title)
        if user.tracks.filter(title_slug=title_slug):
            logger.warning(f"Title conflict detected for '{title}'")
            raise Exception(
                "You already have a track with that title. "
                "Please choose a different one."
            )

        # Create track record
        db_start = time.time()
        track = Track(
            artist=user,
            title=title,
            title_slug=slugify(title),
            description=description or "",
        )
        track.save()
        db_end = time.time()
        logger.info(
            f"Track record created in {db_end - db_start:.2f} seconds, ID: {track.id}"
        )

        # Create a temporary directory to process the audio
        with tempfile.TemporaryDirectory() as temp_dir:
            logger.info(f"Using temporary directory: {temp_dir}")

            # Save the uploaded file to a temporary file
            write_start = time.time()
            original_filename = file.name
            _, original_ext = os.path.splitext(original_filename)
            artist_id = str(user.id)
            track_id = str(track.id)
            temp_file_path = os.path.join(temp_dir, f"original{original_ext}")

            with open(temp_file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)
            write_end = time.time()
            logger.info(
                f"Wrote upload to temp file in {write_end - write_start:.2f} seconds"
            )
            logger.info(f"Temp file size: {os.path.getsize(temp_file_path)} bytes")

            # Save the original file first
            orig_start = time.time()
            orig_dir_path = f"{artist_id}/audio/{track_id}/orig"
            orig_filename = f"{track_id}{original_ext}"
            orig_full_path = f"{orig_dir_path}/{orig_filename}"

            # Ensure the storage path exists (handles both local and cloud storage)
            ensure_storage_path_exists(orig_dir_path)

            with open(temp_file_path, "rb") as f:
                file_content = f.read()
                orig_storage_path = default_storage.save(
                    orig_full_path, ContentFile(file_content)
                )
            orig_end = time.time()
            logger.info(
                f"Original file saved in {orig_end - orig_start:.2f} seconds: {orig_storage_path}"
            )

            # Always convert to MP3 with high bitrate
            logger.info(f"Converting audio file to MP3...")
            converted_file_path = convert_audio_to_mp3(temp_file_path, temp_dir)

            if converted_file_path:
                # Save the converted MP3 file
                mp3_start = time.time()
                mp3_dir_path = f"{artist_id}/audio/{track_id}/320"
                mp3_filename = f"{track_id}.mp3"
                mp3_full_path = f"{mp3_dir_path}/{mp3_filename}"

                # Ensure the storage path exists (handles both local and cloud storage)
                ensure_storage_path_exists(mp3_dir_path)

                with open(converted_file_path, "rb") as f:
                    file_content = f.read()
                    mp3_storage_path = default_storage.save(
                        mp3_full_path, ContentFile(file_content)
                    )
                mp3_end = time.time()
                logger.info(
                    f"MP3 file saved in {mp3_end - mp3_start:.2f} seconds: {mp3_storage_path}"
                )
                logger.info(
                    f"MP3 file size: {os.path.getsize(converted_file_path)} bytes"
                )

                base_path = f"{artist_id}/audio/{track_id}"
                track.audio_file = base_path
                track.save()
                logger.info(f"TRACK SAVED: {track.title} (ID: {track_id})")

                try:
                    waveform_start = time.time()
                    # Process waveform from the MP3 (faster than the original file)
                    waveform_data, duration = generate_waveform(
                        converted_file_path, resolution=200
                    )
                    waveform_end = time.time()
                    logger.info(
                        f"Waveform processing completed in {waveform_end - waveform_start:.2f} seconds"
                    )

                    # Store the waveform and length
                    db_update_start = time.time()
                    track.audio_waveform_data = json.dumps(waveform_data)
                    track.audio_waveform_resolution = len(waveform_data)
                    track.audio_length = duration
                    track.save()
                    db_update_end = time.time()
                    logger.info(
                        f"Saved waveform data to DB in {db_update_end - db_update_start:.2f} seconds"
                    )
                    logger.info(
                        f"Generated waveform with {len(waveform_data)} data points"
                    )
                    logger.info(f"Audio duration: {duration} seconds")

                except Exception as e:
                    logger.error(f"Error processing audio: {str(e)}")
                    # Set default empty waveform data
                    track.audio_waveform_data = json.dumps([])
                    track.audio_waveform_resolution = 0
                    track.save()
                    logger.info(f"Set empty waveform data due to processing error")
            else:
                # Clean up the original file since conversion failed
                logger.error(f"MP3 conversion failed, cleaning up original file")
                try:
                    default_storage.delete(orig_storage_path)
                    logger.info(f"Original file deleted: {orig_storage_path}")
                except Exception as e:
                    logger.error(f"Error cleaning up original file: {str(e)}")

                # Throw an error for failed conversion
                raise Exception(
                    f"Failed to convert audio file to MP3. "
                    "Please try again or contact support."
                )

        total_end = time.time()
        logger.info(
            f"Complete track upload process took {total_end - total_start:.2f} seconds"
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


class UploadMultipleTracks(graphene.Mutation):
    tracks = graphene.List(TrackType)
    failed_uploads = graphene.List(graphene.String)

    class Arguments:
        files = graphene.List(Upload, required=True)
        titles = graphene.List(graphene.String, required=True)
        descriptions = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, files, titles, descriptions=None):
        user = info.context.user

        # Validate input lengths match
        if len(files) != len(titles):
            raise Exception("Number of files and titles must match")

        # Default descriptions to empty strings if not provided
        if descriptions is None:
            descriptions = [""] * len(files)
        elif len(descriptions) != len(files):
            raise Exception(
                "If provided, number of descriptions must match number of files"
            )

        # Validate all titles before processing any files
        title_conflicts = []
        title_slugs = []

        for i, title in enumerate(titles):
            title_slug = slugify(title)
            if title_slug in title_slugs:  # Check for conflicts within batch
                title_conflicts.append(f"Duplicate title in batch: '{title}'")
                continue

            if user.tracks.filter(title_slug=title_slug).exists():
                title_conflicts.append(
                    f"You already have a track with title: '{title}'. Please choose a different one."
                )
                continue

            title_slugs.append(title_slug)

        # If any title conflicts, abort the entire batch
        if title_conflicts:
            raise Exception("\n".join(title_conflicts))

        # Process all files
        successful_tracks = []
        failed_uploads = []

        for i, (file, title, description) in enumerate(
            zip(files, titles, descriptions)
        ):
            try:
                # Create the track record
                track = Track(
                    artist=user,
                    title=title,
                    title_slug=slugify(title),
                    description=description,
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

                    # Ensure storage path exists for both local and cloud environments
                    ensure_storage_path_exists(orig_dir_path)

                    with open(temp_file_path, "rb") as f:
                        file_content = f.read()
                        orig_storage_path = default_storage.save(
                            orig_full_path, ContentFile(file_content)
                        )

                    print(f"Original file saved: {orig_storage_path}")

                    # Always convert to MP3 with high bitrate
                    print(f"Converting audio file to MP3...")
                    converted_file_path = convert_audio_to_mp3(temp_file_path, temp_dir)

                    if converted_file_path:
                        # Save the converted MP3 file
                        mp3_dir_path = f"{artist_id}/audio/{track_id}/320"
                        mp3_filename = f"{track_id}.mp3"
                        mp3_full_path = f"{mp3_dir_path}/{mp3_filename}"

                        # Ensure storage path exists for both local and cloud environments
                        ensure_storage_path_exists(mp3_dir_path)

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
                            print(
                                f"Generated waveform with {len(waveform_data)} data points"
                            )
                            print(f"Audio duration: {duration} seconds")

                        except Exception as e:
                            print(f"Error processing audio: {str(e)}")
                            # Set default empty waveform data
                            track.audio_waveform_data = json.dumps([])
                            track.audio_waveform_resolution = 0
                            track.save()

                        successful_tracks.append(track)
                    else:
                        # Clean up the original file since conversion failed
                        try:
                            default_storage.delete(orig_storage_path)
                        except Exception as e:
                            print(f"Error cleaning up original file: {str(e)}")

                        # Add to failed uploads
                        track.delete()  # Remove the track entry
                        failed_uploads.append(f"Failed to convert '{title}' to MP3.")

            except Exception as e:
                failed_uploads.append(f"Error processing '{title}': {str(e)}")
                # If the track was created, attempt to delete it
                if "track" in locals() and track.id:
                    try:
                        track.delete()
                    except Exception:
                        pass

        # If no successful uploads, raise an exception
        if not successful_tracks and failed_uploads:
            raise Exception("All uploads failed: " + "\n".join(failed_uploads))

        return UploadMultipleTracks(
            tracks=successful_tracks, failed_uploads=failed_uploads
        )


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
            # Use the utility function
            delete_track_files(track)

        track.delete()
        return DeleteTrack(success=True)
