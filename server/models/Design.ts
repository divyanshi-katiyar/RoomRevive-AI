import mongoose, { Schema, Document } from 'mongoose';

export interface IDesign extends Document {
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
  roomAnalysis?: Record<string, any>;
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
  createdAt: Date;
  updatedAt: Date;
}

const DesignSchema = new Schema<IDesign>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: function (this: IDesign) {
        return `${this.selectedStyle || 'Modern'} ${this.roomType || 'Room'}`;
      },
    },
    originalImageUrl: {
      type: String,
      required: true,
    },
    generatedImageUrl: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      required: true,
    },
    selectedStyle: {
      type: String,
      required: true,
    },
    colorPreference: {
      type: String,
      default: 'Warm',
    },
    lightingPreference: {
      type: String,
      default: 'Natural',
    },
    furniturePreference: {
      type: String,
      default: 'Keep existing',
    },
    budget: {
      type: String,
      default: 'Moderate',
    },
    customInstructions: {
      type: String,
      default: '',
    },
    roomAnalysis: {
      type: Schema.Types.Mixed,
      default: null,
    },
    generationPrompt: {
      type: String,
      default: '',
    },
    designInsights: {
      type: Schema.Types.Mixed,
      default: null,
    },
    variations: {
      type: [
        {
          id: String,
          label: String,
          style: String,
          image: String,
          colorPalette: [Schema.Types.Mixed],
          changes: [String],
        },
      ],
      default: [],
    },
    refinementHistory: {
      type: [
        {
          timestamp: String,
          prompt: String,
          image: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user designs ordered by newest first
DesignSchema.index({ userId: 1, createdAt: -1 });

export const Design = mongoose.models.Design || mongoose.model<IDesign>('Design', DesignSchema);
