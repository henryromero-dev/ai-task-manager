```markdown
# Task Management System with MCP Integration

Complete task management system with MCP (Model Context Protocol) integration for Cursor/Copilot.

## 🚀 Features

- **API Backend**: RESTful API with Node.js, Express and MySQL
- **MCP Server**: Integration with Cursor/Copilot to manage tasks via AI
- **OpenProject Sync**: Automatic synchronization with OpenProject
- **Smart Search**: Search by internal ID or `external_id`
- **Automatic Documentation**: Export tasks to Markdown

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
└── mcp/                   # MCP server
    ├── src/               # TypeScript source
    │   ├── server.ts      # Main MCP server
    │   └── api-client.ts  # Client to connect to API
    ├── dist/              # Compiled code
    ├── package.json       # MCP dependencies
    └── README.md          # MCP documentation (Spanish)
```

## ⚡ Quick Install

### 1. Prerequisites

- Node.js (v18 or higher)
- MySQL Server (v5.7 or higher)
- Cursor IDE (for MCP integration)

### 2. Clone and configure

```bash
cd c:\dev\mcp
```

### 3. Database setup

```sql
CREATE DATABASE tasks;
CREATE USER 'tasks_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON tasks.* TO 'tasks_user'@'localhost';
FLUSH PRIVILEGES;
```

Create `.env` in `api/` with DB and optional OpenProject settings.

### 4. Run the API

```bash
cd api
npm install
node app.js
```

API will be available at `http://localhost:3000`.

### 5. Build and configure MCP

```bash
cd ../mcp
npm install
npm run build
```

### 6. Configure Cursor

Add MCP server settings to `.cursorrules` or Cursor settings as described in the Spanish README files.

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
