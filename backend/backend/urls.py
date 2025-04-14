from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from graphene_file_upload.django import FileUploadGraphQLView
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.views.static import serve

urlpatterns = [
    # Admin and GraphQL API
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(FileUploadGraphQLView.as_view(graphiql=settings.DEBUG))),
    
    # Explicitly serve media files
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT
    }),
    
    # Serve frontend assets
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': settings.FRONTEND_DIR / 'assets'
    }),
    
    # Serve favicon and other static files from root
    re_path(r'^(?P<path>favicon\.ico|icon\.svg|favicon-\d+\.png)$', serve, {
        'document_root': settings.FRONTEND_DIR
    }),
    
    # Serve the frontend's index.html for all other routes
    re_path(r'^$', TemplateView.as_view(template_name='index.html')),
    re_path(r'^(?!admin|graphql|media|assets).*$', TemplateView.as_view(template_name='index.html')),
]

# Add media URL in development 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)