import { apiClient } from './api';

export interface UserSavedDesign {
  _id: string;
  userId: string;
  title: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  roomType: string;
  selectedStyle: string;
  colorPreference?: string;
  lightingPreference?: string;
  furniturePreference?: string;
  budget?: string;
  customInstructions?: string;
  roomAnalysis?: any;
  generationPrompt?: string;
  designInsights?: {
    changesMade?: string[];
    colorPalette?: Array<{ name: string; hex: string; role: string }>;
    recommendedFurniture?: Array<{
      item: string;
      style: string;
      placement: string;
      reason: string;
      estimatedPrice?: string;
    }>;
    designSummary?: string;
  };
  variations?: Array<{
    id: string;
    label: string;
    style: string;
    image: string;
    colorPalette?: any[];
    changes?: string[];
  }>;
  refinementHistory?: Array<{
    timestamp: string;
    prompt: string;
    image: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDesignPayload {
  userId?: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  roomType: string;
  selectedStyle: string;
  colorPreference?: string;
  lightingPreference?: string;
  furniturePreference?: string;
  budget?: string;
  customInstructions?: string;
  roomAnalysis?: any;
  generationPrompt?: string;
  designInsights?: any;
  variations?: any[];
  title?: string;
}

export interface SaveDesignResponse {
  success: boolean;
  id: string;
  mongoId: string;
  _id: string;
  design: UserSavedDesign;
}

export interface UserStats {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
}

export const designsApi = {
  /**
   * Explicitly persists a newly generated design to MongoDB Atlas for the authenticated user.
   */
  async save(payload: SaveDesignPayload): Promise<SaveDesignResponse> {
    const res = await apiClient.post<SaveDesignResponse>('/designs', payload);
    return res.data;
  },

  /**
   * Fetches all designs belonging to the currently authenticated user from MongoDB.
   */
  async getAll(): Promise<UserSavedDesign[]> {
    const res = await apiClient.get<UserSavedDesign[]>('/designs');
    return res.data;
  },

  /**
   * Fetches a specific design by ID (scoped to authenticated user on server).
   */
  async getById(id: string): Promise<UserSavedDesign> {
    const res = await apiClient.get<UserSavedDesign>(`/designs/${id}`);
    return res.data;
  },

  /**
   * Deletes a saved design by ID (scoped to authenticated user on server).
   */
  async delete(id: string): Promise<{ success: boolean; message: string; id: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string; id: string }>(`/designs/${id}`);
    return res.data;
  },

  /**
   * Fetches the user's daily generation limit status.
   */
  async getUserStats(): Promise<UserStats> {
    const res = await apiClient.get<UserStats>('/designs/user/stats');
    return res.data;
  },
};
