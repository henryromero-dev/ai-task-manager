```markdown
# Configure MCP in Cursor - Step-by-step Guide

## 🆕 New Feature
This MCP now includes smart search by `external_id`. When you search for "Task 1234" it will automatically use the OpenProject external_id.

## Step 1: Verify the API is running

First, make sure the task API is running:

```bash
cd api
node app.js
```

You should see something like:

```
Server is running on port 3000
Database initialized successfully
Health check: http://localhost:3000/health
API endpoints:
  GET    /health
  GET    /tasks
  POST   /tasks
  PUT    /tasks/:id
  POST   /tasks/sync
  GET    /tasks/sync/status
  GET    /tasks/:id
  GET    /tasks/external/:externalId  <-- NEW
  GET    /tasks/:id/related
  POST   /tasks/:id/export
```

## Step 2: Configure Cursor

### Option A: Workspace configuration (Recommended)

Create a `.cursorrules` file at the project root (`C:\dev\mcp\.cursorrules`):

1. **Open Cursor**
2. **Go to Settings** (Ctrl+, or Cmd+,)
3. **Search for "MCP"** in the search bar
4. **Add the configuration** to the MCP Servers field:

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

### Option B: Configuration file

1. **Create or edit** the file `~/.cursor/mcp_config.json` (Windows: `%USERPROFILE%\.cursor\mcp_config.json`)
2. **Copy the content** of the `cursor-mcp-config.json` file in this directory
3. **Restart Cursor**

## Step 3: Verify the configuration

1. **Restart Cursor** completely
2. **Open a new conversation**
3. **Verify that MCP tools are visible** in the UI

## Step 4: Test the MCP

Once configured, you should be able to use commands like:

- "What tasks do I have?"
- "Which project am I working on?"
- "What should I do today?"

## Troubleshooting

### If MCP tools don't appear:

1. **Check the path**: Make sure `C:\dev\mcp\mcp` is the correct path
2. **Check the API**: The API must be running on port 3000
3. **Check logs**: In Cursor, look for errors in the developer console

### If there are connection errors:

1. **Verify the API is running**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify the MCP is built**:
   ```bash
   cd mcp
   npm run build
   ```

3. **Run the MCP manually**:
   ```bash
   cd mcp
   node dist/server.js
   ```

## Verification commands

### Verify API:
```bash
curl http://localhost:3000/tasks
```

### Verify MCP:
```bash
cd mcp
node dist/server.js
```

## Important notes

- **The API must be running** before using the MCP
- **Cursor must be restarted** after changing configuration
- **Paths should be absolute** in configuration
- **The MCP must be built** (`npm run build`)

## File structure

```
C:\dev\mcp\
├── api\                    # Task API (must be running)
│   └── app.js
├── mcp\                    # MCP server
│   ├── dist\              # Compiled files
│   │   └── server.js
│   ├── src\
│   │   └── server.ts
│   └── cursor-mcp-config.json  # Cursor configuration
```

Once set up correctly, you'll be able to ask natural questions about your tasks and get contextual answers.

```
