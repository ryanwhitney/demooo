#!/usr/bin/env python
"""
Script to directly test Cloudflare R2 storage without Django's lazy loading
"""
import os
import django
import sys
from pathlib import Path

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Now import the settings and our storage class
from django.conf import settings
from api.storage import CloudflareR2Storage

print("\n" + "=" * 80)
print("CLOUDFLARE R2 DIRECT TEST")
print("=" * 80)

if not settings.USE_CLOUDFLARE_R2:
    print("❌ USE_CLOUDFLARE_R2 is set to False. Set it to True to test R2 storage.")
    sys.exit(1)

print("Creating direct R2 storage instance...")
try:
    # Create a storage instance directly
    r2 = CloudflareR2Storage()

    # Print key settings
    print(f"Bucket name: {r2.bucket_name}")
    print(f"Endpoint URL: {r2.endpoint_url}")

    # Test listing objects
    print("\nListing objects in bucket...")
    objects = list(r2.bucket.objects.all().limit(10))
    print(f"Found {len(objects)} objects in bucket")
    for obj in objects:
        print(f" - {obj.key}")

    # Test uploading a file
    print("\nUploading a test file...")
    test_file_name = "r2_direct_test.txt"

    with open(__file__, "rb") as f:
        r2.save(test_file_name, f)

    print(f"Test file URL: {r2.url(test_file_name)}")
    print("✅ SUCCESS: File saved to R2")

except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback

    traceback.print_exc()

print("\nDone.")
