```markdown
# Technical Documentation for AI Assistants

This documentation is aimed at AI assistants that need to modify or extend the system.

## 🏗️ System Architecture

### Main Components

1. **API Backend** (`/api`)
   - Framework: Express.js + Node.js
   - Database: MySQL
   - Pattern: MVC (Models, Views, Controllers)

2. **MCP Server** (`/mcp`)
   - Framework: TypeScript + MCP SDK
   - Purpose: Proxy between Cursor/Copilot and the API
   - Protocol: Model Context Protocol

3. **OpenProject Integration**
   - Automatic synchronization service
   - REST API integration

## 📊 Database Schema

### `tasks` table

```sql
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    project VARCHAR(255),
    project_id VARCHAR(255),
    status VARCHAR(100),
    assignee VARCHAR(255),
    responsible VARCHAR(255),
    priority VARCHAR(50),
    estimated_hours DECIMAL(10,2),
    spent_hours DECIMAL(10,2),
    related_to TEXT,
    op_created_at DATETIME,
    op_updated_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_external_id (external_id),
    INDEX idx_status (status),
    INDEX idx_assignee (assignee),
    INDEX idx_project_id (project_id)
);
```

## 🚀 API Endpoints

See the detailed list of endpoints and controllers in the Spanish docs. Key endpoints include `/tasks`, `/tasks/:id`, `/tasks/external/:externalId`, `/tasks/sync`, and `/health`.

## 🔧 Models and Services

### Task Model (`/api/models/Task.js`)

Key methods:
- `findAll()`
- `findById(id)`
- `findByExternalId(externalId)`
- `findByIdPrioritized(id)` - NEW: prioritizes external_id
- `create(taskData)`
- `update(id, taskData)`
- `delete(id)`
- `upsertByExternalId(taskData)`

### Services

1. **syncService** (`/api/services/syncService.js`) - Synchronize with OpenProject
2. **openproject** (`/api/services/openproject.js`) - OpenProject API client and mapping
3. **notificationService** (`/api/services/notificationService.js`) - Notifications (Telegram, etc.)

## 🤖 MCP Server Architecture

Tools provided by the MCP server include `listTasks`, `getTask`, `getTaskByExternalId`, `findRelatedTasks`, `exportTaskDoc`, `syncTasks`, and `askAboutTasks`.

## 🔍 Prioritized Search (Recent Implementation)

The system now searches `external_id` first and falls back to internal ID. Controllers and MCP tools were updated to use `findByIdPrioritized`.

## 🛠️ Change Patterns

Examples for adding a new endpoint or MCP tool are provided in the Spanish docs and can be followed exactly.

## 🔄 Sync Flow

1. Scheduler runs every X minutes (`SYNC_INTERVAL_MINUTES`)
2. `syncService.syncAll()` starts synchronization
3. `openProjectService` fetches tasks
4. `Task.upsertByExternalId()` creates/updates tasks
5. `notificationService` sends summary if configured

## 📝 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=tasks_user
DB_PASSWORD=password
DB_NAME=tasks

# API
PORT=3000
NODE_ENV=development

# OpenProject
OPENPROJECT_URL=https://openproject.domain.com
OPENPROJECT_API_KEY=api_key_here
SYNC_INTERVAL_MINUTES=30

# Notifications
TELEGRAM_BOT_TOKEN=bot_token
TELEGRAM_CHAT_ID=chat_id
```

## 🐛 Debugging Tips

Check logs for MCP server and API controllers. Verify connections via the `/health` endpoint and DB startup logs.
