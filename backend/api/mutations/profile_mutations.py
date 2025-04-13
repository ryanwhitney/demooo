import graphene
from graphql_jwt.decorators import login_required
from ..types.profile import ProfileType


class UpdateProfile(graphene.Mutation):
    profile = graphene.Field(ProfileType)

    class Arguments:
        name = graphene.String()
        bio = graphene.String()

    @login_required
    def mutate(self, info, name=None, bio=None):
        user = info.context.user
        profile = user.profile

        if name is not None:
            profile.name = name
        if bio is not None:
            profile.bio = bio

        profile.save()
        return UpdateProfile(profile=profile) 