import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

# Add to settings.py
import logging

logger = logging.getLogger("django")

# Make sure env vars are loaded before anything else
BASE_DIR = Path(__file__).resolve().parent.parent
# Path to the frontend dist directory
FRONTEND_DIR = Path(BASE_DIR).parent / "dist"


env_file = ".env.local"  # fallback
if os.environ.get("ENVIRONMENT") == "production":
    env_file = ".env.production"
elif os.environ.get("ENVIRONMENT") == "docker":
    env_file = ".env.docker"

# Load from .env (project root > backend > settings dir)
load_dotenv(dotenv_path=Path(BASE_DIR).parent / env_file, override=True)
load_dotenv(dotenv_path=BASE_DIR / env_file, override=True)
load_dotenv(dotenv_path=Path(__file__).resolve().parent / env_file, override=True)

# Now you can safely access env vars
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

# Now access the environment variable
USE_CLOUDFLARE_R2 = os.environ.get("USE_CLOUDFLARE_R2", "false").lower() == "true"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "True").lower() == "true"
# Log for debugging
logger = logging.getLogger("django")
logger.info(f"USE_CLOUDFLARE_R2 raw value: {os.environ.get('USE_CLOUDFLARE_R2')}")
logger.info(f"Evaluated USE_CLOUDFLARE_R2: {USE_CLOUDFLARE_R2}")

# Set default storage first to local storage
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

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
    "api.apps.ApiConfig",  # Explicitly use our ApiConfig instead of just "api"
]

# Then override with R2 if requested
if USE_CLOUDFLARE_R2:
    # Use custom storage class for R2
    DEFAULT_FILE_STORAGE = "api.storage.CloudflareR2Storage"
    # Don't use R2 for static files since we want them to be served directly
    # STATICFILES_STORAGE = "api.storage.CloudflareR2Storage"

    # R2 connection settings
    AWS_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME")
    AWS_S3_ENDPOINT_URL = os.environ.get("R2_ENDPOINT_URL")
    AWS_S3_REGION_NAME = "auto"
    AWS_S3_ADDRESSING_STYLE = "path"
    AWS_DEFAULT_ACL = "public-read"

    # Additional settings to fix R2 compatibility issues
    AWS_S3_SIGNATURE_VERSION = "s3v4"
    AWS_QUERYSTRING_AUTH = False

    MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/"

    if DEBUG:
        print(f"Using Cloudflare R2 storage with bucket: {AWS_STORAGE_BUCKET_NAME}")

        # Display settings for debugging
        r2_settings = {
            "DEFAULT_FILE_STORAGE": DEFAULT_FILE_STORAGE,
            "AWS_ACCESS_KEY_ID": (
                AWS_ACCESS_KEY_ID[:4] + "..." if AWS_ACCESS_KEY_ID else None
            ),
            "AWS_SECRET_ACCESS_KEY": "***" if AWS_SECRET_ACCESS_KEY else None,
            "AWS_STORAGE_BUCKET_NAME": AWS_STORAGE_BUCKET_NAME,
            "AWS_S3_ENDPOINT_URL": AWS_S3_ENDPOINT_URL,
            "AWS_S3_REGION_NAME": AWS_S3_REGION_NAME,
            "AWS_S3_ADDRESSING_STYLE": AWS_S3_ADDRESSING_STYLE,
            "AWS_DEFAULT_ACL": AWS_DEFAULT_ACL,
            "MEDIA_URL": MEDIA_URL,
        }
        print("R2 Settings:", r2_settings)
else:
    # Local dev file storage is already set as default above
    print("Using local file storage at:", MEDIA_ROOT)


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

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

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
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
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

GRAPHENE = {
    "SCHEMA": "api.schema.schema",
    "MIDDLEWARE": [
        "graphql_jwt.middleware.JSONWebTokenMiddleware",
    ],
}

AUTHENTICATION_BACKENDS = [
    "graphql_jwt.backends.JSONWebTokenBackend",
    "django.contrib.auth.backends.ModelBackend",
]

GRAPHQL_JWT = {
    "JWT_VERIFY_EXPIRATION": True,
    "JWT_EXPIRATION_DELTA": timedelta(days=7),
}

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get(
            "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres"
        ),
        conn_max_age=600,
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


# CSRF trusted origins for production
CSRF_TRUSTED_ORIGINS = [
    "https://demooo.fly.dev",
]
