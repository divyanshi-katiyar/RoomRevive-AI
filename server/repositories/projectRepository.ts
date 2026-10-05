export interface ProjectItem {
  id: string;
  title: string;
  type: 'room';
  createdAt: string;
  updatedAt: string;
  originalImage: string;
  analysis: any;
  preferences: any;
  generatedImage: string;
  variations: Array<{
    id: string;
    label: string;
    style: string;
    image: string;
    colorPalette?: any[];
    changes?: string[];
  }>;
  refinementHistory: Array<{
    timestamp: string;
    prompt: string;
    image: string;
  }>;
  designInsights?: {
    changesMade: string[];
    colorPalette: Array<{ name: string; hex: string; role: string }>;
    recommendedFurniture: Array<{
      item: string;
      style: string;
      placement: string;
      reason: string;
      estimatedPrice?: string;
    }>;
    designSummary?: string;
  };
}

export interface ProjectRepositoryInterface {
  getAll(): Promise<ProjectItem[]>;
  getById(id: string): Promise<ProjectItem | null>;
  create(project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<ProjectItem>;
  update(id: string, updates: Partial<ProjectItem>): Promise<ProjectItem | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryProjectRepository implements ProjectRepositoryInterface {
  private projects: Map<string, ProjectItem> = new Map();

  constructor() {
    this.seedInitialProjects();
  }

  private seedInitialProjects() {
    // Initial sample projects so user sees realistic recent work in Design Studio immediately
    const sampleRoom: ProjectItem = {
      id: 'proj-sample-1',
      title: 'Scandi Minimalist Sunlit Living Room',
      type: 'room',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      generatedImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      analysis: {
        roomType: 'Living Room',
        furniture: [
          { item: 'Low-profile Sectional', material: 'Linen blend', condition: 'Fair', style: 'Transitional' },
          { item: 'Coffee Table', material: 'Veneer wood', condition: 'Good', style: 'Standard' },
          { item: 'Floor Lamp', material: 'Brushed Brass', condition: 'Good', style: 'Contemporary' }
        ],
        wallColors: [
          { name: 'Warm Alabaster', hex: '#F3EFE6', role: 'Main wall surface' },
          { name: 'Oatmeal Taupe', hex: '#DDD2C3', role: 'Accent shadow' }
        ],
        flooringType: 'Natural Light Oak Herringbone',
        lightingCondition: 'Expansive double-glazed natural daylight',
        existingStyle: 'Transitional Modern',
        approximateLayout: 'Open living-dining corridor with focal media wall',
        emptySpace: 'Untapped alcove near east window ideal for reading nook',
        suggestedImprovements: [
          'Replace bulky dark sectional with modular bouclé seating',
          'Introduce fluted wood wall panelling behind media zone',
          'Elevate acoustic softness with high-pile Moroccan wool rug'
        ]
      },
      preferences: {
        room: 'Living Room',
        style: 'Scandinavian',
        colorMood: 'Warm',
        customColor: '#E8D8C4',
        lighting: 'Natural',
        furniture: 'Replace',
        budget: 'Premium',
        userInstructions: 'Keep open sightlines to windows, warm textured materials, organic curves.'
      },
      variations: [
        {
          id: 'var-1',
          label: 'Japandi Serenity',
          style: 'Japandi',
          image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
          changes: ['Bonsai greenery', 'Low slung tatami-inspired wood bench', 'Wabi-sabi ceramic vases']
        },
        {
          id: 'var-2',
          label: 'Modern Minimalist',
          style: 'Minimalist',
          image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
          changes: ['Concealed storage cabinetry', 'Travertine monolithic stone table', 'Linear recessed lighting']
        }
      ],
      refinementHistory: [
        {
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          prompt: 'Add sculptural plants and switch to warm brushed limestone accessories',
          image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
        }
      ],
      designInsights: {
        changesMade: [
          'Installed wide-plank white oak flooring in Chevron layout',
          'Replaced boxy sofa with organic curvilinear bouclé seating',
          'Integrated fluted acoustic oak slatted wall panelling',
          'Upgraded central fixture to a hand-blown Noguchi paper sphere',
          'Added oversized olive tree in artisanal terracotta pot'
        ],
        colorPalette: [
          { name: 'Warm Chalk', hex: '#F7F4EC', role: 'Primary Wall' },
          { name: 'Smoked Oak', hex: '#634F3C', role: 'Architectural Joinery' },
          { name: 'Desert Dune', hex: '#D7C4B2', role: 'Bouclé Upholstery' },
          { name: 'Brushed Brass', hex: '#C5A872', role: 'Metal Hardware' },
          { name: 'Olive Grove', hex: '#586249', role: 'Biophilic Accent' }
        ],
        recommendedFurniture: [
          { item: 'Curved 3-Piece Bouclé Sofa', style: 'Scandinavian Minimalist', placement: 'Facing south window', reason: 'Fosters fluid circulation without hard corners' },
          { item: 'Travertine Low Plinth Table', style: 'Japandi Sculptural', placement: 'Room center', reason: 'Anchors room with tactile organic stone texture' },
          { item: 'Akari 26A Pendant Lamp', style: 'Modern Craft', placement: 'Overhead center', reason: 'Diffuses soft ambient warm glow without glare' },
          { item: 'Solid Oak Credenza with Tambour Doors', style: 'Nordic Contemporary', placement: 'East perimeter wall', reason: 'Hides electronics while celebrating natural wood grain' }
        ],
        designSummary: 'A serene transformation prioritizing tactile natural materials, warm ambient lighting, and fluid spatial balance.'
      }
    };

    const sampleWorkspace: ProjectItem = {
      id: 'proj-sample-2',
      title: 'Warm Minimalist Home Office & Workspace',
      type: 'room',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      originalImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      generatedImage: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      analysis: {
        roomType: 'Workspace / Home Office',
        confidence: 0.95,
        evidence: [
          'Solid oak work desk placed adjacent to natural window daylight',
          'Ergonomic mesh task chair with supportive lumbar adjustment',
          'Dual monitor display setup and integrated cable management',
          'Vertical wall-mounted open shelving for design books and document archives'
        ],
        detectedObjects: ['desk', 'office chair', 'monitor', 'shelving unit', 'table lamp'],
        furniture: [
          { item: 'Executive Workstation', material: 'FSC Solid White Oak & Black Steel', condition: 'Pristine', style: 'Minimalist' },
          { item: 'Ergonomic Task Chair', material: 'Breathable Dark Grey Wool Blend', condition: 'New', style: 'Modern' },
          { item: 'Modular Bookcase Wall', material: 'Natural Birch Veneer', condition: 'Installed', style: 'Scandinavian' }
        ],
        wallColors: [
          { name: 'Warm Cream White', hex: '#FAF7F2', role: 'Main Walls' },
          { name: 'Muted Clay Taupe', hex: '#D8CEC2', role: 'Accent Wall' }
        ],
        flooringType: 'Natural Matte Engineered Oak Planks',
        lightingCondition: 'East-facing window daylight diffused by linen sheers, supplemented by 2700K task lighting',
        existingStyle: 'Minimalist Contemporary',
        approximateLayout: 'Ergonomic dedicated home office layout with clear circulation to the doorway',
        emptySpace: 'Balanced negative space behind workstation ensuring comfortable movement',
        suggestedImprovements: ['Install warm anti-glare task light', 'Introduce air-purifying indoor greenery']
      },
      preferences: {
        room: 'Workspace / Home Office',
        style: 'Japandi',
        colorMood: 'Warm',
        lighting: 'Warm',
        furniturePreference: 'Keep existing layout',
        budget: 'Premium'
      },
      variations: [],
      refinementHistory: [],
      designInsights: {
        changesMade: [
          'Preserved desk orientation and natural window light while introducing a Japandi fluted wood accent screen',
          'Upgraded desktop accessories to organic ceramic storage cups and matte brass desk lamp',
          'Replaced commercial metal shelving with warm floating white-oak shelves adorned with bonsai ceramics'
        ],
        colorPalette: [
          { name: 'Alabaster Stone', hex: '#F5F2EB', role: 'Main Wall Surface' },
          { name: 'Warm Hinoki Wood', hex: '#D4B895', role: 'Desk & Joinery' },
          { name: 'Charcoal Cast Iron', hex: '#2A2927', role: 'Hardware & Accents' },
          { name: 'Matcha Moss', hex: '#7D8A74', role: 'Botanical Accent' }
        ],
        recommendedFurniture: [
          { item: 'Custom Oak Floating Shelves', style: 'Japandi', placement: 'Mounted over workstation', reason: 'Adds vertical display without cluttering the floor perimeter', estimatedPrice: '$380' },
          { item: 'Fluted Ceramic Table Lamp', style: 'Wabi-Sabi', placement: 'Desk corner', reason: 'Provides soft evening task illumination at 2700K', estimatedPrice: '$165' }
        ],
        designSummary: 'A tranquil home office balancing rigorous functional workstation ergonomics with organic Japandi textures.'
      }
    };

    this.projects.set(sampleRoom.id, sampleRoom);
    this.projects.set(sampleWorkspace.id, sampleWorkspace);
  }

  async getAll(): Promise<ProjectItem[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getById(id: string): Promise<ProjectItem | null> {
    return this.projects.get(id) || null;
  }

  async create(projectData: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<ProjectItem> {
    const id = projectData.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newProject: ProjectItem = {
      ...projectData,
      id,
      createdAt: now,
      updatedAt: now,
      variations: projectData.variations || [],
      refinementHistory: projectData.refinementHistory || [],
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async update(id: string, updates: Partial<ProjectItem>): Promise<ProjectItem | null> {
    const existing = this.projects.get(id);
    if (!existing) return null;
    const updated: ProjectItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.projects.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}

// Export singleton instance of repository
export const projectRepository = new InMemoryProjectRepository();
