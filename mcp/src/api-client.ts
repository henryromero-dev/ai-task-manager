import axios, { AxiosInstance } from 'axios';

export interface Task {
    id: number;
    external_id?: string;
    title: string;
    description?: string;
    project?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    count?: number;
    message?: string;
}

export interface ExportResponse {
    success: boolean;
    message: string;
    filePath: string;
    downloadUrl: string;
}

export interface SyncResponse {
    success: boolean;
    message: string;
    results: {
        created: number;
        updated: number;
        errors: Array<{
            external_id: string;
            error: string;
        }>;
    };
}

export class TaskApiClient {
    private client: AxiosInstance;

    constructor(baseUrl: string = 'http://localhost:3000') {
        this.client = axios.create({
            baseURL: baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async listTasks(): Promise<Task[]> {
        try {
            const response = await this.client.get<ApiResponse<Task[]>>('/tasks');

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch tasks');
            }

            return response.data.data || [];
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`API Error: ${error.message}`);
            }
            throw error;
        }
    }

    async getTask(id: number): Promise<Task | null> {
        try {
            const response = await this.client.get<ApiResponse<Task>>(`/tasks/${id}`);

            if (!response.data.success) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(response.data.error || 'Failed to fetch task');
            }

            return response.data.data || null;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    return null;
                }
                throw new Error(`API Error: ${error.message}`);
            }
            throw error;
        }
    }

    async getTaskByExternalId(externalId: string): Promise<Task | null> {
        try {
            const response = await this.client.get<ApiResponse<Task>>(`/tasks/external/${externalId}`);

            if (!response.data.success) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(response.data.error || 'Failed to fetch task');
            }

            return response.data.data || null;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    return null;
                }
                throw new Error(`API Error: ${error.message}`);
            }
            throw error;
        }
    }

    async getRelatedTasks(id: number): Promise<Task[]> {
        try {
            const response = await this.client.get<ApiResponse<Task[]>>(`/tasks/${id}/related`);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch related tasks');
            }

            return response.data.data || [];
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`API Error: ${error.message}`);
            }
            throw error;
        }
    }

    async exportTask(id: number): Promise<string> {
        try {
            const response = await this.client.post<ExportResponse>(`/tasks/${id}/export`);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to export task');
            }

            // Get the exported content
            const downloadResponse = await this.client.get(response.data.downloadUrl, {
                responseType: 'text'
            });

            return downloadResponse.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`API Error: ${error.message}`);
            }
            throw error;
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await this.client.get('/health');
            return response.data.status === 'ok';
        } catch (error) {
            return false;
        }
    }

    async syncTasks(): Promise<SyncResponse['results']> {
        try {
            const response = await this.client.post<SyncResponse>('/tasks/sync');

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to sync tasks');
            }

            return response.data.results;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`API Error: ${error.message}`);
            }
            throw error;
        }
    }

    async createTask(taskData: Partial<Task>): Promise<Task | null> {
        try {
            const response = await this.client.post<ApiResponse<Task>>('/tasks', taskData);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to create task');
            }

            return response.data.data || null;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`API Error: ${error.message}`);
            }
            throw error;
        }
    }

    async updateTask(id: number, taskData: Partial<Task>): Promise<Task | null> {
        try {
            const response = await this.client.put<ApiResponse<Task>>(`/tasks/${id}`, taskData);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to update task');
            }

            return response.data.data || null;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`API Error: ${error.message}`);
            }
            throw error;
        }
    }
}