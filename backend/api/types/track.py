import graphene
from graphene_django import DjangoObjectType

from ..models import Track


class TrackType(DjangoObjectType):
    class Meta:
        model = Track
        fields = (
            'id',
            'user',
            'title',
            'description',
            'tags',
            'audio_file',
            'created_at',
            'updated_at'
        )

    audio_url = graphene.String()

    def resolve_audio_url(self, info):
        if self.audio_file:
            return self.audio_file.url
        return None 