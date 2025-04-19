from api.models import Follow
from graphene_django import DjangoObjectType


class FollowType(DjangoObjectType):
    class Meta:
        model = Follow
        fields = ("id", "follower", "followed", "created_at")
