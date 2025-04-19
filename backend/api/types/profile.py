import graphene
from graphene_django import DjangoObjectType

from api.models import Profile


class ProfileType(DjangoObjectType):
    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "bio",
            "location",
            "profile_picture",
            "created_at",
            "updated_at",
        )

    profile_picture_url = graphene.String(description="Full URL to the profile picture")
    profile_picture_optimized_url = graphene.String(
        description="URL to the optimized profile picture"
    )

    def resolve_profile_picture_url(self, info):
        """Resolve the full URL to the profile picture"""
        return self.profile_picture_url

    def resolve_profile_picture_optimized_url(self, info):
        """Resolve the URL to the optimized profile picture"""
        return self.profile_picture_optimized_url
