#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Now import Django modules
from django.core.files.storage import default_storage
from django.conf import settings
from importlib import import_module

print("=" * 80)
print("STORAGE DEBUG")
print("=" * 80)

print(f"DEFAULT_FILE_STORAGE setting: {settings.DEFAULT_FILE_STORAGE}")
print(f"USE_CLOUDFLARE_R2 setting: {settings.USE_CLOUDFLARE_R2}")

print("\nStorage class inspection:")
# Get the storage class dynamically
try:
    module_path, class_name = settings.DEFAULT_FILE_STORAGE.rsplit(".", 1)
    module = import_module(module_path)
    storage_class = getattr(module, class_name)
    print(f"Storage class: {storage_class}")
except Exception as e:
    print(f"Error getting storage class: {e}")

print(f"default_storage.__class__: {default_storage.__class__}")
print(f"default_storage type: {type(default_storage)}")

print("\nR2 Configuration:")
for key in dir(settings):
    if key.startswith("AWS_"):
        value = getattr(settings, key)
        # Hide secret key for security
        if "SECRET" in key:
            value = "***" if value else None
        print(f"{key}: {value}")

print("\nStorage attributes:")
for attr in ["bucket_name", "access_key", "secret_key", "endpoint_url"]:
    if hasattr(default_storage, attr):
        value = getattr(default_storage, attr)
        if attr == "secret_key":
            value = "***" if value else None
        print(f"{attr}: {value}")
    else:
        print(f"{attr}: NOT FOUND")

# Try creating a test file
print("\nTrying to create a test file...")
try:
    test_file_name = "storage_test.txt"
    with open(__file__, "rb") as f:
        default_storage.save(test_file_name, f)
    print(f"Test file URL: {default_storage.url(test_file_name)}")
    print("SUCCESS: File saved")
except Exception as e:
    print(f"ERROR: {e}")

print("\nDone.")
