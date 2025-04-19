from api.models import FavoriteTrack
from graphene_django import DjangoObjectType


class FavoriteTrackType(DjangoObjectType):
    class Meta:
        model = FavoriteTrack
        fields = ("id", "user", "track", "created_at")
