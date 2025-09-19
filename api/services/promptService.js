const Task = require('../models/Task');

class PromptService {
    // Build a concise prompt with recent sync status and top 5 tasks
    async buildPrompt() {
        // Get top tasks by recently updated
        const tasks = await Task.findAll();
        const top = tasks.slice(0, 5).map(t => ({ id: t.id, title: t.title, status: t.status, assignee: t.assignee }));

        const promptParts = [];
        promptParts.push('Context: This app syncs tasks from OpenProject and stores them in a local DB.');
        promptParts.push('Top tasks:');
        top.forEach(t => {
            promptParts.push(`- [${t.id}] ${t.title} (status: ${t.status || 'N/A'}, assignee: ${t.assignee || 'Unassigned'})`);
        });

        promptParts.push('Instructions: Provide a short summary and recommended next actions (3 bullet points).');

        // Keep prompt compact
        return promptParts.join('\n');
    }
}

module.exports = new PromptService();
