from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings
import boto3


class CloudflareR2Storage(S3Boto3Storage):
    """
    Custom storage class for Cloudflare R2

    This implementation directly initializes the S3 client with explicit
    credentials to ensure proper connection to Cloudflare R2.
    """

    # Default settings that don't depend on Django settings
    location = ""  # Store files in bucket root
    file_overwrite = False  # Don't overwrite existing files with same name

    def __init__(self, *args, **kwargs):
        # Set the specific R2 settings
        self.access_key = settings.AWS_ACCESS_KEY_ID
        self.secret_key = settings.AWS_SECRET_ACCESS_KEY
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        self.endpoint_url = settings.AWS_S3_ENDPOINT_URL

        # Initialize with R2 settings
        super().__init__(
            access_key=self.access_key,
            secret_key=self.secret_key,
            bucket_name=self.bucket_name,
            endpoint_url=self.endpoint_url,
            region_name=settings.AWS_S3_REGION_NAME,
            custom_domain=None,  # Don't use custom domain
            addressing_style=settings.AWS_S3_ADDRESSING_STYLE,
            signature_version=settings.AWS_S3_SIGNATURE_VERSION,
            default_acl=settings.AWS_DEFAULT_ACL,
            querystring_auth=settings.AWS_QUERYSTRING_AUTH,
            *args,
            **kwargs,
        )

        # Test connection upon initialization in debug mode
        if settings.DEBUG:
            try:
                # Check if we can list the bucket
                self.bucket.objects.all().limit(1)
                print(f"✅ Successfully connected to R2 bucket: {self.bucket_name}")
            except Exception as e:
                print(f"⚠️ R2 connection ERROR: {e}")

    def _get_connection(self):
        """Override the connection method to ensure proper R2 initialization"""
        if self._connections.get(self.access_key) is None:
            # Create a new connection with explicit settings
            connection = boto3.resource(
                "s3",
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                endpoint_url=self.endpoint_url,
                region_name=settings.AWS_S3_REGION_NAME,
                config=boto3.session.Config(
                    s3={"addressing_style": settings.AWS_S3_ADDRESSING_STYLE},
                    signature_version=settings.AWS_S3_SIGNATURE_VERSION,
                ),
            )
            self._connections[self.access_key] = connection

        # Return the connection
        return self._connections[self.access_key]

    def get_presigned_url(self, name, expiration=3600):
        """
        Generate a presigned URL for the given object name.

        Args:
            name: The name of the object (file path within bucket)
            expiration: The expiration time in seconds (default: 1 hour)

        Returns:
            str: The presigned URL
        """
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            endpoint_url=self.endpoint_url,
            region_name=settings.AWS_S3_REGION_NAME,
            config=boto3.session.Config(
                s3={"addressing_style": settings.AWS_S3_ADDRESSING_STYLE},
                signature_version=settings.AWS_S3_SIGNATURE_VERSION,
            ),
        )

        try:
            # Generate the presigned URL
            url = s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": self.name_for_path(name),
                },
                ExpiresIn=expiration,
            )
            return url
        except Exception as e:
            if settings.DEBUG:
                print(f"Error generating presigned URL: {e}")
            return None

    def name_for_path(self, name):
        """
        Get the properly formatted name (key) for a path
        """
        if name.startswith(self.location):
            return name
        if self.location:
            return f"{self.location.rstrip('/')}/{name}"
        return name
