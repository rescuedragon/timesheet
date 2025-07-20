// API Service for handling server communication
import { TimeLog, Project, Subproject, Holiday } from '@/types';

// Get the API URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
console.log(`[API] Using API base URL: ${API_BASE_URL}`);

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Generic fetch wrapper with error handling
  private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      console.log(`[API] ${options?.method || 'GET'} request to ${url}`);
      if (options?.body) {
        console.log(`[API] Request body: ${options.body}`);
      }
      
      const response = await fetch(url, options);
      
      console.log(`[API] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[API] Error response:`, errorData);
        throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
      }
      
      const data = await response.json() as T;
      console.log(`[API] Response data:`, data);
      return data;
    } catch (error) {
      console.error('[API] Request failed:', error);
      if (error instanceof Error) {
        console.error('[API] Error message:', error.message);
        console.error('[API] Error stack:', error.stack);
      }
      throw error;
    }
  }

  // Time Logs API
  async getTimeLogs(dateFilter?: { date?: string, startDate?: string, endDate?: string }): Promise<TimeLog[]> {
    let url = `${API_BASE_URL}/time-logs`;
    
    if (dateFilter) {
      const params = new URLSearchParams();
      if (dateFilter.date) params.append('date', dateFilter.date);
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return this.fetchWithErrorHandling<TimeLog[]>(url);
  }

  async getTimeLog(id: string): Promise<TimeLog> {
    return this.fetchWithErrorHandling<TimeLog>(`${API_BASE_URL}/time-logs/${id}`);
  }

  async createTimeLog(timeLog: Omit<TimeLog, 'id'>): Promise<TimeLog> {
    return this.fetchWithErrorHandling<TimeLog>(`${API_BASE_URL}/time-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeLog),
    });
  }

  async updateTimeLog(id: string, updates: Partial<TimeLog>): Promise<TimeLog> {
    return this.fetchWithErrorHandling<TimeLog>(`${API_BASE_URL}/time-logs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  async deleteTimeLog(id: string): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/time-logs/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects API
  async getProjects(): Promise<Project[]> {
    return this.fetchWithErrorHandling<Project[]>(`${API_BASE_URL}/projects`);
  }

  async createProject(project: Omit<Project, 'id' | 'totalTime' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return this.fetchWithErrorHandling<Project>(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    return this.fetchWithErrorHandling<Project>(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Subprojects API
  async createSubproject(projectId: string, subproject: Omit<Subproject, 'id' | 'totalTime' | 'createdAt' | 'updatedAt'>): Promise<Subproject> {
    return this.fetchWithErrorHandling<Subproject>(`${API_BASE_URL}/projects/${projectId}/subprojects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subproject),
    });
  }

  async updateSubproject(projectId: string, subprojectId: string, updates: Partial<Subproject>): Promise<Subproject> {
    return this.fetchWithErrorHandling<Subproject>(`${API_BASE_URL}/projects/subprojects/${subprojectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  async deleteSubproject(projectId: string, subprojectId: string): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/projects/subprojects/${subprojectId}`, {
      method: 'DELETE',
    });
  }

  // Holidays API
  async getHolidays(): Promise<Holiday[]> {
    return this.fetchWithErrorHandling<Holiday[]>(`${API_BASE_URL}/holidays`);
  }

  async createHoliday(holiday: Omit<Holiday, 'id' | 'createdAt' | 'updatedAt'>): Promise<Holiday> {
    return this.fetchWithErrorHandling<Holiday>(`${API_BASE_URL}/holidays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holiday),
    });
  }

  async updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday> {
    return this.fetchWithErrorHandling<Holiday>(`${API_BASE_URL}/holidays/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  async deleteHoliday(id: string): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/holidays/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = ApiService.getInstance();