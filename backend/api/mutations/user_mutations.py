import graphene
from api.models import User
from api.types.user import UserType


class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)
        first_name = graphene.String()
        last_name = graphene.String()

    def mutate(self, info, username, password, email, first_name=None, last_name=None):
        if User.objects.filter(username=username).exists():
            raise Exception(f"User with username '{username}' already exists")

        if User.objects.filter(email=email).exists():
            raise Exception(f"User with email '{email}' already exists")

        user = User(
            username=username,
            email=email,
            first_name=first_name or "",
            last_name=last_name or "",
        )
        user.set_password(password)
        user.save()

        return CreateUser(user=user)
