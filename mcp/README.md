```markdown
# Task MCP Server

A Model Context Protocol (MCP) server that provides task management capabilities to Cursor/Copilot by connecting to your task backend API.

## 🚀 Features

- **askAboutTasks**: Ask questions about tasks in natural language and get human-friendly responses
- **listTasks**: Fetch all tasks from the task management system
- **getTask**: Get detailed information about a specific task by ID (prioritizes external_id)
- **getTaskByExternalId**: **NEW** - Get task specifically by external_id (auto-used for "Task XXXX" searches)
- **findRelatedTasks**: Find tasks related to a given task based on keywords
- **exportTaskDoc**: Export a task as a Markdown implementation document
- **syncTasks**: Synchronize tasks from OpenProject to local database

## 🆕 Recent Updates

### Enhanced Task Search
- **New Tool**: `getTaskByExternalId` - Direct search by external_id
- **Smart Recognition**: Automatically detects "Task XXXX" patterns and uses external_id search
- **Improved Description**: Tools now clearly indicate when to use external_id vs internal ID

## Prerequisites

- Node.js (v18 or higher)
- TypeScript
- Your task backend API running (typically on `http://localhost:3000`)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if your API backend runs on a different URL.

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## MCP Configuration

### For Cursor (Full MCP Support)

Add this configuration to your Cursor settings:

1. Open Cursor Settings (Ctrl/Cmd + ,)
2. Search for "MCP"
3. Add the following configuration:

```json
{
  "mcpServers": {
    "task-mcp-server": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "C:\\dev\\mcp\\mcp",
      "env": {
        "API_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Available Tools

- `askAboutTasks` — Ask questions about tasks in natural language.
- `listTasks` — Retrieves all tasks.
- `getTask` — Retrieves a specific task by internal ID.
- `getTaskByExternalId` — Retrieves a task by external_id (OpenProject ID).
- `findRelatedTasks` — Find related tasks for a given task ID.
- `exportTaskDoc` — Export a task as Markdown.
- `syncTasks` — Synchronize tasks from OpenProject.

## Response Format

All tools return a structured JSON response with `success`, `message`, and `data` fields.

## Project Structure

```
├── src/
│   ├── server.ts          # Main MCP server implementation
│   └── api-client.ts      # Task API client
├── dist/                  # Compiled JavaScript output
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── mcp-config.json        # MCP client configuration
├── .env                   # Environment variables
└── README.md              # Original Spanish README
```

## Quick Start

1. Start the task API:
   ```bash
   cd api
   node app.js
   ```

2. Build the MCP:
   ```bash
   cd mcp
   npm run build
   ```

3. Configure your MCP client (see CONFIGURACION_CLIENTE.md)

4. Ask natural questions:
   - "What tasks do I have?"
   - "Which project am I working on?"
   - "What should I do today?"

## License

MIT

```
