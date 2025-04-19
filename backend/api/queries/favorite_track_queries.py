import graphene
from api.models import FavoriteTrack, Track, User
from api.types.favorite_track import FavoriteTrackType
from api.types.track import TrackType
from graphql_jwt.decorators import login_required


class FavoriteTrackQueries:
    # Get tracks favorited by a user
    favorite_tracks = graphene.List(TrackType, username=graphene.String(required=True))

    # Check if current user has favorited a specific track
    is_track_favorited = graphene.Boolean(track_id=graphene.ID(required=True))

    def resolve_favorite_tracks(self, info, username):
        try:
            user = User.objects.get(username=username)
            # Get all tracks favorited by this user
            track_ids = FavoriteTrack.objects.filter(user=user).values_list(
                "track_id", flat=True
            )
            return Track.objects.filter(id__in=track_ids)
        except User.DoesNotExist:
            return []

    @login_required
    def resolve_is_track_favorited(self, info, track_id):
        current_user = info.context.user
        try:
            track = Track.objects.get(pk=track_id)
            return FavoriteTrack.objects.filter(user=current_user, track=track).exists()
        except Track.DoesNotExist:
            return False
