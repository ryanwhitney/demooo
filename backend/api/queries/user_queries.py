import graphene
from api.models import User
from api.types.user import UserType
from graphql_jwt.decorators import login_required


class UserQueries:
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
