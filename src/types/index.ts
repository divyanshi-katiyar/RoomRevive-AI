export type InteriorStyle =
  | 'Modern'
  | 'Contemporary'
  | 'Traditional'
  | 'Bohemian'
  | 'Scandinavian'
  | 'Japandi'
  | 'Minimalist'
  | 'Industrial'
  | 'Luxury'
  | 'Rustic'
  | 'Mid-Century Modern';

export type ColorMood = 'Warm' | 'Cool' | 'Neutral' | 'Earthy' | 'Monochrome';

export type LightingType = 'Warm' | 'Neutral' | 'Cool' | 'Natural';

export type FurnitureApproach = 'Keep existing' | 'Replace' | 'Add' | 'Minimal';

export type BudgetTier = 'Budget' | 'Moderate' | 'Premium' | 'Luxury';

export interface RoomAlternativeType {
  type: string;
  confidence: number;
}

export interface RoomAnalysisData {
  roomType: string;
  confidence?: number;
  evidence?: string[];
  detectedObjects?: string[];
  alternativeTypes?: RoomAlternativeType[];
  furniture: Array<{
    item: string;
    material: string;
    condition: string;
    style: string;
  }>;
  wallColors: Array<{
    name: string;
    hex: string;
    role: string;
  }>;
  flooringType: string;
  lightingCondition: string;
  existingStyle: string;
  approximateLayout: string;
  emptySpace: string;
  suggestedImprovements: string[];
  isAmbiguous?: boolean;
  ambiguityReason?: string;
  walls?: string;
  flooring?: string;
  ceiling?: string;
  lighting?: string;
  windows?: number | string;
  doors?: number | string;
  cameraPerspective?: string;
  existingFurniture?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface RecommendedFurnitureItem {
  item: string;
  style: string;
  placement: string;
  reason: string;
  estimatedPrice?: string;
}

export interface DesignInsightsData {
  changesMade: string[];
  colorPalette: ColorSwatch[];
  recommendedFurniture: RecommendedFurnitureItem[];
  designSummary?: string;
}

export interface DesignVariation {
  id: string;
  label: string;
  style: string;
  image: string;
  changes?: string[];
}

export interface ProjectData {
  id: string;
  title: string;
  type: 'room';
  createdAt: string;
  updatedAt: string;
  originalImage: string;
  analysis: RoomAnalysisData;
  preferences: Record<string, any>;
  generatedImage: string;
  variations: DesignVariation[];
  refinementHistory: Array<{
    timestamp: string;
    prompt: string;
    image: string;
  }>;
  designInsights?: DesignInsightsData;
}

export type ShopCategory = 'Furniture' | 'Lighting' | 'Decor' | 'Textiles' | 'Accessories';

export interface DetectedShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  style: string;
  material: string;
  dominantColor: string;
  shape: string;
  description: string;
  importance: 'focal' | 'primary' | 'accent' | 'essential';
  searchQuery: string;
}

export interface ShopProduct {
  id: string;
  title: string;
  category: ShopCategory;
  price: string;
  retailer: string;
  imageUrl: string;
  productUrl: string;
  sourceQuery: string;
  matchReason: string;
  detectedItemId?: string;
  specs?: {
    color?: string;
    material?: string;
    style?: string;
  };
  isSimilar: boolean;
}

export interface ShopLookResult {
  items: DetectedShopItem[];
  products: ShopProduct[];
  categories: ShopCategory[];
  provider: string;
  isDemoData: boolean;
  note: string;
}
