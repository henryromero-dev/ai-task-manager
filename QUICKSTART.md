# Quick Start Guide

## 🚀 Local Development (5 minutes)

```bash
# 1. Clone and setup
git clone https://github.com/henryromero-dev/ai-task-manager.git
cd ai-task-manager
cp .env.example .env

# 2. Edit .env with your settings
# (Set database passwords and OpenProject credentials)

# 3. Start everything
docker-compose up -d

# 4. Check logs
docker-compose logs -f api

# 5. Test API
curl http://localhost:3000/health
```

✅ Done! API running on http://localhost:3000

---

## 🌐 Production VPS Deployment

### First Time Setup

```bash
# 1. Install Docker on your VPS
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Create project directory
mkdir -p ~/ai-task-manager
cd ~/ai-task-manager

# 3. Download production config
wget https://raw.githubusercontent.com/henryromero-dev/ai-task-manager/main/docker-compose.production.yml -O docker-compose.yml

# 4. Create .env file
nano .env
# Paste and configure your settings (see .env.example)

# 5. Login to GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 6. Deploy
docker-compose pull
docker-compose up -d

# 7. Check status
docker-compose ps
docker-compose logs -f
```

✅ Done! API running on your VPS

### Updates

```bash
cd ~/ai-task-manager
docker-compose pull
docker-compose up -d
```

---

## 🏷️ Create New Release

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This automatically:
- ✅ Builds Docker image
- ✅ Pushes to GitHub Container Registry  
- ✅ Creates GitHub Release

---

## 🔧 Common Commands

```bash
# View logs
docker-compose logs -f
docker-compose logs -f api

# Restart service
docker-compose restart api

# Stop all
docker-compose down

# Database backup
docker-compose exec db mysqldump -u root -p task_manager > backup.sql

# Access database
docker-compose exec db mysql -u root -p

# Enter container shell
docker-compose exec api sh
```

---

## 🔥 Troubleshooting

**API won't start?**
```bash
docker-compose logs api
```

**Database connection error?**
```bash
docker-compose logs db
docker-compose restart api
```

**Port already in use?**
```bash
# Change API_PORT in .env
API_PORT=3001
docker-compose up -d
```

**Need to reset everything?**
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📚 Full Documentation

- **Complete Docker Guide**: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **API Documentation**: [api/README.md](api/README.md)
- **MCP Documentation**: [mcp/README.md](mcp/README.md)
- **Technical Docs**: [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md)
