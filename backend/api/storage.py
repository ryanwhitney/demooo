from storages.backends.s3boto3 import S3Boto3Storage


class CloudflareR2Storage(S3Boto3Storage):
    """
    Custom storage class for Cloudflare R2
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add any R2 specific configuration here
