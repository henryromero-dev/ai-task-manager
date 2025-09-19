const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

// GET /tasks - Get all tasks
router.get('/', taskController.getAllTasks);

// POST /tasks - Create a new task
router.post('/', taskController.createTask);

// PUT /tasks/:id - Update a task
router.put('/:id', taskController.updateTask);

// POST /sync - Sync with OpenProject
router.post('/sync', taskController.syncWithOpenProject);

// GET /sync/status - Get last sync status
router.get('/sync/status', taskController.getSyncStatus);

// GET /tasks/:id - Get task by ID
router.get('/:id', taskController.getTaskById);

router.get('/external/:externalId', taskController.getTaskByExternalId);

// GET /tasks/:id/related - Get related tasks
router.get('/:id/related', taskController.getRelatedTasks);

// POST /tasks/:id/export - Export task implementation
router.post('/:id/export', taskController.exportTaskImplementation);

// GET /tasks/stats - Get task statistics
router.get('/stats', taskController.getTaskStats);

// GET /tasks/assignee/:assignee - Get tasks by assignee
router.get('/assignee/:assignee', taskController.getTasksByAssignee);

// GET /tasks/project/:projectId - Get tasks by project
router.get('/project/:projectId', taskController.getTasksByProject);

// GET /tasks/status/:status - Get tasks by status
router.get('/status/:status', taskController.getTasksByStatus);

module.exports = router;