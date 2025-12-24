import { Project, Reminder, MediaAsset, Folder, Post, Demographic, Country } from '../types';
import { ScriptScene, ScriptParams } from './geminiService'; // Reuse types

const API_URL = 'http://localhost:3001/api';

export const api = {
  projects: {
    getAll: async (): Promise<Project[]> => {
      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
    create: async (project: Omit<Project, 'id' | 'lastEdited'>): Promise<Project> => {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          lastEdited: 'Justo ahora',
          status: 'Draft',
        }),
      });
      if (!response.ok) throw new Error('Failed to create project');
      const data = await response.json();
      return data[0]; // Backend returns array based on previous mock, need to align if changed
    },
  },
  reminders: {
    getAll: async (): Promise<Reminder[]> => {
      const response = await fetch(`${API_URL}/reminders`);
      if (!response.ok) throw new Error('Failed to fetch reminders');
      return response.json();
    },
  },
  media: {
    getAll: async (): Promise<MediaAsset[]> => {
      const response = await fetch(`${API_URL}/media`);
      if (!response.ok) throw new Error('Failed to fetch media');
      return response.json();
    },
    getFolders: async (): Promise<Folder[]> => {
        const response = await fetch(`${API_URL}/media/folders`);
        if (!response.ok) throw new Error('Failed to fetch folders');
        return response.json();
    },
    create: async (asset: Omit<MediaAsset, 'id' | 'date'>): Promise<MediaAsset> => {
      const response = await fetch(`${API_URL}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });
      if (!response.ok) throw new Error('Failed to create asset');
      return response.json();
    },
    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/media/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete asset');
    }
  },
  analytics: {
      getStats: async (platform: string = 'all') => {
          const response = await fetch(`${API_URL}/analytics/stats?platform=${platform}`);
          if (!response.ok) throw new Error('Failed to fetch stats');
          return response.json();
      },
      getChartData: async () => {
          const response = await fetch(`${API_URL}/analytics/chart`);
          if (!response.ok) throw new Error('Failed to fetch chart data');
          return response.json();
      },
      getRecentPosts: async (): Promise<Post[]> => {
          const response = await fetch(`${API_URL}/analytics/recent-posts`);
          if (!response.ok) throw new Error('Failed to fetch recent posts');
          return response.json();
      },
      getDemographics: async (): Promise<Demographic[]> => {
          const response = await fetch(`${API_URL}/analytics/demographics`);
          if (!response.ok) throw new Error('Failed to fetch demographics');
          return response.json();
      },
      getTopCountries: async (): Promise<Country[]> => {
          const response = await fetch(`${API_URL}/analytics/top-countries`);
          if (!response.ok) throw new Error('Failed to fetch top countries');
          return response.json();
      }
  },
  ai: {
    generateScript: async (params: ScriptParams): Promise<ScriptScene[]> => {
      const response = await fetch(`${API_URL}/ai/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }
      return response.json();
    },
    generateFullProject: async (params: any): Promise<any> => {
        const response = await fetch(`${API_URL}/ai/project/generate-full`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate full project');
        }
        return response.json();
    },
    generateVisuals: async (packageData: any): Promise<any> => {
        const response = await fetch(`${API_URL}/ai/project/generate-visuals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packageData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate visuals');
        }
        return response.json();
    },
    generateAudio: async (packageData: any): Promise<any> => {
        const response = await fetch(`${API_URL}/ai/project/generate-audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packageData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate audio');
        }
        return response.json();
    }
  }
};