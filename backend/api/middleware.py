class GraphQLAuthenticationMiddleware:
    """
    Middleware for GraphQL authentication using Django sessions.

    In Django's Graphene implementation, info.context is already the WSGIRequest object,
    so we don't need to set the user as it's already available via Django's auth middleware.
    """

    def resolve(self, next, root, info, **kwargs):
        # Django's auth middleware already sets request.user
        # We can directly use info.context.user in resolvers
        return next(root, info, **kwargs)
