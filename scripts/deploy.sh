#!/bin/bash

# Deploy script for Fly.io that uses the config file in the config/deployment directory
echo "Deploying to Fly.io using config at config/deployment/fly.toml"
fly deploy --config config/deployment/fly.toml "$@" 