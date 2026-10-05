import { InteriorStyle, ColorMood, LightingType, FurnitureApproach, BudgetTier } from '../types';

export interface StyleOption {
  id: InteriorStyle;
  name: string;
  subtitle: string;
  image: string;
  tags: string[];
}

export const INTERIOR_STYLES: StyleOption[] = [
  {
    id: 'Modern',
    name: 'Modern',
    subtitle: 'Clean lines, balanced geometry, refined elegance, architectural surfaces',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    tags: ['Clean Lines', 'Architectural', 'Crisp', 'Stone & Glass'],
  },
  {
    id: 'Contemporary',
    name: 'Contemporary',
    subtitle: 'Fluid curves, tactile bouclé, curated modern art, rounded forms',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    tags: ['Curved', 'Organic', 'Bouclé', 'Curated Art'],
  },
  {
    id: 'Traditional',
    name: 'Traditional',
    subtitle: 'Rich natural wood, classic silhouettes, detailed woodwork, elegant upholstery',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80',
    tags: ['Rich Wood', 'Detailed Moldings', 'Symmetrical', 'Classic'],
  },
  {
    id: 'Bohemian',
    name: 'Bohemian',
    subtitle: 'Layered textiles, patterned rugs, lush plants, rattan & earthy tones',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    tags: ['Layered Textiles', 'Plants', 'Rattan', 'Warm Earthy'],
  },
  {
    id: 'Scandinavian',
    name: 'Scandinavian',
    subtitle: 'Light natural wood, neutral colors, clean functional forms, bright daylight',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    tags: ['Light Wood', 'Neutral Colors', 'Functional', 'Daylight'],
  },
  {
    id: 'Japandi',
    name: 'Japandi',
    subtitle: 'Warm neutral palette, natural wood, minimal furniture, subtle Japanese calm',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    tags: ['Natural Wood', 'Minimal', 'Organic', 'Calm Atmosphere'],
  },
  {
    id: 'Minimalist',
    name: 'Minimalist',
    subtitle: 'Very limited furniture, clean lines, neutral palette, uncluttered negative space',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    tags: ['Uncluttered', 'Clean Lines', 'Pure Form', 'Negative Space'],
  },
  {
    id: 'Industrial',
    name: 'Industrial',
    subtitle: 'Dark metal, raw wood, functional furniture, industrial lighting, restrained decor',
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80',
    tags: ['Dark Metal', 'Raw Materials', 'Functional', 'Urban'],
  },
  {
    id: 'Luxury',
    name: 'Luxury',
    subtitle: 'Calacatta marble, brushed bronze, velvet, bespoke joinery, statement lighting',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
    tags: ['Calacatta Marble', 'Brushed Bronze', 'Velvet', 'Opulent'],
  },
  {
    id: 'Rustic',
    name: 'Rustic',
    subtitle: 'Reclaimed timber, natural stone, textured linens, rugged artisanal warmth',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    tags: ['Reclaimed Wood', 'Natural Stone', 'Textured Linens', 'Rugged Warmth'],
  },
  {
    id: 'Mid-Century Modern',
    name: 'Mid-Century Modern',
    subtitle: 'Warm teak & walnut, iconic tapered legs, retro-modern lighting & graphic accents',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80',
    tags: ['Teak & Walnut', 'Tapered Legs', 'Iconic Silhouettes', 'Graphic Pops'],
  },
];

export type ColorTone = 'Warm' | 'Cool' | 'Neutral';

export interface ToneOption {
  id: ColorTone;
  name: string;
  palette: string[];
  description: string;
}

export const COLOR_TONES: ToneOption[] = [
  {
    id: 'Warm',
    name: 'Warm',
    palette: ['#FAF5EF', '#E6D7C3', '#C7A785', '#8C6849'],
    description: 'Warm whites, beige, cream, warm wood and warm lighting',
  },
  {
    id: 'Cool',
    name: 'Cool',
    palette: ['#F4F7F9', '#D2DBE2', '#8EA0AE', '#3E4953'],
    description: 'Cool whites, grey, blue-grey and cooler lighting',
  },
  {
    id: 'Neutral',
    name: 'Neutral',
    palette: ['#F7F6F4', '#DDDCD7', '#ACA9A2', '#4B4844'],
    description: 'Balanced whites, beige, grey and natural tones',
  },
];

