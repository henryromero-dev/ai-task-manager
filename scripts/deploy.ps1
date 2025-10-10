# PowerShell Deploy Script for Windows
# Usage: .\deploy.ps1 [-Version "v1.0.0"]
# Example: .\deploy.ps1 -Version "latest"

param(
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying AI Task Manager version: $Version" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "📝 Please create .env file from .env.example" -ForegroundColor Yellow
    exit 1
}

# Check if docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker is not installed!" -ForegroundColor Red
    Write-Host "📦 Please install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if docker-compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker Compose is not available!" -ForegroundColor Red
    exit 1
}

# Pull latest images
Write-Host "📥 Pulling Docker images..." -ForegroundColor Cyan
docker-compose pull

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Start new containers
Write-Host "▶️  Starting containers..." -ForegroundColor Green
docker-compose up -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check if services are running
$runningContainers = docker-compose ps --filter "status=running" --quiet
if ($runningContainers) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "📊 Service status:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "📝 View logs with: docker-compose logs -f" -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "📋 Check logs with: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
