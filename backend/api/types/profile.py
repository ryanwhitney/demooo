import graphene
from graphene_django import DjangoObjectType
from ..models import Profile


class ProfileType(DjangoObjectType):
    profile_picture_optimized_url = graphene.String()
    profile_picture_original_url = graphene.String()

    class Meta:
        model = Profile
        fields = (
            "id",
            "user",
            "name",
            "location",
            "bio",
            "profile_picture",
            "created_at",
            "updated_at",
        )

    def resolve_profile_picture_optimized_url(self, info):
        return self.profile_picture_optimized_url
