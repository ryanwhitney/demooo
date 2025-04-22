import graphene
from api.models import Track, User
from api.types.track import TrackType
from django.db.models import Prefetch
import re


def camel_to_snake(name):
    """Convert camelCase to snake_case"""
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


class TrackQueries:
    track = graphene.Field(TrackType, id=graphene.ID())
    tracks = graphene.List(
        TrackType,
        limit=graphene.Int(default_value=None),
        orderBy=graphene.String(default_value=None),
    )
    user_tracks = graphene.List(TrackType, username=graphene.String())
    track_by_slug = graphene.Field(
        TrackType, username=graphene.String(), slug=graphene.String()
    )

    def resolve_track(self, info, id):
        try:
            return Track.objects.get(pk=id)
        except Track.DoesNotExist:
            return None

    def resolve_tracks(self, info, limit=None, orderBy=None):
        # Start with a query that prefetches related data
        query = Track.objects.select_related("artist").prefetch_related(
            Prefetch("artist__profile")
        )

        # Apply ordering if provided
        if orderBy:
            # Parse the orderBy string format: "field_direction"
            # Example: "createdAt_DESC" or "title_ASC"
            parts = orderBy.split("_")
            if len(parts) >= 2:
                # Last part is direction, everything before is the field
                direction = parts[-1]
                field_parts = parts[:-1]
                field = "_".join(field_parts)

                # Convert camelCase field to snake_case for database
                db_field = camel_to_snake(field)

                # Add negative sign for descending order
                prefix = "-" if direction.upper() == "DESC" else ""
                query = query.order_by(f"{prefix}{db_field}")
            else:
                # Default to created_at descending if format is incorrect
                query = query.order_by("-created_at")
        else:
            # Default ordering by created date (newest first)
            query = query.order_by("-created_at")

        # Apply limit if provided
        if limit:
            query = query[:limit]

        return query

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
