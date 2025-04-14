import json
import os
import tempfile

import graphene
import librosa
import numpy as np
from django.core.files.storage import default_storage
from django.utils.text import slugify
from graphene_file_upload.scalars import Upload
from graphql_jwt.decorators import login_required

from ..models import Track
from ..types.track import TrackType


def generate_waveform(file_path, resolution=80):
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
                waveform_data = [float(f"{(val / max_val):.2f}")for val in waveform_data]

        return waveform_data
    except Exception as e:
        print(f"Error generating waveform: {str(e)}")
        return []


class UploadTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String()
        file = Upload(required=True)

    @login_required
    def mutate(self, info, title, file, description=None):
        track = Track(
            artist=info.context.user,
            title=title,
            title_slug=slugify(title),
            description=description or "",
        )
        track.save()

        _, ext = os.path.splitext(file.name)
        artist_id = str(info.context.user.id)
        track_id = str(track.id)
        filename = f"{track_id}{ext}"
        path = f'audio/{artist_id}/{track_id}/{filename}'

        file_path = default_storage.save(path, file)
        track.audio_file = file_path
        track.save()
        print("TRACK SAVED")


        # Process audio to generate waveform data
        try:
            # Save to a temporary file for processing with librosa
            with tempfile.NamedTemporaryFile(suffix=ext) as temp_file:
                # Get the uploaded file again for processing
                file_obj = default_storage.open(file_path)
                temp_file.write(file_obj.read())
                temp_file.flush()
                print("WORKING ON IT")
                # Generate waveform data with 80 data points
                waveform_data = generate_waveform(temp_file.name, resolution=80)
                
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

        if track.user != info.context.user:
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

        if track.user != info.context.user:
            raise Exception("You do not have permission to delete this track")

        if track.audio_file:
            default_storage.delete(track.audio_file.name)

        track.delete()
        return DeleteTrack(success=True) 