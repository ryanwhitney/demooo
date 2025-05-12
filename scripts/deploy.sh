#!/bin/bash

# Deploy script for Fly.io that uses the config file in the config/deployment directory
echo "Deploying to Fly.io using config at config/deployment/fly.toml"

# Run from the project root directory
cd "$(dirname "$0")/.." || exit 1

# Deploy using the config file in the config/deployment directory
fly deploy --config config/deployment/fly.toml "$@" 