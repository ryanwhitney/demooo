import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

# Django logging
import logging

logger = logging.getLogger("django")

# Make sure env vars are loaded before anything else
BASE_DIR = Path(__file__).resolve().parent.parent
# Path to the frontend dist directory
FRONTEND_DIR = Path(BASE_DIR).parent / "dist"
# Path to the config directory
CONFIG_DIR = Path(BASE_DIR).parent / "config"

# Determine which env file to use
env_file = ".env.local"  # fallback
if os.environ.get("ENVIRONMENT") == "production":
    env_file = ".env.production"
elif os.environ.get("ENVIRONMENT") == "docker":
    env_file = ".env.docker"

# Load from .env file in the project root
load_dotenv(dotenv_path=Path(BASE_DIR).parent / env_file, override=True)

# Environment settings
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
DEBUG = os.environ.get("DEBUG", "False").lower() == "true"
USE_CLOUDFLARE_R2 = os.environ.get("USE_CLOUDFLARE_R2", "false").lower() == "true"

# Log environment settings for debugging
logger.info(f"Environment: {ENVIRONMENT}")
logger.info(f"Debug mode: {DEBUG}")
logger.info(f"Using R2 storage: {USE_CLOUDFLARE_R2}")

# File storage configuration
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# Configure R2 storage if enabled
if USE_CLOUDFLARE_R2:

    # Use custom storage class
    DEFAULT_FILE_STORAGE = "api.storage.CloudflareR2Storage"

    # R2 connection settings
    AWS_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME")
    AWS_S3_ENDPOINT_URL = os.environ.get("R2_ENDPOINT_URL")
    AWS_S3_REGION_NAME = "auto"
    AWS_S3_ADDRESSING_STYLE = "path"

    # Files are private by default, we'll use presigned URLs
    AWS_DEFAULT_ACL = "private"

    # Additional settings to fix R2 compatibility issues
    AWS_S3_SIGNATURE_VERSION = "s3v4"
    AWS_QUERYSTRING_AUTH = True  # Enable query string auth for URLs

    MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/"

else:
    # Use default local file storage
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    "SECRET_KEY", "django-insecure-ff_uet=a%k(wee%&glo-3zoe&tgsoka-r9f@7j+9sf%bpu9_b!"
)

ALLOWED_HOSTS = (
    os.environ.get("ALLOWED_HOSTS", "").split(",")
    if os.environ.get("ALLOWED_HOSTS")
    else [
        "localhost",
        "127.0.0.1",
        "demooo.fly.dev",
    ]
)

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "storages",  # Always include storages first
    "graphene_django",
    "corsheaders",
    "api.apps.ApiConfig",  # Explicitly use our ApiConfig
]

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# Application definition

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [FRONTEND_DIR],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
            "debug": False,
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

GRAPHENE = {
    "SCHEMA": "api.schema.schema",
    "MIDDLEWARE": [
        "api.middleware.GraphQLAuthenticationMiddleware",
    ],
}

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

# Session settings
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = "Lax"

# CSRF settings
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_USE_SESSIONS = False  # Store in cookie, not session
CSRF_HEADER_NAME = "HTTP_X_CSRFTOKEN"  # Match the X-CSRFToken header
CSRF_TRUSTED_ORIGINS = [
    "https://demooo.fly.dev",
    "http://localhost:5173",
]

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get(
            "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres"
        ),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# User model
AUTH_USER_MODEL = "api.User"

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = "static/"
STATICFILES_DIRS = [
    FRONTEND_DIR / "assets",
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:4000,http://localhost:4173,http://localhost:5173,https://demooo.fly.dev",
).split(",")

CORS_ALLOW_CREDENTIALS = True


# Enable logging to console in production
if ENVIRONMENT == "production":
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
            },
        },
        "root": {
            "handlers": ["console"],
            "level": "WARNING",
        },
        "loggers": {
            "django": {
                "handlers": ["console"],
                "level": os.getenv("DJANGO_LOG_LEVEL", "WARNING"),
                "propagate": False,
            },
        },
    }
