const axios = require('axios');

class NotificationService {
    constructor() {
        this.telegramToken = process.env.TELEGRAM_BOT_TOKEN || null;
        this.telegramChatId = process.env.TELEGRAM_CHAT_ID || null;
        this.notifyNewTasks = process.env.NOTIFY_NEW_TASKS !== 'false'; // default true
        this.notifyTaskChanges = process.env.NOTIFY_TASK_CHANGES !== 'false'; // default true
    }

    async sendTelegram(message) {
        if (!this.telegramToken || !this.telegramChatId) {
            console.warn('Telegram not configured; skipping sendTelegram');
            return { success: false, error: 'Telegram not configured' };
        }

        try {
            const url = `https://api.telegram.org/bot${this.telegramToken}/sendMessage`;
            const res = await axios.post(url, {
                chat_id: this.telegramChatId,
                text: message,
                parse_mode: 'Markdown'
            });

            return { success: true, data: res.data };
        } catch (error) {
            console.error('Failed to send Telegram message:', error.message || error);
            return { success: false, error: error.message || String(error) };
        }
    }

    // Detect and format task changes for notification
    detectTaskChanges(oldTask, newTask) {
        const changes = [];
        
        if (oldTask.status !== newTask.status) {
            changes.push(`Status: ${oldTask.status || 'N/A'} → ${newTask.status || 'N/A'}`);
        }
        
        if (oldTask.assignee !== newTask.assignee) {
            changes.push(`Assignee: ${oldTask.assignee || 'Unassigned'} → ${newTask.assignee || 'Unassigned'}`);
        }
        
        if (oldTask.responsible !== newTask.responsible) {
            changes.push(`Responsible: ${oldTask.responsible || 'N/A'} → ${newTask.responsible || 'N/A'}`);
        }
        
        if (oldTask.priority !== newTask.priority) {
            changes.push(`Priority: ${oldTask.priority || 'Normal'} → ${newTask.priority || 'Normal'}`);
        }
        
        return changes;
    }

    // Send notification for task changes
    async notifyTaskChange(task, changes) {
        if (!this.notifyTaskChanges || !changes || changes.length === 0) {
            return { success: false, error: 'Task change notifications disabled or no changes' };
        }

        const taskTitle = task.title ? (task.title.length > 50 ? task.title.substring(0, 50) + '...' : task.title) : 'Unknown Task';
        const message = `📝 *Task Updated*\n\n*${taskTitle}*\n\n${changes.map(c => `• ${c}`).join('\n')}\n\n_ID: ${task.id || task.external_id}_`;
        
        return await this.sendTelegram(message);
    }

    // Send notification for new tasks
    async notifyNewTask(task) {
        if (!this.notifyNewTasks) {
            return { success: false, error: 'New task notifications disabled' };
        }

        const taskTitle = task.title ? (task.title.length > 50 ? task.title.substring(0, 50) + '...' : task.title) : 'Unknown Task';
        const message = `✅ *New Task Added*\n\n*${taskTitle}*\n\nStatus: ${task.status || 'N/A'}\nAssignee: ${task.assignee || 'Unassigned'}\n\n_ID: ${task.id || task.external_id}_`;
        
        return await this.sendTelegram(message);
    }
}

module.exports = new NotificationService();
