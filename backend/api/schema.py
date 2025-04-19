import graphene
import graphql_jwt
from api.mutations.favorite_track_mutations import (
    FavoriteTrackMutation,
    UnfavoriteTrackMutation,
)
from api.mutations.follow_mutations import FollowUser, UnfollowUser
from api.mutations.profile_mutations import UpdateProfile
from api.mutations.track_mutations import (
    DeleteTrack,
    UpdateTrack,
    UploadMultipleTracks,
    UploadTrack,
)
from api.mutations.user_mutations import CreateUser
from api.queries.favorite_track_queries import FavoriteTrackQueries
from api.queries.follow_queries import FollowQueries
from api.queries.track_queries import TrackQueries

# Import all the modular components
from api.queries.user_queries import UserQueries


class Query(
    UserQueries, TrackQueries, FollowQueries, FavoriteTrackQueries, graphene.ObjectType
):
    pass


class Mutation(graphene.ObjectType):
    # User mutations
    create_user = CreateUser.Field()
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()

    # Profile mutations
    update_profile = UpdateProfile.Field()

    # Track mutations
    upload_multiple_tracks = UploadMultipleTracks.Field()
    upload_track = UploadTrack.Field()
    update_track = UpdateTrack.Field()
    delete_track = DeleteTrack.Field()

    # Follow mutations
    follow_user = FollowUser.Field()
    unfollow_user = UnfollowUser.Field()

    # favorite track mutations
    favorite_track = FavoriteTrackMutation.Field()
    unfavorite_track = UnfavoriteTrackMutation.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
