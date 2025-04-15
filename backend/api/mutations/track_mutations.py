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
    """Generate waveform data from an audio file."""
    try:
        # Load the audio file with librosa
        y, sr = librosa.load(file_path, sr=None)
        # Calculate segments for the resolution
        hop_length = max(1, len(y) // resolution)
        # Generate waveform data using RMS energy
        waveform_data = []
        for i in range(0, len(y), hop_length):
            if len(waveform_data) >= resolution:
                break  # Ensure we don't generate more than resolution

            chunk = y[i:i + hop_length]
            if len(chunk) > 0:
                rms = np.sqrt(np.mean(chunk**2))
                waveform_data.append(float(rms))
        # Normalize values between 0 and 1
        if waveform_data:
            max_val = max(waveform_data)
            if max_val > 0:  # Avoid division by zero
                # clamp to 2 decimal points
                waveform_data = [
                    float(f"{(val / max_val):.2f}")
                    for val in waveform_data
                ]

        return waveform_data
    except Exception as e:
        print(f"Error generating waveform: {str(e)}")
        return []


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
            "ffmpeg", "-y", "-i", input_file_path, 
            "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k",
            output_file_path
        ]
        
        # Run the command without storing the unused result
        subprocess.run(
            command, 
            check=True, 
            capture_output=True,
            text=True
        )
        
        # Verify the file was created and has content
        if (os.path.exists(output_file_path) and 
                os.path.getsize(output_file_path) > 0):
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
            _, ext = os.path.splitext(file.name)
            artist_id = str(user.id)
            track_id = str(track.id)
            temp_file_path = os.path.join(temp_dir, f"original{ext}")
            
            with open(temp_file_path, 'wb') as f:
                for chunk in file.chunks():
                    f.write(chunk)
            
            # Check if we need to convert the audio
            # Convert to MP3 if not already in that format
            if ext.lower() not in ['.mp3']:
                print(f"Converting {ext} file to MP3...")
                converted_file_path = convert_audio_to_mp3(
                    temp_file_path, temp_dir
                )
                
                if converted_file_path:
                    # Use the converted file
                    final_file_path = converted_file_path
                    final_ext = '.mp3'
                else:
                    # Throw an error instead of falling back to the original
                    raise Exception(
                        f"Failed to convert {ext} file to MP3. "
                        "Please upload an MP3 file or contact support."
                    )
            else:
                # No conversion needed
                final_file_path = temp_file_path
                final_ext = ext
            
            # Save the final file to storage
            filename = f"{track_id}{final_ext}"
            path = f'audio/{artist_id}/{track_id}/{filename}'
            
            with open(final_file_path, 'rb') as f:
                file_content = f.read()
                file_path = default_storage.save(
                    path, ContentFile(file_content)
                )
            
            track.audio_file = file_path
            track.save()
            print("TRACK SAVED")

            # Process audio to generate waveform data
            try:
                # Generate waveform data with resolution data points
                waveform_data = generate_waveform(
                    final_file_path, resolution=200
                )
                
                # Store the waveform data
                track.audio_waveform_data = json.dumps(waveform_data)
                track.audio_waveform_resolution = len(waveform_data)
                track.save()
                
            except Exception as e:
                print(f"Error processing audio: {str(e)}")
                # Set default empty waveform data
                track.audio_waveform_data = json.dumps([])
                track.audio_waveform_resolution = 0
                track.save()
        
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
            default_storage.delete(track.audio_file.name)

        track.delete()
        return DeleteTrack(success=True) 