import graphene
from ..types.track import TrackType
from ..models import Track, User


class TrackQueries:
    track = graphene.Field(TrackType, id=graphene.ID())
    tracks = graphene.List(TrackType)
    user_tracks = graphene.List(TrackType, username=graphene.String())

    def resolve_track(self, info, id):
        try:
            return Track.objects.get(pk=id)
        except Track.DoesNotExist:
            return None

    def resolve_tracks(self, info):
        return Track.objects.all()

    def resolve_user_tracks(self, info, username):
        try:
            user = User.objects.get(username=username)
            return Track.objects.filter(user=user)
        except User.DoesNotExist:
            return [] 