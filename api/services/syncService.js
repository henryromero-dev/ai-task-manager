const openProjectService = require('./openproject');
const Task = require('../models/Task');
const notificationService = require('./notificationService');

class SyncService {
    constructor() {
        this.lastRun = null;
        this.lastStatus = 'never';
        this.lastError = null;
        this.isRunning = false;
    }

    async syncAll() {
        if (this.isRunning) {
            return { success: false, message: 'Sync already running' };
        }

        this.isRunning = true;
        this.lastRun = new Date();
        this.lastStatus = 'running';
        this.lastError = null;

        try {
            const connectionTest = await openProjectService.testConnection();
            if (!connectionTest.success) {
                this.lastStatus = 'failed';
                this.lastError = connectionTest.error;
                this.isRunning = false;
                return { success: false, error: connectionTest.error };
            }

            const openProjectTasks = await openProjectService.getTasks();
            let syncResults = { created: 0, updated: 0, errors: [], notifications: 0 };

            for (const taskData of openProjectTasks) {
                try {
                    const existingTask = await Task.findByExternalId(taskData.external_id);
                    
                    const result = await Task.upsertByExternalId(taskData);
                    
                    if (existingTask) {
                        const changes = notificationService.detectTaskChanges(existingTask, taskData);
                        if (changes.length > 0) {
                            try {
                                await notificationService.notifyTaskChange(taskData, changes);
                                syncResults.notifications++;
                            } catch (notifyErr) {
                                console.error('Failed to send task change notification:', notifyErr.message);
                            }
                        }
                        syncResults.updated++;
                    } else {
                        try {
                            await notificationService.notifyNewTask(taskData);
                            syncResults.notifications++;
                        } catch (notifyErr) {
                            console.error('Failed to send new task notification:', notifyErr.message);
                        }
                        syncResults.created++;
                    }
                } catch (err) {
                    syncResults.errors.push({ external_id: taskData.external_id, error: err.message });
                }
            }

            this.lastStatus = 'ok';
            this.isRunning = false;
            return { success: true, results: syncResults };
        } catch (error) {
            this.lastStatus = 'failed';
            this.lastError = error.message;
            this.isRunning = false;
            return { success: false, error: error.message };
        }
    }

    getStatus() {
        return {
            lastRun: this.lastRun,
            lastStatus: this.lastStatus,
            lastError: this.lastError,
            isRunning: this.isRunning
        };
    }
}

module.exports = new SyncService();
