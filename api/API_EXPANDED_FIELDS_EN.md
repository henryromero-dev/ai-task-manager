```markdown
# Task API - Expanded Fields and New Endpoints

## 🆕 New Search Endpoints

### Prioritized ID Search
- **GET `/tasks/:id`** - Searches `external_id` first, then internal ID
- **GET `/tasks/external/:externalId`** - Searches specifically by `external_id`

**Usage example:**
```bash
# Search Task with external_id "1234" (prioritized)
GET /tasks/1234

# Search specifically by external_id
GET /tasks/external/OP-1234
```

## 📝 Create Task (POST /api/tasks)

### Basic Fields (required)
```json
{
  "title": "Implement new feature"
}
```

### Full Fields (all optional except title)
```json
{
  "title": "Implement new feature",
  "description": "Detailed description of the task",
  "project": "Freeman Project",
  "project_id": "123",
  "status": "In Progress",
  "assignee": "Henry Romero",
  "responsible": "John Doe",
  "priority": "High",
  "estimated_hours": 8.5,
  "spent_hours": 2.0,
  "related_to": [
    {
      "type": "parent",
      "id": "456",
      "title": "Parent task"
    },
    {
      "type": "blocks",
      "id": "789",
      "title": "Task that it blocks"
    }
  ],
  "op_created_at": "2025-09-19 10:00:00",
  "op_updated_at": "2025-09-19 14:30:00"
}
```

## ✏️ Update Task (PUT /api/tasks/:id)

### Partial Update
Only send the fields you want to change:

```json
{
  "status": "Completed",
  "spent_hours": 8.5,
  "assignee": "New Assignee"
}
```

### Update with Relationships
```json
{
  "status": "In Progress",
  "related_to": [
    {
      "type": "child",
      "id": "999",
      "title": "New related task"
    }
  ]
}
```

## 📊 Validation and Data Types

### Text Fields
- **title** (string, required)
- **description** (string)
- **project** (string)
- **project_id** (string)
- **status** (string)
- **assignee** (string)
- **responsible** (string)
- **priority** (string: Low, Normal, High, Immediate)

### Numeric Fields
- **estimated_hours** (decimal)
- **spent_hours** (decimal)

### Date Fields
- **op_created_at** (datetime) - "YYYY-MM-DD HH:MM:SS"
- **op_updated_at** (datetime)

### Relations Field
- **related_to** (array/string): Can be an array of relation objects, a JSON string, or null

## 🎯 cURL Examples

### Create Basic Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Basic new task",
    "description": "Only with basic fields"
  }'
```

### Create Full Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full task",
    "description": "With all fields",
    "project": "Test Project",
    "project_id": "100",
    "assignee": "Henry Romero",
    "priority": "High",
    "estimated_hours": 5.0,
    "related_to": "[{\"type\":\"parent\",\"id\":\"123\",\"title\":\"Parent task\"}]"
  }'
```

### Update Status and Hours
```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed",
    "spent_hours": 4.5
  }'
```

## 📋 Suggested Values

### Priority
- `Low`
- `Normal` (default)
- `High`
- `Immediate`

### Status (common examples)
- `New`
- `In Progress`
- `Testing`
- `Completed`
- `Blocked`
- `Cancelled`

### Relation Types (related_to)
- `parent`
- `child`
- `blocks`
- `blocked_by`
- `related`
- `duplicates`
- `duplicated_by`

## ✅ API Responses

### Successful Creation (201)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "New task",
    "description": "Description",
    "project": "Freeman Project",
    "assignee": "Henry Romero",
    "status": "New",
    "priority": "High",
    "estimated_hours": 8.5,
    "spent_hours": 0,
    "created_at": "2025-09-19T15:30:00.000Z",
    "updated_at": "2025-09-19T15:30:00.000Z"
  }
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Title is required"
}
```

## 🔄 Migrating Existing Data

If you have tasks created before the expansion:
- New fields will be `null` by default
- You can update them with PUT to add missing information
- OpenProject sync will populate expanded fields when available

## 💡 Tips

1. **Only `title` is required**
2. **UPDATE preserves existing values** if a field is not provided
3. **Relations can be sent as an array or JSON string**
4. **Use "YYYY-MM-DD HH:MM:SS"** for `op_created_at` and `op_updated_at`
5. **Decimal hours**: 8.5 = 8 hours 30 minutes
