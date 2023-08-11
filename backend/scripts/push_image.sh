#!/bin/bash

# To push Docker image file to ECR
# Maybe for some PC: chmod +x ./backend/scripts/push_image.sh
# Use: ./backend/scripts/push_image.sh <aws-profile-name> <aws-region> <aws-account-number> 

# Safety check
if ["$#" -ne 3]; then
    echo "Usage: $0 <aws-profile-name> <aws-region> <aws-account-number>"
    exit 1
fi
profile_name="$1"
region="$2"
account_number="$3"

# Login into registry
aws ecr get-login-password --profile "$profile_name" --region "$region" | docker login --username AWS --password-stdin "$account_number".dkr.ecr."$region".amazonaws.com

# Creat a Docker image
docker build -t docker-repo .

# Creat tag for Docker image
docker tag docker-repo:latest "$account_number".dkr.ecr."$region".amazonaws.com/docker-repo:latest

# Push Docker image to "docker-repo" repository
docker push "$account_number".dkr.ecr."$region".amazonaws.com/docker-repo:latest