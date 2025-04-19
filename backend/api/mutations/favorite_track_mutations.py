import graphene
from api.models import FavoriteTrack, Track
from api.types.track import TrackType
from django.db import IntegrityError
from graphql_jwt.decorators import login_required


class FavoriteTrackMutation(graphene.Mutation):
    class Arguments:
        track_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    track = graphene.Field(TrackType)

    @login_required
    def mutate(self, info, track_id):
        try:
            current_user = info.context.user
            track = Track.objects.get(pk=track_id)

            # Create the favorite relationship
            favorite, created = FavoriteTrack.objects.get_or_create(
                user=current_user, track=track
            )

            if not created:
                return FavoriteTrackMutation(
                    success=False,
                    message="You have already favorited this track",
                    track=track,
                )

            return FavoriteTrackMutation(
                success=True, message="Successfully favorited track", track=track
            )

        except Track.DoesNotExist:
            return FavoriteTrackMutation(
                success=False, message="Track not found", track=None
            )
        except IntegrityError:
            return FavoriteTrackMutation(
                success=False, message="Database error occurred", track=None
            )


class UnfavoriteTrackMutation(graphene.Mutation):
    class Arguments:
        track_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    track = graphene.Field(TrackType)

    @login_required
    def mutate(self, info, track_id):
        try:
            current_user = info.context.user
            track = Track.objects.get(pk=track_id)

            # Try to find the favorite relationship
            try:
                favorite = FavoriteTrack.objects.get(user=current_user, track=track)
                favorite.delete()

                return UnfavoriteTrackMutation(
                    success=True, message="Successfully unfavorited track", track=track
                )

            except FavoriteTrack.DoesNotExist:
                return UnfavoriteTrackMutation(
                    success=False,
                    message="You have not favorited this track",
                    track=track,
                )

        except Track.DoesNotExist:
            return UnfavoriteTrackMutation(
                success=False, message="Track not found", track=None
            )
