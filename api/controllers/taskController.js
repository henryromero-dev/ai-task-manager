const Task = require('../models/Task');
const openProjectService = require('../services/openproject');
const syncService = require('../services/syncService');
const fs = require('fs').promises;
const path = require('path');
const notificationService = require('../services/notificationService');

class TaskController {
    async getAllTasks(req, res) {
        try {
            const tasks = await Task.findAll();
            res.json({
                success: true,
                data: tasks,
                count: tasks.length
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tasks'
            });
        }
    }

    async getTaskById(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findById(id);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }

            res.json({
                success: true,
                data: task
            });
        } catch (error) {
            console.error('Error fetching task:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch task'
            });
        }
    }

    async getTaskByExternalId(req, res) {
        try {
            const { externalId } = req.params;
            const task = await Task.findByExternalId(externalId);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }

            res.json({
                success: true,
                data: task
            });
        } catch (error) {
            console.error('Error fetching task:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch task'
            });
        }
    }

    async createTask(req, res) {
        try {
            const { 
                title, 
                description, 
                project, 
                project_id,
                status, 
                assignee,
                responsible,
                priority,
                estimated_hours,
                spent_hours,
                related_to,
                op_created_at,
                op_updated_at
            } = req.body;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    error: 'Title is required'
                });
            }

            const taskData = {
                external_id: null, // Set to null for manually created tasks
                title,
                description: description || '',
                project: project || '',
                project_id: project_id || null,
                status: status || 'pending',
                assignee: assignee || null,
                responsible: responsible || null,
                priority: priority || 'Normal',
                estimated_hours: estimated_hours ? parseFloat(estimated_hours) : null,
                spent_hours: spent_hours ? parseFloat(spent_hours) : null,
                related_to: related_to ? (typeof related_to === 'string' ? related_to : JSON.stringify(related_to)) : null,
                op_created_at: op_created_at || null,
                op_updated_at: op_updated_at || null
            };

            const task = await Task.create(taskData);

            res.status(201).json({
                success: true,
                data: task
            });
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create task'
            });
        }
    }

    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const { 
                title, 
                description, 
                project, 
                project_id,
                status, 
                assignee,
                responsible,
                priority,
                estimated_hours,
                spent_hours,
                related_to,
                op_created_at,
                op_updated_at
            } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Task ID is required'
                });
            }

            // Get existing task to preserve existing data
            const existingTask = await Task.findById(id);
            if (!existingTask) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }

            const taskData = {
                external_id: existingTask.external_id, // Preserve existing external_id
                title: title !== undefined ? title : existingTask.title,
                description: description !== undefined ? description : existingTask.description,
                project: project !== undefined ? project : existingTask.project,
                project_id: project_id !== undefined ? project_id : existingTask.project_id,
                status: status !== undefined ? status : existingTask.status,
                assignee: assignee !== undefined ? assignee : existingTask.assignee,
                responsible: responsible !== undefined ? responsible : existingTask.responsible,
                priority: priority !== undefined ? priority : existingTask.priority,
                estimated_hours: estimated_hours !== undefined ? (estimated_hours ? parseFloat(estimated_hours) : null) : existingTask.estimated_hours,
                spent_hours: spent_hours !== undefined ? (spent_hours ? parseFloat(spent_hours) : null) : existingTask.spent_hours,
                related_to: related_to !== undefined ? 
                    (related_to ? (typeof related_to === 'string' ? related_to : JSON.stringify(related_to)) : null) : 
                    existingTask.related_to,
                op_created_at: op_created_at !== undefined ? op_created_at : existingTask.op_created_at,
                op_updated_at: op_updated_at !== undefined ? op_updated_at : existingTask.op_updated_at
            };

            const updatedTask = await Task.update(id, taskData);

            res.json({
                success: true,
                data: updatedTask
            });
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update task'
            });
        }
    }

    async syncWithOpenProject(req, res) {
        try {
            // Prefer using centralized sync service if available
            if (syncService && typeof syncService.syncAll === 'function') {
                const result = await syncService.syncAll();
                if (result.success) {
                    return res.json({ success: true, message: 'Sync completed', results: result.results });
                } else {
                    return res.status(500).json({ success: false, error: result.error || 'Sync failed' });
                }
            }

            // Fallback to previous behavior
            const connectionTest = await openProjectService.testConnection();

            if (!connectionTest.success) {
                return res.status(400).json({ success: false, error: `OpenProject connection failed: ${connectionTest.error}` });
            }

            const openProjectTasks = await openProjectService.getTasks();
            let syncResults = { created: 0, updated: 0, errors: [] };

            for (const taskData of openProjectTasks) {
                try {
                    const result = await Task.upsertByExternalId(taskData);
                    if (result.changes > 0) {
                        syncResults.updated++;
                    } else {
                        syncResults.created++;
                    }
                } catch (error) {
                    syncResults.errors.push({ external_id: taskData.external_id, error: error.message });
                }
            }

            res.json({ success: true, message: 'Sync completed', results: syncResults });
        } catch (error) {
            console.error('Error syncing with OpenProject:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to sync with OpenProject'
            });
        }
    }

    async getSyncStatus(req, res) {
        try {
            if (!syncService || typeof syncService.getStatus !== 'function') {
                return res.status(500).json({ success: false, error: 'Sync service not available' });
            }

            const status = syncService.getStatus();
            res.json({ success: true, data: status });
        } catch (error) {
            console.error('Error getting sync status:', error);
            res.status(500).json({ success: false, error: 'Failed to get sync status' });
        }
    }

    async getRelatedTasks(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findById(id);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }

            // Extract keywords from title and description
            const keywords = this.extractKeywords(task.title, task.description);
            const relatedTasks = await Task.findRelated(id, keywords);

            res.json({
                success: true,
                data: relatedTasks,
                keywords: keywords,
                count: relatedTasks.length
            });
        } catch (error) {
            console.error('Error fetching related tasks:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch related tasks'
            });
        }
    }

    async exportTaskImplementation(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findById(id);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }

            const relatedTasks = await Task.findRelated(id, this.extractKeywords(task.title, task.description));
            const implementationContent = this.generateImplementationMarkdown(task, relatedTasks);

            const fileName = `IMPLEMENTACION_${task.id}_${this.sanitizeFileName(task.title)}.md`;
            const filePath = path.join(__dirname, '..', 'exports', fileName);

            // Ensure exports directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            await fs.writeFile(filePath, implementationContent, 'utf8');

            res.json({
                success: true,
                message: 'Implementation file generated successfully',
                filePath: fileName,
                downloadUrl: `/exports/${fileName}`
            });
        } catch (error) {
            console.error('Error exporting task implementation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to export task implementation'
            });
        }
    }

    extractKeywords(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        const words = text.match(/\b\w{3,}\b/g) || [];

        // Remove common words
        const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'may', 'she', 'use', 'way', 'will', 'with'];

        return [...new Set(words.filter(word => !stopWords.includes(word)))].slice(0, 10);
    }

    generateImplementationMarkdown(task, relatedTasks) {
        const createdDate = new Date(task.created_at).toLocaleDateString();
        const updatedDate = new Date(task.updated_at).toLocaleDateString();

        return `# Task Implementation: ${task.title}

## Task Information

- **ID**: ${task.id}
- **External ID**: ${task.external_id || 'N/A'}
- **Project**: ${task.project || 'N/A'}
- **Status**: ${task.status}
- **Created**: ${createdDate}
- **Updated**: ${updatedDate}

## Description

${task.description || 'No description provided'}

## Implementation Plan

### Prerequisites
- [ ] Review task requirements
- [ ] Identify dependencies
- [ ] Setup development environment

### Development Steps
- [ ] Design solution architecture
- [ ] Implement core functionality
- [ ] Write tests
- [ ] Documentation
- [ ] Code review

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] User acceptance testing

### Deployment
- [ ] Deploy to staging
- [ ] Performance testing
- [ ] Deploy to production

## Related Tasks

${relatedTasks.length > 0 ? relatedTasks.map(rt => `- [Task ${rt.id}] ${rt.title} (${rt.status})`).join('\n') : 'No related tasks found'}

## Notes

Add implementation notes, blockers, and progress updates here.

---
Generated on: ${new Date().toLocaleString()}
`;
    }

    sanitizeFileName(fileName) {
        return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
    }

    async getTaskStats(req, res) {
        try {
            const stats = await Task.getStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching task stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch task statistics'
            });
        }
    }

    // Prompt endpoint removed per request

    async getTasksByAssignee(req, res) {
        try {
            const { assignee } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const tasks = await Task.findByAssignee(assignee, limit);
            
            res.json({
                success: true,
                data: tasks,
                count: tasks.length,
                assignee: assignee
            });
        } catch (error) {
            console.error('Error fetching tasks by assignee:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tasks by assignee'
            });
        }
    }

    async getTasksByProject(req, res) {
        try {
            const { projectId } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const tasks = await Task.findByProject(projectId, limit);
            
            res.json({
                success: true,
                data: tasks,
                count: tasks.length,
                projectId: projectId
            });
        } catch (error) {
            console.error('Error fetching tasks by project:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tasks by project'
            });
        }
    }

    async getTasksByStatus(req, res) {
        try {
            const { status } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const tasks = await Task.findByStatus(status, limit);
            
            res.json({
                success: true,
                data: tasks,
                count: tasks.length,
                status: status
            });
        } catch (error) {
            console.error('Error fetching tasks by status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tasks by status'
            });
        }
    }
}

module.exports = new TaskController();