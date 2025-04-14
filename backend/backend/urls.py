from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from graphene_file_upload.django import FileUploadGraphQLView
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.views.static import serve

# API and admin endpoints
urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(
        FileUploadGraphQLView.as_view(graphiql=settings.DEBUG)
    )),
    
    # Serve frontend static files directly
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': settings.FRONTEND_DIR / 'assets'
    }),
    
    # Serve favicon and other root static files
    re_path(r'^(?P<path>favicon\.ico|icon\.svg|favicon-\d+\.png)$', serve, {
        'document_root': settings.FRONTEND_DIR
    }),
    
    # Finally, serve React app for all other routes
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )