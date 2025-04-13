from graphene_django import DjangoObjectType
from ..models import Profile


class ProfileType(DjangoObjectType):
    class Meta:
        model = Profile
        fields = (
            'id',
            'user',
            'name',
            'bio',
            'created_at',
            'updated_at'
        )