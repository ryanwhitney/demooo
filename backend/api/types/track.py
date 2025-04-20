import graphene
from api.models import FavoriteTrack, Track
from graphene_django import DjangoObjectType


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

    # Define audio_url as a String field - this will be sent to the client
    audio_url = graphene.String(description="URL to the MP3 audio file")
    favorites_count = graphene.Int()
    is_favorited = graphene.Boolean()

    def resolve_audio_url(self, info):
        """Return the presigned URL to the MP3 audio file"""
        return self.audio_url

    def resolve_favorites_count(self, info):
        return self.favorited_by.count()

    def resolve_is_favorited(self, info):
        user = info.context.user
        if user.is_authenticated:
            return FavoriteTrack.objects.filter(user=user, track=self).exists()
        return False
