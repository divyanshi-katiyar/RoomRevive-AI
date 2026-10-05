import { apiClient } from './api';
import { ProjectData } from '../types';

export const projectApi = {
  async getAll(): Promise<ProjectData[]> {
    const res = await apiClient.get<ProjectData[]>('/projects');
    return res.data;
  },

  async getById(id: string): Promise<ProjectData> {
    const res = await apiClient.get<ProjectData>(`/projects/${id}`);
    return res.data;
  },

  async update(id: string, updates: Partial<ProjectData>): Promise<ProjectData> {
    const res = await apiClient.patch<ProjectData>(`/projects/${id}`, updates);
    return res.data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/projects/${id}`);
    return res.data;
  },
};

export const assistantApi = {
  async sendMessage(params: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; text: string }>;
    context?: any;
  }): Promise<{ reply: string }> {
    const res = await apiClient.post<{ reply: string }>('/assistant/chat', params);
    return res.data;
  },
};
