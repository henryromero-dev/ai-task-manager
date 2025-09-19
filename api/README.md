```markdown
# Task Backend API

A centralized task management backend built with Node.js, Express, and MySQL that integrates with OpenProject.

## 🚀 Features

- RESTful API for task management
- MySQL database for data storage
- OpenProject integration for task synchronization
- **Prioritized ID search**: Searches by `external_id` first, then internal ID
- Related task discovery based on keywords
- Task implementation export to Markdown
- Health check endpoint

## 🆕 Recent Updates

### Prioritized Search Implementation
- **New endpoint**: `GET /tasks/external/:externalId` - Search specifically by external_id
- **Enhanced search**: All search operations now prioritize `external_id` over internal ID
- **MCP Integration**: When searching for "Task XXXX", the system automatically uses external_id search

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up MySQL database:
   ```sql
   CREATE DATABASE tasks;
   CREATE USER 'tasks_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON tasks.* TO 'tasks_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   - MySQL connection details
   - OpenProject configuration

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- `GET /health` - Returns server status

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task manually
- `GET /tasks/:id` - Get a specific task by ID
- `GET /tasks/:id/related` - Get tasks related to a specific task
- `POST /tasks/:id/export` - Export task implementation as Markdown

### Synchronization
- `POST /tasks/sync` - Sync tasks from OpenProject

## Database Schema

The MySQL database contains a `tasks` table with the following fields:

- `id` - Primary key (AUTO_INCREMENT)
- `external_id` - OpenProject work package ID (VARCHAR(255), optional)
- `title` - Task title (VARCHAR(500), NOT NULL)
- `description` - Task description (TEXT)
- `project` - Project name (VARCHAR(255))
- `status` - Task status (VARCHAR(100), DEFAULT 'pending')
- `created_at` - Creation timestamp (TIMESTAMP)
- `updated_at` - Last update timestamp (TIMESTAMP, auto-updated)

### Indexes
- Index on `external_id` for OpenProject sync performance
- Index on `status` for filtering
- Index on `project` for project-based queries

## Project Structure

```
├── app.js                 # Main application file
├── db.js                  # Database initialization and management
├── package.json           # Project dependencies and scripts
├── .env                   # Environment configuration
├── controllers/
│   └── taskController.js  # Task business logic
├── models/
│   └── Task.js            # Task data model
├── routes/
│   ├── index.js           # Health check routes
│   └── tasks.js           # Task routes
├── services/
│   └── openproject.js     # OpenProject API integration
└── utils/                 # Utility functions
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `DB_HOST` | MySQL host | Yes | localhost |
| `DB_PORT` | MySQL port | No | 3306 |
| `DB_USER` | MySQL username | Yes | root |
| `DB_PASSWORD` | MySQL password | Yes | - |
| `DB_NAME` | MySQL database name | Yes | tasks |
| `OP_BASE_URL` | OpenProject instance URL | Yes (for sync) | - |
| `OP_API_KEY` | OpenProject API key | Yes (for sync) | - |

## MySQL Setup

1. Install MySQL Server on your system
2. Create a database and user:
   ```sql
   CREATE DATABASE tasks;
   CREATE USER 'tasks_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON tasks.* TO 'tasks_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Update your `.env` file with the database credentials

## OpenProject Integration

To use the OpenProject integration:

1. Obtain an API key from your OpenProject instance:
   - Go to "My Account" > "Access Tokens"
   - Create a new API key

2. Configure the `.env` file with your OpenProject URL and API key

3. Use the `/tasks/sync` endpoint to synchronize tasks

## Examples

### Create a task manually
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add login and registration functionality",
    "project": "Web Application",
    "status": "pending"
  }'
```

### Get all tasks
```bash
curl http://localhost:3000/tasks
```

### Sync with OpenProject
```bash
curl -X POST http://localhost:3000/tasks/sync
```

### Export task implementation
```bash
curl -X POST http://localhost:3000/tasks/1/export
```

## License

MIT

```
