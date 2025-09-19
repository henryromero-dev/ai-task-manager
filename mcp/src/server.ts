#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { TaskApiClient, Task } from './api-client.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

class TaskMcpServer {
    private server: Server;
    private apiClient: TaskApiClient;

    constructor() {
        this.server = new Server(
            {
                name: 'task-mcp-server',
                version: '1.0.0',
                capabilities: {
                    tools: {},
                },
            }
        );
        console.log('Server initialized');
        this.apiClient = new TaskApiClient(API_BASE_URL);
        this.setupHandlers();
    }

    private setupHandlers(): void {
        // List available tools
        console.log('Listing available tools');
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'listTasks',
                        description: 'Get all tasks from the task management system',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: [],
                        },
                    },
                    {
                        name: 'getTask',
                        description: 'Get details of a specific task by ID',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'number',
                                    description: 'The ID of the task to retrieve',
                                },
                            },
                            required: ['id'],
                        },
                    },
                    {
                        name: 'getTaskByExternalId',
                        description: 'Get details of a specific task by external ID (OpenProject ID). Use this when searching for tasks with the word "Task" followed by a number.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                externalId: {
                                    type: 'string',
                                    description: 'The external ID of the task to retrieve (e.g., from OpenProject)',
                                },
                            },
                            required: ['externalId'],
                        },
                    },
                    {
                        name: 'findRelatedTasks',
                        description: 'Find tasks related to a specific task based on keywords',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'number',
                                    description: 'The ID of the task to find related tasks for',
                                },
                            },
                            required: ['id'],
                        },
                    },
                    {
                        name: 'exportTaskDoc',
                        description: 'Export a task as a Markdown implementation document',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'number',
                                    description: 'The ID of the task to export',
                                },
                            },
                            required: ['id'],
                        },
                    },
                    {
                        name: 'syncTasks',
                        description: 'Synchronize tasks from OpenProject to local database',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: [],
                        },
                    },
                    {
                        name: 'askAboutTasks',
                        description: 'Answer questions about tasks in a human-friendly format. Ask about what tasks you have, what needs to be done, project status, etc.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                question: {
                                    type: 'string',
                                    description: 'Your question about tasks in natural language (e.g., "¿Qué tareas tengo?", "¿En qué proyecto estoy trabajando?", "¿Qué hay que hacer hoy?")',
                                },
                            },
                            required: ['question'],
                        },
                    },
                    {
                        name: 'getTaskSummary',
                        description: 'Get a friendly summary of all your tasks with counts and status overview',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: [],
                        },
                    },
                    {
                        name: 'createTask',
                        description: 'Create a new task with title, description, project, and status',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                title: {
                                    type: 'string',
                                    description: 'The title of the task',
                                },
                                description: {
                                    type: 'string',
                                    description: 'The description of the task (optional)',
                                },
                                project: {
                                    type: 'string',
                                    description: 'The project name (optional)',
                                },
                                status: {
                                    type: 'string',
                                    description: 'The status of the task (default: pending)',
                                },
                            },
                            required: ['title'],
                        },
                    },
                    {
                        name: 'updateTask',
                        description: 'Update an existing task by ID with new title, description, project, or status',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'number',
                                    description: 'The ID of the task to update',
                                },
                                title: {
                                    type: 'string',
                                    description: 'The new title of the task (optional)',
                                },
                                description: {
                                    type: 'string',
                                    description: 'The new description of the task (optional)',
                                },
                                project: {
                                    type: 'string',
                                    description: 'The new project name (optional)',
                                },
                                status: {
                                    type: 'string',
                                    description: 'The new status of the task (optional)',
                                },
                            },
                            required: ['id'],
                        },
                    }
                ],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            console.log('Handling tool call:', name, args);

            try {
                switch (name) {
                    case 'listTasks':
                        return await this.handleListTasks();

                    case 'getTask':
                        return await this.handleGetTask(args);

                    case 'getTaskByExternalId':
                        return await this.handleGetTaskByExternalId(args);

                    case 'findRelatedTasks':
                        return await this.handleFindRelatedTasks(args);

                    case 'exportTaskDoc':
                        return await this.handleExportTaskDoc(args);

                    case 'syncTasks':
                        return await this.handleSyncTasks();

                    case 'askAboutTasks':
                        return await this.handleAskAboutTasks(args);

                    case 'getTaskSummary':
                        return await this.handleGetTaskSummary();

                    case 'createTask':
                        return await this.handleCreateTask(args);

                    case 'updateTask':
                        return await this.handleUpdateTask(args);

                    default:
                        throw new McpError(
                            ErrorCode.MethodNotFound,
                            `Unknown tool: ${name}`
                        );
                }
            } catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }

                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                throw new McpError(ErrorCode.InternalError, errorMessage);
            }
        });
    }

    private async handleListTasks() {
        try {
            const tasks = await this.apiClient.listTasks();

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            message: `Found ${tasks.length} tasks`,
                            data: tasks,
                            count: tasks.length
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                            data: []
                        }, null, 2),
                    },
                ],
            };
        }
    }

    private async handleGetTask(args: any) {
        if (!args.id || typeof args.id !== 'number') {
            throw new McpError(ErrorCode.InvalidParams, 'Task ID is required and must be a number');
        }

        try {
            const task = await this.apiClient.getTask(args.id);

            if (!task) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: `Task with ID ${args.id} not found`,
                                data: null
                            }, null, 2),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            message: `Task ${args.id} retrieved successfully`,
                            data: task
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task';
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                            data: null
                        }, null, 2),
                    },
                ],
            };
        }
    }

    private async handleGetTaskByExternalId(args: any) {
        if (!args.externalId || typeof args.externalId !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'External ID is required and must be a string');
        }

        try {
            const task = await this.apiClient.getTaskByExternalId(args.externalId);

            if (!task) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: `Task with external ID ${args.externalId} not found`,
                                data: null
                            }, null, 2),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            message: `Task with external ID ${args.externalId} retrieved successfully`,
                            data: task
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task by external ID';
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                            data: null
                        }, null, 2),
                    },
                ],
            };
        }
    }

    private async handleFindRelatedTasks(args: any) {
        if (!args.id || typeof args.id !== 'number') {
            throw new McpError(ErrorCode.InvalidParams, 'Task ID is required and must be a number');
        }

        try {
            const relatedTasks = await this.apiClient.getRelatedTasks(args.id);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            message: `Found ${relatedTasks.length} related tasks for task ${args.id}`,
                            data: relatedTasks,
                            count: relatedTasks.length
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch related tasks';
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                            data: []
                        }, null, 2),
                    },
                ],
            };
        }
    }

    private async handleExportTaskDoc(args: any) {
        if (!args.id || typeof args.id !== 'number') {
            throw new McpError(ErrorCode.InvalidParams, 'Task ID is required and must be a number');
        }

        try {
            const markdownContent = await this.apiClient.exportTask(args.id);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            message: `Task ${args.id} exported successfully`,
                            data: {
                                taskId: args.id,
                                markdown: markdownContent,
                                exportedAt: new Date().toISOString()
                            }
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export task';
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                            data: null
                        }, null, 2),
                    },
                ],
            };
        }
    }

    private async handleSyncTasks() {
        try {
            const syncResult = await this.apiClient.syncTasks();
            
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            message: 'OpenProject synchronization completed',
                            data: syncResult
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sync tasks';
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                            data: null
                        }, null, 2),
                    },
                ],
            };
        }
    }

    private async handleGetTaskSummary() {
        try {
            const tasks = await this.apiClient.listTasks();
            
            if (tasks.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: '📋 **Resumen de Tareas**\n\n' +
                                  'No tienes tareas asignadas en este momento.\n\n' +
                                  '💡 **Sugerencias:**\n' +
                                  '• Usa Postman para crear nuevas tareas con POST a http://localhost:3000/tasks\n' +
                                  '• Sincroniza con OpenProject usando el comando syncTasks\n' +
                                  '• Revisa si hay tareas pendientes en otros sistemas\n\n' +
                                  '¡Tu lista de tareas está lista para ser llenada! 🚀'
                        },
                    ],
                };
            }

            // Group tasks by status
            const statusCounts = tasks.reduce((acc, task) => {
                acc[task.status] = (acc[task.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // Get projects
            const projects = [...new Set(tasks.map(task => task.project).filter(p => p))];
            
            // Get pending tasks
            const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress');
            
            let response = '📋 **Resumen de Tareas**\n\n';
            response += `**Total:** ${tasks.length} tarea${tasks.length > 1 ? 's' : ''}\n\n`;
            
            // Status breakdown
            response += '**Por Estado:**\n';
            Object.entries(statusCounts).forEach(([status, count]) => {
                const emoji = status === 'completed' ? '✅' : status === 'in_progress' ? '🔄' : '⏳';
                response += `${emoji} ${status}: ${count} tarea${count > 1 ? 's' : ''}\n`;
            });
            
            // Projects
            if (projects.length > 0) {
                response += '\n**Proyectos:**\n';
                projects.forEach(project => {
                    const projectTasks = tasks.filter(task => task.project === project);
                    response += `• ${project} (${projectTasks.length} tarea${projectTasks.length > 1 ? 's' : ''})\n`;
                });
            }
            
            // Pending tasks for today
            if (pendingTasks.length > 0) {
                response += '\n**Tareas Pendientes:**\n';
                pendingTasks.forEach((task, index) => {
                    response += `${index + 1}. ${task.title} (${task.status})\n`;
                });
            } else if (tasks.length > 0) {
                response += '\n🎉 ¡Todas las tareas están completadas!';
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: response,
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get task summary';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Error al obtener el resumen de tareas: ${errorMessage}`,
                    },
                ],
            };
        }
    }

    private async handleAskAboutTasks(args: any) {
        if (!args.question || typeof args.question !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Question is required and must be a string');
        }

        try {
            // Get all tasks first
            const tasks = await this.apiClient.listTasks();
            
            // Analyze the question and provide a human-friendly response
            const question = args.question.toLowerCase();
            let response = '';

            if (question.includes('qué tareas') || question.includes('que tareas') || question.includes('what tasks') || question.includes('tareas asignadas')) {
                if (tasks.length === 0) {
                    response = 'No tienes tareas asignadas en este momento. La lista está vacía.';
                } else {
                    response = `Tienes ${tasks.length} tarea${tasks.length > 1 ? 's' : ''} asignada${tasks.length > 1 ? 's' : ''}:\n\n`;
                    tasks.forEach((task, index) => {
                        response += `${index + 1}. **${task.title}**\n`;
                        if (task.description) {
                            response += `   ${task.description}\n`;
                        }
                        response += `   - Estado: ${task.status}\n`;
                        if (task.project) {
                            response += `   - Proyecto: ${task.project}\n`;
                        }
                        response += `   - ID: ${task.id}\n\n`;
                    });
                }
            } else if (question.includes('proyecto') || question.includes('project') || question.includes('en qué proyecto')) {
                const projects = [...new Set(tasks.map(task => task.project).filter(p => p))];
                if (projects.length === 0) {
                    response = 'No hay proyectos asignados actualmente.';
                } else {
                    response = `Estás trabajando en ${projects.length} proyecto${projects.length > 1 ? 's' : ''}:\n\n`;
                    projects.forEach(project => {
                        const projectTasks = tasks.filter(task => task.project === project);
                        response += `**${project}** (${projectTasks.length} tarea${projectTasks.length > 1 ? 's' : ''})\n`;
                    });
                }
            } else if (question.includes('hoy') || question.includes('today') || question.includes('qué hacer') || question.includes('que hacer')) {
                if (tasks.length === 0) {
                    response = 'No hay tareas pendientes para hoy. ¡Disfruta tu día libre!';
                } else {
                    const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress');
                    if (pendingTasks.length === 0) {
                        response = 'Todas tus tareas están completadas. ¡Excelente trabajo!';
                    } else {
                        response = `Para hoy tienes ${pendingTasks.length} tarea${pendingTasks.length > 1 ? 's' : ''} pendiente${pendingTasks.length > 1 ? 's' : ''}:\n\n`;
                        pendingTasks.forEach((task, index) => {
                            response += `${index + 1}. **${task.title}** (${task.status})\n`;
                        });
                    }
                }
            } else if (question.includes('estado') || question.includes('status') || question.includes('progreso')) {
                const statusCounts = tasks.reduce((acc, task) => {
                    acc[task.status] = (acc[task.status] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                
                if (Object.keys(statusCounts).length === 0) {
                    response = 'No hay tareas para mostrar el estado.';
                } else {
                    response = 'Estado de tus tareas:\n\n';
                    Object.entries(statusCounts).forEach(([status, count]) => {
                        response += `- ${status}: ${count} tarea${count > 1 ? 's' : ''}\n`;
                    });
                }
            } else {
                // Generic response for other questions
                if (tasks.length === 0) {
                    response = 'No tienes tareas asignadas actualmente.';
                } else {
                    response = `Tienes ${tasks.length} tarea${tasks.length > 1 ? 's' : ''} en total. `;
                    const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress');
                    if (pendingTasks.length > 0) {
                        response += `${pendingTasks.length} están pendientes.`;
                    } else {
                        response += 'Todas están completadas.';
                    }
                }
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: response,
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to process question';
            return {
                content: [
                    {
                        type: 'text',
                        text: `Lo siento, no pude procesar tu pregunta. Error: ${errorMessage}`,
                    },
                ],
            };
        }
    }

    private async handleCreateTask(args: any) {
        try {
            const task = await this.apiClient.createTask(args);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Tarea creada exitosamente: ${task?.title}`,
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Error al crear la tarea: ${errorMessage}`,
                    },
                ],
            };
        }
    }

    private async handleUpdateTask(args: any) {
        try {
            const { id, ...updateData } = args;
            const task = await this.apiClient.updateTask(id, updateData);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Tarea actualizada exitosamente: ${task?.title}`,
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Error al actualizar la tarea: ${errorMessage}`,
                    },
                ],
            };
        }
    }

    async run(): Promise<void> {
        // Check API connectivity on startup
        try {
            const isHealthy = await this.apiClient.checkHealth();
            if (!isHealthy) {
                console.error(`Warning: Task API at ${API_BASE_URL} is not responding`);
            } else {
                console.error(`Connected to Task API at ${API_BASE_URL}`);
            }
        } catch (error) {
            console.error(`Warning: Could not connect to Task API at ${API_BASE_URL}`);
        }

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Task MCP Server running on stdio');
    }
}

// Start the server
async function main() {
    const server = new TaskMcpServer();
    await server.run();
}

if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error in main():', error);
        process.exit(1);
    });
}

export { TaskMcpServer };