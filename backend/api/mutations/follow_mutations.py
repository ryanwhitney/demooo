import graphene
from api.models import Follow, User
from api.types.user import UserType
from django.db import IntegrityError
from graphql_jwt.decorators import login_required


class FollowUser(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    @login_required
    def mutate(self, info, username):
        try:
            current_user = info.context.user
            user_to_follow = User.objects.get(username=username)

            # Don't allow following yourself
            if current_user.id == user_to_follow.id:
                return FollowUser(
                    success=False, message="You cannot follow yourself", user=None
                )

            # Create the follow relationship
            follow, created = Follow.objects.get_or_create(
                follower=current_user, followed=user_to_follow
            )

            if not created:
                return FollowUser(
                    success=False,
                    message="You are already following this user",
                    user=user_to_follow,
                )

            return FollowUser(
                success=True, message="Successfully followed user", user=user_to_follow
            )

        except User.DoesNotExist:
            return FollowUser(success=False, message="User not found", user=None)
        except IntegrityError:
            return FollowUser(
                success=False, message="Database error occurred", user=None
            )


class UnfollowUser(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    @login_required
    def mutate(self, info, username):
        try:
            current_user = info.context.user
            user_to_unfollow = User.objects.get(username=username)

            # Try to find the follow relationship
            try:
                follow = Follow.objects.get(
                    follower=current_user, followed=user_to_unfollow
                )
                follow.delete()

                return UnfollowUser(
                    success=True,
                    message="Successfully unfollowed user",
                    user=user_to_unfollow,
                )

            except Follow.DoesNotExist:
                return UnfollowUser(
                    success=False,
                    message="You are not following this user",
                    user=user_to_unfollow,
                )

        except User.DoesNotExist:
            return UnfollowUser(success=False, message="User not found", user=None)
