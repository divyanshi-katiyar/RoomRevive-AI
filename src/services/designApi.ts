import { apiClient } from './api';
import { RoomAnalysisData, DesignInsightsData, DesignVariation, ProjectData } from '../types';

export interface GenerateDesignPayload {
  originalImage: string;
  roomAnalysis?: RoomAnalysisData;
  room?: string;
  style: string;
  colorTone?: 'Warm' | 'Cool' | 'Neutral' | string;
  colorMood?: string;
  customColor?: string;
  lighting?: string;
  furniturePreference?: string;
  budget?: string;
  userInstructions?: string;
  saveToStudio?: boolean;
}

export interface GenerateDesignResponse {
  success?: boolean;
  imageUrl?: string;
  error?: string;
  project?: ProjectData;
  projectId?: string;
  generatedImage: string | null;
  isAiGeneratedImage: boolean;
  imageGenerationAvailable?: boolean;
  imageGenerationMessage?: string;
  generationPrompt?: string;
  analysis: RoomAnalysisData;
  designInsights: DesignInsightsData;
  variations: DesignVariation[];
  persistedToAtlas?: boolean;
  mongoDesignId?: string;
  persistenceError?: string;
}

export const designApi = {
  async analyzeRoom(image: string): Promise<RoomAnalysisData> {
    const res = await apiClient.post<RoomAnalysisData>('/design/analyze', { image });
    return res.data;
  },

  async generateDesign(payload: GenerateDesignPayload): Promise<GenerateDesignResponse> {
    const res = await apiClient.post<GenerateDesignResponse>('/design/generate', payload);
    return res.data;
  },

  async refineDesign(payload: {
    projectId?: string;
    currentImage: string;
    originalImage?: string;
    refinementPrompt: string;
    currentStyle?: string;
  }): Promise<{ refinedImage: string; message: string; project?: ProjectData }> {
    const res = await apiClient.post('/design/refine', payload);
    return res.data;
  },
};
