import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from graphql_jwt.decorators import login_required
from .models import Profile


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class ProfileType(DjangoObjectType):
    class Meta:
        model = Profile
        fields = ('id', 'user', 'bio', 'website', 'created_at', 'updated_at')


class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    user = graphene.Field(UserType, username=graphene.String())
    users = graphene.List(UserType)
    
    @login_required
    def resolve_me(self, info):
        return info.context.user
    
    def resolve_user(self, info, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
    
    def resolve_users(self, info):
        return User.objects.all()


class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)
    
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)
    
    def mutate(self, info, username, password, email):
        user = get_user_model()(
            username=username,
            email=email,
        )
        user.set_password(password)
        user.save()
        
        return CreateUser(user=user)


class UpdateProfile(graphene.Mutation):
    profile = graphene.Field(ProfileType)
    
    class Arguments:
        bio = graphene.String()
        website = graphene.String()
    
    @login_required
    def mutate(self, info, bio=None, website=None):
        user = info.context.user
        profile = user.profile
        
        if bio is not None:
            profile.bio = bio
        if website is not None:
            profile.website = website
            
        profile.save()
        return UpdateProfile(profile=profile)


class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    update_profile = UpdateProfile.Field()
    # JWT mutations are added automatically by django-graphql-jwt


schema = graphene.Schema(query=Query, mutation=Mutation)