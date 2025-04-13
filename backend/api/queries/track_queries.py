import graphene
from ..types.track import TrackType
from ..models import Track, User


class TrackQueries:
    track = graphene.Field(TrackType, id=graphene.ID())
    tracks = graphene.List(TrackType)
    user_tracks = graphene.List(TrackType, username=graphene.String())
    track_by_slug = graphene.Field(TrackType, username=graphene.String(), slug=graphene.String())

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
            return Track.objects.filter(artist=user)
        except User.DoesNotExist:
            return []

    def resolve_track_by_slug(self, info, username, slug):
        try:
            # First find the artist by username
            user = User.objects.get(username=username)
            # Then get their track with the matching slug
            return Track.objects.get(artist=user, title_slug=slug)
        except (User.DoesNotExist, Track.DoesNotExist):
            return None