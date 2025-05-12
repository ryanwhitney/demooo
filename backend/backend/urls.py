from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from api.views import (
    session_debug,
    get_csrf_token,
    CustomGraphQLView,
)  # Import the custom view

urlpatterns = [
    # Admin and GraphQL API
    path("admin/", admin.site.urls),
    # Use our custom GraphQL view that handles CSRF correctly
    path("graphql/", CustomGraphQLView.as_view(graphiql=settings.DEBUG)),
    # Debug and CSRF endpoints
    path("api/debug/session/", session_debug, name="session_debug"),
    path("api/csrf/", get_csrf_token, name="csrf"),
    # Serve robots.txt
    path(
        "robots.txt",
        serve,
        {"document_root": settings.FRONTEND_DIR, "path": "robots.txt"},
    ),
    # Serve frontend assets
    re_path(
        r"^assets/(?P<path>.*)$",
        serve,
        {"document_root": settings.FRONTEND_DIR / "assets"},
    ),
    # Serve favicon and other static files from root
    re_path(
        r"^(?P<path>favicon\.ico|icon\.svg|favicon-\d+\.png)$",
        serve,
        {"document_root": settings.FRONTEND_DIR},
    ),
    # Serve the frontend's index.html for all other routes
    re_path(r"^$", TemplateView.as_view(template_name="index.html")),
    re_path(
        r"^(?!admin|graphql|media|assets|robots\.txt).*$",
        TemplateView.as_view(template_name="index.html"),
    ),
]

# Add media URL in development only when NOT using Cloudflare R2
if not settings.USE_CLOUDFLARE_R2:
    urlpatterns += [
        re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
    ]
    if settings.DEBUG:
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
