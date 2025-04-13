import graphene
import os
from graphql_jwt.decorators import login_required
from graphene_file_upload.scalars import Upload
from django.core.files.storage import default_storage
from django.utils.text import slugify
from ..types.track import TrackType
from ..models import Track



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