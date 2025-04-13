import graphene
import graphql_jwt

# Import all the modular components
from .queries.user_queries import UserQueries
from .queries.track_queries import TrackQueries
from .mutations.user_mutations import CreateUser
from .mutations.profile_mutations import UpdateProfile
from .mutations.track_mutations import UploadTrack, UpdateTrack, DeleteTrack


class Query(UserQueries, TrackQueries, graphene.ObjectType):
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
    upload_track = UploadTrack.Field()
    update_track = UpdateTrack.Field()
    delete_track = DeleteTrack.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
