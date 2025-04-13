from graphene_django import DjangoObjectType

from ..models import Profile


class ProfileType(DjangoObjectType):
    class Meta:
        model = Profile
        fields = (
            'id', 
            'user', 
            'bio', 
            'website', 
            'created_at', 
            'updated_at'
        ) 