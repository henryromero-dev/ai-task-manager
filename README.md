```markdown
# Task Management System with MCP Integration

Complete task management system with MCP (Model Context Protocol) integration for Cursor/Copilot.

## 🚀 Features

- **API Backend**: RESTful API with Node.js, Express and MySQL
- **MCP Server**: Integration with Cursor/Copilot to manage tasks via AI
- **OpenProject Sync**: Automatic synchronization with OpenProject
- **Smart Search**: Search by internal ID or `external_id`
- **Automatic Documentation**: Export tasks to Markdown
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **CI/CD**: Automated Docker image builds with GitHub Actions

## 📁 Project Structure

```
ai-task-manager/
├── api/                    # Backend API
│   ├── controllers/        # API controllers
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Services (sync, notifications)
│   ├── app.js             # Main application
│   ├── package.json       # API dependencies
│   └── README.md          # API documentation (Spanish)
├── mcp/                   # MCP server
│   ├── src/               # TypeScript source
│   │   ├── server.ts      # Main MCP server
│   │   └── api-client.ts  # Client to connect to API
│   ├── dist/              # Compiled code
│   ├── package.json       # MCP dependencies
│   └── README.md          # MCP documentation (Spanish)
├── .github/workflows/     # GitHub Actions CI/CD
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Development setup
├── docker-compose.production.yml  # Production setup
└── DOCKER_DEPLOYMENT.md   # Complete Docker guide
```

## ⚡ Quick Install

### Option 1: Docker (Recommended)

The easiest way to get started:

```bash
# Clone the repository
git clone https://github.com/henryromero-dev/ai-task-manager.git
cd ai-task-manager

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f api
```

API will be available at `http://localhost:3000`.

📖 **For detailed Docker deployment instructions, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)**

### Option 2: Manual Installation

#### 1. Prerequisites

- Node.js (v18 or higher)
- MySQL Server (v5.7 or higher)
- Cursor IDE (for MCP integration)

#### 2. Clone and configure

```bash
git clone https://github.com/henryromero-dev/ai-task-manager.git
cd ai-task-manager
```

#### 3. Database setup

```sql
CREATE DATABASE task_manager;
CREATE USER 'taskmanager'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON task_manager.* TO 'taskmanager'@'localhost';
FLUSH PRIVILEGES;
```

Create `.env` in `api/` with DB and optional OpenProject settings.

#### 4. Run the API

```bash
cd api
npm install
node app.js
```

API will be available at `http://localhost:3000`.

#### 5. Build and configure MCP

```bash
cd ../mcp
npm install
npm run build
```

#### 6. Configure Cursor

Add MCP server settings to `.cursorrules` or Cursor settings as described in the Spanish README files.

## 🐳 Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production on VPS

```bash
# Download production compose file
wget https://raw.githubusercontent.com/henryromero-dev/ai-task-manager/main/docker-compose.production.yml -O docker-compose.yml

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Pull and start
docker-compose pull
docker-compose up -d
```

### Create Docker Image via GitHub Actions

Simply create and push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will automatically:
- Build multi-platform Docker images (amd64 and arm64)
- Push to GitHub Container Registry
- Create a GitHub Release

📖 **See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for complete deployment guide**

## 🔧 API Endpoints

```
GET    /health
GET    /tasks
GET    /tasks/:id
GET    /tasks/external/:externalId
POST   /tasks
PUT    /tasks/:id
POST   /tasks/sync
```

## 🛠️ MCP Tools

- `listTasks`, `getTask`, `getTaskByExternalId`, `findRelatedTasks`, `exportTaskDoc`, `syncTasks`, `askAboutTasks`

## Development

Run API with nodemon and MCP with watch for active development.
