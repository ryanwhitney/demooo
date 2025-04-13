import graphene
from graphql_jwt.decorators import login_required
from ..types.profile import ProfileType


class UpdateProfile(graphene.Mutation):
    profile = graphene.Field(ProfileType)

    class Arguments:
        bio = graphene.String()
        website = graphene.String()

    @login_required
    def mutate(self, info, bio=None, website=None):
        user = info.context.user
        profile = user.profile

        if bio is not None:
            profile.bio = bio
        if website is not None:
            profile.website = website

        profile.save()
        return UpdateProfile(profile=profile) 