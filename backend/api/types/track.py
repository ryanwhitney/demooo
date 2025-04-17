import graphene
from graphene_django import DjangoObjectType

from ..models import Track


class TrackType(DjangoObjectType):
    class Meta:
        model = Track
        fields = (
            "id",
            "title",
            "title_slug",
            "artist",  # Only include artist, not user
            "description",
            "audio_file",
            "audio_length",
            "audio_waveform_data",
            "audio_waveform_resolution",
            "created_at",
            "updated_at",
        )

    audio_url = graphene.String()

    def resolve_audio_url(self, info):
        if self.audio_file:
            return self.audio_file.url
        return None
