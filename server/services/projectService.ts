import { projectRepository, ProjectItem } from '../repositories/projectRepository.js';

export class ProjectService {
  async getAllProjects(): Promise<ProjectItem[]> {
    return await projectRepository.getAll();
  }

  async getProjectById(id: string): Promise<ProjectItem | null> {
    return await projectRepository.getById(id);
  }

  async createProject(data: any): Promise<ProjectItem> {
    return await projectRepository.create(data);
  }

  async updateProject(id: string, updates: Partial<ProjectItem>): Promise<ProjectItem | null> {
    return await projectRepository.update(id, updates);
  }

  async deleteProject(id: string): Promise<boolean> {
    return await projectRepository.delete(id);
  }
}

export const projectService = new ProjectService();
