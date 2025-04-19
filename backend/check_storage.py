#!/usr/bin/env python
"""
Script to check storage used throughout the application
"""
import os
import django

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Import needed modules
from django.conf import settings
from django.core.files.storage import default_storage
from api.utils import get_r2_storage
from io import BytesIO

print("\nStorage Check")
print("=" * 50)

# Check if we're configured to use R2
print(f"USE_CLOUDFLARE_R2 enabled: {settings.USE_CLOUDFLARE_R2}")
print(f"DEFAULT_FILE_STORAGE setting: {settings.DEFAULT_FILE_STORAGE}")

# Check what Django thinks default_storage is
print("\nDefault Storage:")
print(f"  Type: {type(default_storage)}")
print(f"  Class: {default_storage.__class__.__name__}")
if hasattr(default_storage, "_wrapped"):
    print(f"  _wrapped: {default_storage._wrapped.__class__.__name__}")

# Get direct R2 storage for comparison
r2_storage = get_r2_storage()
print("\nR2 Storage:")
print(f"  Type: {type(r2_storage)}")
print(f"  Class: {r2_storage.__class__.__name__}")

# Test both storages
test_file = "storage_check.txt"
test_content = "This is a test file for storage check"

print("\nTesting file operations...")

# Test default_storage
try:
    content = BytesIO(test_content.encode("utf-8"))
    path = default_storage.save(test_file, content)
    url = default_storage.url(test_file)
    print("default_storage test: SUCCESS")
    print(f"  Saved to: {path}")
    print(f"  URL: {url}")
except Exception as e:
    print(f"default_storage test: FAILED - {e}")

# Test direct R2 storage
try:
    r2_file = "r2_storage_check.txt"
    content = BytesIO(test_content.encode("utf-8"))
    path = r2_storage.save(r2_file, content)
    url = r2_storage.url(r2_file)
    print("r2_storage test: SUCCESS")
    print(f"  Saved to: {path}")
    print(f"  URL: {url}")
except Exception as e:
    print(f"r2_storage test: FAILED - {e}")

print("\nDone.")
