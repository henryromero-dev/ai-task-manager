const axios = require('axios');

class OpenProjectService {
    constructor() {
        this.apiKey = process.env.OP_API_KEY;
        this.baseUrl = process.env.OP_BASE_URL || 'https://your-openproject-instance.com';
        this.apiVersion = 'v3';
        
        if (this.baseUrl.includes('/api/v3')) {
            this.apiBaseUrl = this.baseUrl;
        } else {
            this.apiBaseUrl = `${this.baseUrl}/api/${this.apiVersion}`;
        }
        
        this.syncLimit = parseInt(process.env.OP_SYNC_LIMIT) || 100;
        this.syncProjects = process.env.OP_SYNC_PROJECTS ? 
            process.env.OP_SYNC_PROJECTS.split(',').map(p => p.trim()) : [];

        console.log('OpenProjectService initialized');
        console.log('  - API Base URL:', this.apiBaseUrl);
        console.log('  - Limit:', this.syncLimit);
        console.log('  - Projects:', this.syncProjects.length > 0 ? this.syncProjects.join(', ') : 'All projects');
    }

    getHeaders() {
        const credentials = Buffer.from(`apikey:${this.apiKey}`).toString('base64');
        return {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async getTasks() {
        try {
            if (!this.apiKey) {
                throw new Error('OpenProject API key not configured');
            }

            const url = `${this.apiBaseUrl}/work_packages`;
            
            const params = {
                pageSize: this.syncLimit,
                sortBy: '[["updatedAt", "desc"]]'
            };

            const filters = [];

            const userId = await this.getCurrentUserId();
            if (userId) {
                filters.push({
                    assignee: {
                        operator: '=',
                        values: [userId]
                    }
                });
                
                console.log(`✅ Applied user filter: assignee = ${userId} (current user)`);
            } else {
                console.error(`❌ Could not get current user ID. Cannot proceed without user filter.`);
                throw new Error(`Could not get current user ID. Please check API key permissions.`);
            }

            if (this.syncProjects.length > 0) {
                const projectIds = await this.getProjectIdsByPattern();
                if (projectIds.length > 0) {
                    filters.push({
                        project: {
                            operator: '=',
                            values: projectIds
                        }
                    });
                }
            }

            if (filters.length > 0) {
                params.filters = JSON.stringify(filters);
                console.log('📋 Applied filters:', JSON.stringify(filters, null, 2));
            } else {
                console.log('⚠️  No filters applied - this will return ALL work packages!');
            }

            console.log('🔍 API Request params:', params);

            console.log('Fetching tasks with params:', params);

            const response = await axios.get(url, {
                headers: this.getHeaders(),
                params: params
            });

            const tasks = this.formatTasks(response.data._embedded.elements);
            
            console.log(`Fetched ${tasks.length} tasks from OpenProject`);
            return tasks;
            
        } catch (error) {
            console.error('Error fetching tasks from OpenProject:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }
    }

    async getExpectedUserName() {
        try {
            const url = `${this.apiBaseUrl}/users/me`;
            const response = await axios.get(url, {
                headers: this.getHeaders()
            });
            const user = response.data;
            return `${user.firstName} ${user.lastName}`.trim();
        } catch (error) {
            console.error('Error getting expected user name:', error.message);
            return 'Unknown';
        }
    }

    async getCurrentUserId() {
        try {
            const url = `${this.apiBaseUrl}/users/me`;
            const response = await axios.get(url, {
                headers: this.getHeaders()
            });

            const user = response.data;
            console.log(`Current user: ${user.firstName} ${user.lastName} (${user.email}) with ID: ${user.id}`);
            
            return user.id.toString();

        } catch (error) {
            console.error('Error fetching current user:', error.message);
            if (error.response?.status === 403) {
                console.error('API key does not have permission to access user information');
            }
            return null;
        }
    }

    async getProjectIdsByPattern() {
        try {
            const url = `${this.apiBaseUrl}/projects`;
            const response = await axios.get(url, {
                headers: this.getHeaders(),
                params: {
                    pageSize: 1000
                }
            });

            const projects = response.data._embedded.elements;
            const matchingProjectIds = [];

            for (const project of projects) {
                const projectName = project.name || '';
                for (const pattern of this.syncProjects) {
                    if (projectName.toLowerCase().includes(pattern.toLowerCase())) {
                        matchingProjectIds.push(project.id.toString());
                        console.log(`Found matching project: "${projectName}" (ID: ${project.id}) for pattern: "${pattern}"`);
                        break;
                    }
                }
            }

            console.log(`Found ${matchingProjectIds.length} matching projects for patterns: ${this.syncProjects.join(', ')}`);
            return matchingProjectIds;

        } catch (error) {
            console.error('Error fetching projects:', error.message);
            return [];
        }
    }

    async getTaskById(id) {
        try {
            if (!this.apiKey) {
                throw new Error('OpenProject API key not configured');
            }

            const url = `${this.apiBaseUrl}/work_packages/${id}`;
            const response = await axios.get(url, {
                headers: this.getHeaders()
            });

            return this.formatTask(response.data);
        } catch (error) {
            console.error(`Error fetching task ${id} from OpenProject:`, error.message);
            throw error;
        }
    }

    formatTask(workPackage) {
        const relatedTasks = this.extractRelatedTasks(workPackage);
        
        return {
            external_id: workPackage.id?.toString(),
            title: workPackage.subject || 'No title',
            description: workPackage.description?.raw || '',
            project: workPackage._links?.project?.title || 'Unknown project',
            project_id: workPackage._links?.project?.href?.split('/').pop() || null,
            status: workPackage._links?.status?.title || 'unknown',
            assignee: workPackage._links?.assignee?.title || 'Unassigned',
            responsible: workPackage._links?.responsible?.title || null,
            priority: workPackage._links?.priority?.title || 'Normal',
            estimated_hours: workPackage.estimatedTime ? parseFloat(workPackage.estimatedTime.replace('PT', '').replace('H', '')) : null,
            spent_hours: workPackage.spentTime ? parseFloat(workPackage.spentTime.replace('PT', '').replace('H', '')) : null,
            related_to: relatedTasks.length > 0 ? JSON.stringify(relatedTasks) : null,
            op_created_at: workPackage.createdAt ? new Date(workPackage.createdAt).toISOString().slice(0, 19).replace('T', ' ') : null,
            op_updated_at: workPackage.updatedAt ? new Date(workPackage.updatedAt).toISOString().slice(0, 19).replace('T', ' ') : null
        };
    }

    extractRelatedTasks(workPackage) {
        const related = [];
        
        if (workPackage._links) {
            if (workPackage._links.parent && workPackage._links.parent.href) {
                related.push({
                    type: 'parent',
                    id: workPackage._links.parent.href.split('/').pop(),
                    title: workPackage._links.parent.title || 'Parent task'
                });
            }
            
            if (workPackage._links.children && Array.isArray(workPackage._links.children)) {
                workPackage._links.children.forEach(child => {
                    related.push({
                        type: 'child',
                        id: child.href.split('/').pop(),
                        title: child.title || 'Child task'
                    });
                });
            }
            
            if (workPackage._links.relatedTo && Array.isArray(workPackage._links.relatedTo)) {
                workPackage._links.relatedTo.forEach(relation => {
                    related.push({
                        type: 'related',
                        id: relation.href.split('/').pop(),
                        title: relation.title || 'Related task'
                    });
                });
            }
            
            if (workPackage._links.blocks && Array.isArray(workPackage._links.blocks)) {
                workPackage._links.blocks.forEach(blocked => {
                    related.push({
                        type: 'blocks',
                        id: blocked.href.split('/').pop(),
                        title: blocked.title || 'Blocked task'
                    });
                });
            }
            
            if (workPackage._links.blockedBy && Array.isArray(workPackage._links.blockedBy)) {
                workPackage._links.blockedBy.forEach(blocker => {
                    related.push({
                        type: 'blocked_by',
                        id: blocker.href.split('/').pop(),
                        title: blocker.title || 'Blocking task'
                    });
                });
            }
        }
        
        return related;
    }

    formatTasks(workPackages) {
        return workPackages.map(wp => this.formatTask(wp));
    }

    async testConnection() {
        try {
            if (!this.apiKey) {
                return { success: false, error: 'API key not configured' };
            }

            const url = `${this.apiBaseUrl}/work_packages`;
            await axios.get(url, {
                headers: this.getHeaders(),
                params: { pageSize: 1 }
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: `Connection failed: ${error.message}`
            };
        }
    }

    async verifyCurrentUser() {
        try {
            const url = `${this.apiBaseUrl}/users/me`;
            const response = await axios.get(url, {
                headers: this.getHeaders()
            });

            const user = response.data;
            console.log('=== Current API Key User ===');
            console.log(`Name: ${user.firstName} ${user.lastName}`);
            console.log(`Email: ${user.email}`);
            console.log(`ID: ${user.id}`);
            console.log(`Status: ${user.status}`);
            console.log('This user will be used for task filtering');
            console.log('============================');

            return { 
                success: true, 
                user: {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    status: user.status
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get current user: ${error.message}`
            };
        }
    }

    getSyncConfiguration() {
        return {
            syncLimit: this.syncLimit,
            syncProjects: this.syncProjects.length > 0 ? this.syncProjects : ['All projects'],
            baseUrl: this.baseUrl,
            apiBaseUrl: this.apiBaseUrl,
            hasApiKey: !!this.apiKey
        };
    }

    async getFilteredTasksPreview() {
        try {
            console.log('=== OpenProject Sync Configuration ===');
            const config = this.getSyncConfiguration();
            console.log('User filter:', config.syncUser);
            console.log('Result limit:', config.syncLimit);
            console.log('Project patterns:', config.syncProjects.join(', '));
            console.log('======================================');

            if (this.syncProjects.length > 0) {
                console.log('Finding matching projects...');
                const projectIds = await this.getProjectIdsByPattern();
                console.log(`Found ${projectIds.length} matching projects`);
            }

            const tasks = await this.getTasks();
            console.log(`Final result: ${tasks.length} tasks retrieved`);
            
            return {
                configuration: config,
                taskCount: tasks.length,
                tasks: tasks.slice(0, 5),
                totalAvailable: tasks.length
            };
        } catch (error) {
            console.error('Error getting filtered tasks preview:', error.message);
            throw error;
        }
    }
}

module.exports = new OpenProjectService();