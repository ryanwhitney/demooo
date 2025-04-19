import graphene
from api.models import Follow, User
from api.types.follow import FollowType
from api.types.user import UserType
from graphql_jwt.decorators import login_required


class FollowQueries:
    # Get users following the specified user
    followers = graphene.List(UserType, username=graphene.String(required=True))

    # Get users that the specified user is following
    following = graphene.List(UserType, username=graphene.String(required=True))

    # Check if current user follows another user
    is_following = graphene.Boolean(username=graphene.String(required=True))

    def resolve_followers(self, info, username):
        try:
            user = User.objects.get(username=username)
            # Get all users who follow this user
            follower_ids = Follow.objects.filter(followed=user).values_list(
                "follower_id", flat=True
            )
            return User.objects.filter(id__in=follower_ids)
        except User.DoesNotExist:
            return []

    def resolve_following(self, info, username):
        try:
            user = User.objects.get(username=username)
            # Get all users this user follows
            followed_ids = Follow.objects.filter(follower=user).values_list(
                "followed_id", flat=True
            )
            return User.objects.filter(id__in=followed_ids)
        except User.DoesNotExist:
            return []

    @login_required
    def resolve_is_following(self, info, username):
        current_user = info.context.user
        try:
            user_to_check = User.objects.get(username=username)
            return Follow.objects.filter(
                follower=current_user, followed=user_to_check
            ).exists()
        except User.DoesNotExist:
            return False
