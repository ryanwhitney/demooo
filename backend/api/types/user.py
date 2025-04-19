import graphene
from api.models import Follow, User
from graphene_django import DjangoObjectType


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "tracks",
            "profile",
        )

    followers_count = graphene.Int()
    following_count = graphene.Int()
    is_following = graphene.Boolean()

    def resolve_followers_count(self, info):
        return self.followers.count()

    def resolve_following_count(self, info):
        return self.following.count()

    def resolve_is_following(self, info):
        user = info.context.user
        if user.is_authenticated:
            return Follow.objects.filter(follower=user, followed=self).exists()
        return False
