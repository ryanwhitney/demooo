from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from graphene_file_upload.django import FileUploadGraphQLView
from django.middleware.csrf import get_token


@require_GET
def session_debug(request):
    """
    Debug endpoint to check session state.
    """
    is_authenticated = request.user.is_authenticated

    response = {
        "authenticated": is_authenticated,
        "user": request.user.username if is_authenticated else None,
        "session_key": request.session.session_key,
        "session_data": dict(request.session.items()),
        "cookies": {key: request.COOKIES.get(key) for key in request.COOKIES},
    }

    return JsonResponse(response)


@ensure_csrf_cookie
@require_GET
def get_csrf_token(request):
    """
    This view sets the CSRF cookie and returns a 200 response.
    Used to ensure that the CSRF cookie is set before any POST requests.
    """
    # Force cookie to be set
    get_token(request)

    return JsonResponse({"detail": "CSRF cookie set"})


class CustomGraphQLView(FileUploadGraphQLView):
    """
    Custom GraphQL view that exempts GET requests from CSRF protection.

    This follows Django's standard behavior where:
    - GET requests (queries) don't need CSRF protection
    - POST requests (mutations) require CSRF protection

    Additionally, we ensure the CSRF cookie is set on all responses.
    """

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, request, *args, **kwargs):
        # For GET requests, exempt from CSRF
        if request.method == "GET":
            response = super().dispatch(request, *args, **kwargs)
            return response

        # For POST requests, ensure the CSRF token is set
        get_token(request)  # Force token generation

        # For other methods (POST), use normal CSRF protection
        return super().dispatch(request, *args, **kwargs)
