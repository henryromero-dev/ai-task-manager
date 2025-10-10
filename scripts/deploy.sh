#!/bin/bash
# Deploy script for VPS
# Usage: ./deploy.sh [version]
# Example: ./deploy.sh v1.0.0

set -e

VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Deploying AI Task Manager version: $VERSION"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create .env file from .env.example"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed!"
    echo "📦 Please install Docker first: https://get.docker.com"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed!"
    exit 1
fi

# Update image version in .env if specific version is requested
if [ "$VERSION" != "latest" ]; then
    echo "📝 Updating image version to $VERSION..."
    sed -i "s|ghcr.io/henryromero-dev/ai-task-manager:.*|ghcr.io/henryromero-dev/ai-task-manager:$VERSION|g" $COMPOSE_FILE
fi

# Pull latest images
echo "📥 Pulling Docker images..."
docker-compose pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start new containers
echo "▶️  Starting containers..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "📊 Service status:"
    docker-compose ps
    echo ""
    echo "📝 View logs with: docker-compose logs -f"
else
    echo "❌ Deployment failed!"
    echo "📋 Check logs with: docker-compose logs"
    exit 1
fi