export const ROOM_TYPES = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Workspace',
  'Dining Room',
];

export const COLOR_MOODS: Array<{ id: ColorMood; name: string; hexCodes: string[]; description: string }> = [
  { id: 'Warm', name: 'Warm Warmth', hexCodes: ['#FAF5EF', '#E6D7C3', '#C7A785', '#8C6849'], description: 'Cream, butter, honeyed oak, taupe' },
  { id: 'Neutral', name: 'Neutral Calming', hexCodes: ['#F7F6F4', '#DDDCD7', '#ACA9A2', '#4B4844'], description: 'Bone white, greige, linen, stone' },
  { id: 'Earthy', name: 'Earthy Biophilic', hexCodes: ['#F3EFE6', '#D1C2A5', '#7F8B73', '#504435'], description: 'Olive, terracotta, clay, raw timber' },
  { id: 'Cool', name: 'Cool Nordic', hexCodes: ['#F4F7F9', '#D2DBE2', '#8EA0AE', '#3E4953'], description: 'Morning mist, ice blue, slate, mineral' },
  { id: 'Monochrome', name: 'Monochrome Minimal', hexCodes: ['#FFFFFF', '#D6D6D6', '#666666', '#1A1A1A'], description: 'Architectural black, charcoal, pure white' },
];

export const LIGHTING_OPTIONS: Array<{ id: LightingType; title: string; subtitle: string }> = [
  { id: 'Warm', title: 'Warm Glow', subtitle: '2700K ambient layered fixtures' },
  { id: 'Natural', title: 'Natural Daylight', subtitle: 'Diffused morning and afternoon sun' },
  { id: 'Neutral', title: 'Neutral Balance', subtitle: 'Clean 3500K balanced daylight' },
  { id: 'Cool', title: 'Cool Gallery', subtitle: 'Crisp 4000K architectural focus' },
];

export const FURNITURE_OPTIONS: Array<{ id: FurnitureApproach; title: string; subtitle: string }> = [
  { id: 'Keep existing', title: 'Keep Existing Layout', subtitle: 'Refresh finishes, colors, and styling around current pieces' },
  { id: 'Replace', title: 'Full Designer Refresh', subtitle: 'Curate new signature furniture matching the target style' },
  { id: 'Add', title: 'Complementary Additions', subtitle: 'Retain your core pieces and add key missing accent items' },
  { id: 'Minimal', title: 'Monastic / Minimal', subtitle: 'Remove excess items to maximize open negative space' },
];

export const BUDGET_TIERS: Array<{ id: BudgetTier; title: string; subtitle: string }> = [
  { id: 'Budget', title: 'Budget Friendly', subtitle: 'Accessible brands, paint focus, DIY styling' },
  { id: 'Moderate', title: 'Mid-Tier Modern', subtitle: 'Quality retail brands (West Elm, CB2, Article)' },
  { id: 'Premium', title: 'Architectural Premium', subtitle: 'Designer trade showrooms, solid woods, custom upholstery' },
  { id: 'Luxury', title: 'Bespoke Luxury', subtitle: 'Italian marble, custom millwork, collector art & lighting' },
];

export const QUICK_REFINEMENTS = [
  'Make it warmer',
  'Make it brighter',
  'Make it more luxurious',
  'Make it minimal',
  'Add plants',
  'Add storage',
  'Change furniture',
  'Change wall color',
  'Change flooring',
  'Improve lighting',
  'Make the room look larger',
];

export const SAMPLE_ROOMS = [
  {
    title: 'Home Office / Workspace',
    category: 'Workspace / Home Office',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',
    description: 'Workstation room with desk, task chair, and open wall storage',
  },
  {
    title: 'Empty Living Space',
    category: 'Living Room',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    description: 'Hardwood floor room with natural daylight from windows',
  },
  {
    title: 'Dated Bedroom',
    category: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=1000&q=80',
    description: 'Traditional bedroom layout awaiting a contemporary design refresh',
  },
  {
    title: 'Cozy Dining Alcove',
    category: 'Dining Room',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80',
    description: 'Intimate dining space ready for a sculptural statement upgrade',
  },
];
