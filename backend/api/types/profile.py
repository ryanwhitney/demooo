import graphene
from graphene_django import DjangoObjectType
from django.conf import settings

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
        description="Path to the optimized profile picture"
    )

    def resolve_profile_picture_url(self, info):
        """Resolve the full URL to the profile picture"""
        if not self.profile_picture:
            return None

        # Get the MEDIA_URL from settings, default to '/media/'
        media_url = getattr(settings, "MEDIA_URL", "/media/")

        # Get the domain for absolute URLs - handle test environment safely
        try:
            request = info.context
            # In tests, context might be a WSGIRequest without the get attribute
            if hasattr(request, "build_absolute_uri"):
                domain = request.build_absolute_uri("/").rstrip("/")
                if media_url.startswith("/"):
                    return f"{domain}{media_url}{self.profile_picture}"
        except (AttributeError, TypeError):
            # Fallback for test environment
            pass

        # Fallback to relative URL (safe for tests)
        if media_url.startswith(("http://", "https://")):
            return f"{media_url.rstrip('/')}/{self.profile_picture}"
        else:
            return f"{media_url}{self.profile_picture}"

    def resolve_profile_picture_optimized_url(self, info):
        """Resolve the path to the optimized profile picture"""
        # This maintains backward compatibility with existing code
        return self.profile_picture
