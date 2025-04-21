import graphene
from django.contrib.auth import authenticate, login, logout
from api.types.user import UserType


class LoginMutation(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, username, password):
        # info.context is the WSGIRequest
        request = info.context
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return LoginMutation(success=True, message="Login successful", user=user)
        else:
            return LoginMutation(
                success=False, message="Please enter valid credentials", user=None
            )


class LogoutMutation(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info):
        # info.context is the WSGIRequest
        request = info.context

        # Always call logout regardless of auth state - Django handles this gracefully
        logout(request)
        return LogoutMutation(success=True, message="Successfully logged out")
