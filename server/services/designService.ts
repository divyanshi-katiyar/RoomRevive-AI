import { geminiService, RoomAnalysisResult } from './geminiService.js';
import { imageGenerationService } from './imageGenerationService.js';
import { projectRepository, ProjectItem } from '../repositories/projectRepository.js';

export interface GenerateDesignInput {
  originalImage: string;
  roomAnalysis?: RoomAnalysisResult;
  room?: string;
  style: string;
  colorTone?: string;
  colorMood: string;
  customColor?: string;
  lighting: string;
  furniturePreference: string;
  budget: string;
  userInstructions?: string;
  saveToStudio?: boolean;
}

/**
 * Detailed style characteristic specifications matching the required style definitions:
 * - MUST USE: Dominant visual cues, materials, colors, silhouettes
 * - MUST AVOID: Elements that ruin or dilute the style
 */
export function getStyleCharacteristics(style: string): { use: string; avoid: string } {
  const norm = (style || '').toUpperCase().trim();

  if (norm.includes('SCANDINAVIAN')) {
    return {
      use: `The result MUST visibly and unmistakably look Scandinavian:
- Bright, airy, and light-filled atmosphere with soft natural daylight
- White, cream, and very light grey base wall and surface colors
- Light natural oak, birch, or ash wood with visible natural grain
- Simple clean-lined, functional Nordic furniture silhouettes
- Soft textiles (light wool, washed linen, subtle knitted throws)
- Cozy but minimal decor (hygge accents, curated ceramics)
- Natural materials and subtle indoor green plants
- Warm but light neutral palette with an uncluttered, serene arrangement`,
      avoid: `dark charcoal or black walls, predominantly black furniture, heavy dramatic interiors, excessive ornamentation, ornate traditional furniture, industrial metal-heavy appearance, excessive luxury gold styling, overly dark or moody lighting`
    };
  }

  if (norm.includes('JAPANDI')) {
    return {
      use: `The result MUST visibly look Japandi (Japanese minimalism meets Scandinavian warmth):
- Natural light timber (white oak, hinoki, pale ash)
- Warm neutral palette of beige, cream, oatmeal, and earthy neutrals
- Low-profile, clean-lined, unpretentious furniture
- Organic materials (linen, paper lanterns, tactile clay ceramics, light bamboo)
- Calm, uncluttered, balanced composition with negative space
- Subtle Japanese wabi-sabi craft and Scandinavian functionality
- Warm, gentle natural illumination`,
      avoid: `excessive decoration, flashy or saturated colors, ornate furniture, heavy industrial piping, shiny polished metals, cluttered surfaces`
    };
  }

  if (norm.includes('TRADITIONAL')) {
    return {
      use: `The result MUST visibly look Traditional:
- Rich natural wood (walnut, mahogany, warm cherry, dark oak)
- Classic furniture silhouettes with refined proportion
- Detailed architectural woodwork, crown moldings, and wainscoting
- Elegant tailored upholstery with classic traditional patterns or damask
- High-quality patterned or Oriental/Persian area rugs
- Symmetrical, balanced room composition
- Warm, sophisticated ambient lighting (brass fixtures, classic fabric shades)
- Classic decorative details (curated oil paintings in gilt frames, porcelain, brass hardware)`,
      avoid: `ultra-minimalist furniture, cold industrial styling, exposed concrete/ducts, overly futuristic furniture, plastic or acrylic finishes`
    };
  }

  if (norm.includes('BOHEMIAN') || norm.includes('BOHO')) {
    return {
      use: `The result MUST visibly look Bohemian:
- Richly layered textiles, textured cushions, and soft fringed throws
- Patterned vintage/tribal/Moroccan rugs layered over natural flooring
- Natural woven and rattan furniture (cane, wicker, rattan lounge chairs)
- Abundant lush indoor botanical plants (hanging pothos, fiddle leaf, monsteras)
- Macramé, woven wall tapestries, and artisanal handmade decor
- Eclectic, lived-in, curated furniture with artistic warmth
- Earthy warm colors (terracotta, ochre, warm sand, olive, rust)
- Layered, deeply cozy, inviting appearance`,
      avoid: `sterile minimalist appearance, cold monochromatic corporate interiors, rigid strict symmetry, high-tech industrial coldness`
    };
  }

  if (norm.includes('INDUSTRIAL')) {
    return {
      use: `The result MUST visibly look Industrial:
- Dark metal frameworks (blackened steel, cast iron, gunmetal)
- Warm raw wood and metal combination (reclaimed timber tabletops, iron legs)
- Architectural concrete or distressed brick wall textures where appropriate
- Black, charcoal, slate, and weathered bronze accents
- Factory-inspired industrial lighting (Edison pendants, articulated metal lamps)
- Raw, authentic, tactile materials (distressed leather, riveted iron, wire glass)
- Utilitarian, practical, robust furniture silhouettes`,
      avoid: `ornate traditional furniture, overly soft pastel colors, delicate feminine decor, glossy synthetic finishes, floral patterns`
    };
  }

  if (norm.includes('MINIMALIST') || norm.includes('MINIMAL')) {
    return {
      use: `The result MUST visibly look Minimalist:
- Very clean lines and pure geometric forms
- Strictly limited, purposeful furniture
- Cohesive neutral palette (soft off-white, light grey, warm alabaster)
- Completely uncluttered, clean flat surfaces
- Simple, honest, functional furniture with concealed storage
- Restrained, intentional decoration (single sculptural branch or vessel)
- Large, generous areas of visual negative space and calm circulation`,
      avoid: `excessive furniture, busy intricate patterns, visual clutter, decorative tchotchkes, heavy multiple accessories`
    };
  }

  if (norm.includes('MODERN')) {
    return {
      use: `The result MUST visibly look Modern:
- Contemporary furniture with clean, crisp geometry
- Sophisticated neutral color palette (crisp whites, slate, warm greys, rich black accents)
- Sleek architectural modern lighting (recessed linear lights, architectural pendants)
- Polished, refined materials (honed stone, smoked glass, matte powder-coated metals)
- Uncluttered, orderly, functional spatial arrangement`,
      avoid: `heavy traditional carvings, cluttered eclectic knick-knacks, busy rustic distressing, overly ornate frames`
    };
  }

  if (norm.includes('CONTEMPORARY')) {
    return {
      use: `The result MUST visibly look Contemporary:
- Current, state-of-the-art furniture designs with soft curves and rounded edges
- Balanced, warm neutral color tones with sophisticated subtle contrasts
- Sophisticated tactile materials (bouclé upholstery, fluted travertine, brushed brass)
- Clean, deeply comfortable, inviting furniture silhouettes
- Modern curated art and sculptural decorative lighting elements`,
      avoid: `dated antique pieces, harsh excessive industrial roughness, cluttered traditional styling`
    };
  }

  if (norm.includes('LUXURY')) {
    return {
      use: `The result MUST visibly look Luxury (refined upscale luxury, NOT gaudy):
- Premium architectural materials (honed Calacatta or Fior di Bosco marble, quarter-sawn oak)
- Sophisticated custom furniture with bespoke tailoring
- Refined textures (rich velvet, cashmere, bouclé, top-grain leather)
- Elegant, layered architectural illumination (cove lighting, dimmable designer fixtures)
- Tasteful, subtle metallic accents (brushed champagne bronze, satin brass)
- High-quality, flawless finishes and upscale, realistic elegance`,
      avoid: `gaudy excessive gold leaf, tacky overdone polished marble everywhere, excessive glittery chandeliers, cheap bling, overdone ornamentation`
    };
  }

  if (norm.includes('RUSTIC')) {
    return {
      use: `The result MUST visibly look Rustic:
- Heavy reclaimed timber and hand-hewn wooden beams/furniture
- Natural rough stone elements and lime wash finishes
- Textured, organic linens and thick wools
- Rugged, earthy warmth and honest artisanal craftsmanship
- Warm earthy color palette (warm cedar, forest moss, river stone, bark brown)`,
      avoid: `high-gloss plastic, ultra-futuristic cold chrome, clinical stark minimalism, glossy synthetic surfaces`
    };
  }

  if (norm.includes('MID-CENTURY') || norm.includes('MID CENTURY')) {
    return {
      use: `The result MUST visibly look Mid-Century Modern:
- Warm teak, walnut, and rosewood timbers with satin luster
- Iconic tapered splayed legs and organic, aerodynamic silhouettes
- Retro-modern lighting fixtures (sputnik pendants, tripod lamps, globe sconces)
- Graphic textiles and curated color pops of mustard, olive green, ochre, or burnt orange
- Clean mid-century furniture forms celebrating functional optimism`,
      avoid: `ornate Victorian carvings, heavy dark industrial piping, cold sterile white cubism, frilly country decor`
    };
  }

  return {
    use: `The result MUST visibly look ${style}:
- Bespoke ${style} furniture silhouettes and authentic ${style} materials
- Distinctive ${style} textures, lighting fixtures, and surface finishes
- Clear, dominant aesthetic reflecting the unique design vocabulary of ${style}`,
    avoid: `generic transitional filler furniture, clashing aesthetic elements from unrelated styles, visual clutter`
  };
}

/**
 * Functional specifications combining room type with style
 */
export function getRoomFunctionSpecification(roomType: string, style: string): string {
  const norm = (roomType || '').toLowerCase();
  const upperStyle = (style || '').toUpperCase();

  if (norm.includes('work') || norm.includes('office') || norm.includes('study')) {
    return `ROOM FUNCTION: WORKSPACE / HOME OFFICE (HARD CONSTRAINT)
The room MUST function as a dedicated WORKSPACE / HOME OFFICE.
Essential functional items required:
- Work desk styled in ${style} (generous work surface, ergonomic height, cable management)
- Ergonomic task chair / office chair
- Computer / laptop workstation setup and monitor
- Dedicated desk task lighting (focused directional illumination)
- Workspace storage (shelving, credenza, or drawers)
Do NOT turn this into a living room, dining room, or bedroom.`;
  }

  if (norm.includes('bed')) {
    return `ROOM FUNCTION: BEDROOM (HARD CONSTRAINT)
The room MUST function as a dedicated BEDROOM.
Essential functional items required:
- Bed as the central focal anchor with ${style} headboard and quality dressed linens
- Flanking bedside tables / nightstands
- Soft, glare-free ambient bedroom lighting
- Bedroom storage or wardrobe
Do NOT replace the bed with a sofa or dining table.`;
  }

  if (norm.includes('kitchen')) {
    return `ROOM FUNCTION: KITCHEN (HARD CONSTRAINT)
The room MUST function as a dedicated KITCHEN.
Essential functional items required:
- Custom cabinetry and worktop counters styled in ${style}
- Kitchen sink, cooktop, and appliances
- Functional under-cabinet task illumination and island seating where space allows`;
  }

  if (norm.includes('living')) {
    return `ROOM FUNCTION: LIVING ROOM (HARD CONSTRAINT)
The room MUST function as a dedicated LIVING ROOM.
Essential functional items required:
- Primary sofa, sectional, or conversational seating arrangement styled in ${style}
- Coffee table and accent side tables
- Accent lounge armchairs
- Living room media console / focal wall
- Cohesive area rug and warm ambient living-room illumination`;
  }

  if (norm.includes('dining')) {
    return `ROOM FUNCTION: DINING ROOM (HARD CONSTRAINT)
The room MUST function as a dedicated DINING ROOM.
Essential functional items required:
- Central dining table styled in ${style}
- Dining chairs (set of 4 to 8 chairs)
- Overhead statement dining chandelier / pendant
- Sideboard or console for dining ware`;
  }

  if (norm.includes('bath')) {
    return `ROOM FUNCTION: BATHROOM (HARD CONSTRAINT)
The room MUST function as a dedicated BATHROOM.
Essential functional items required:
- Bathroom vanity with integrated sink and mirror
- Moisture-resistant wall/tile finishes in ${style}
- Shower or bath enclosure and appropriate vanity illumination`;
  }

  return `ROOM FUNCTION: ${roomType} (HARD CONSTRAINT)
The room MUST function as a ${roomType}. Fulfill all functional furniture requirements of a ${roomType} while applying ${style} styling.`;
}

/**
 * Constructs the rigorous redesign prompt adhering to the required structure:
 * - Direct command: "Create a [Style] [Room Type] with a [Color Tone] tone."
 * - Separates ROOM FUNCTION (what it is) from STYLE (how it looks)
 * - Embeds explicit MUST USE and MUST AVOID design rules
 * - Preserves physical room architecture and camera perspective
 */
export function buildRoomRedesignPrompt(params: {
  roomType: string;
  style: string;
  colorMood: string;
  customColor?: string;
  lighting: string;
  furniturePreference: string;
  budget: string;
  userInstructions?: string;
  roomAnalysis?: any;
}): string {
  const styleSpec = getStyleCharacteristics(params.style);
  const roomFunctionSpec = getRoomFunctionSpecification(params.roomType, params.style);
  const colorSpec = params.customColor
    ? `${params.colorMood} tone with ${params.customColor} accent`
    : `${params.colorMood} tone`;

  const cameraDesc =
    params.roomAnalysis?.cameraPerspective ||
    'Eye-level wide perspective looking into the room, preserving the identical camera viewpoint, angle, and field of view as the uploaded photo.';

  const windowsDoors =
    params.roomAnalysis?.windowsAndDoorsDetail ||
    (params.roomAnalysis?.windows
      ? `Windows count: ${params.roomAnalysis.windows}, Doors count: ${params.roomAnalysis.doors || 1}`
      : 'Existing window and door locations');

  const layoutNotes = params.roomAnalysis?.approximateLayout || 'Existing room circulation and furniture arrangement';
  const walkingPaths = params.roomAnalysis?.walkingPaths || 'Existing walking paths and open floor circulation';
  const flooring = params.roomAnalysis?.flooringType || 'Hardwood';
  const ambientLight = params.roomAnalysis?.lightingCondition || 'Natural daylight';

  // Construct itemized spatial furniture preservation mapping
  let furniturePreservationMapping = '';
  if (Array.isArray(params.roomAnalysis?.furnitureArrangement) && params.roomAnalysis.furnitureArrangement.length > 0) {
    furniturePreservationMapping = params.roomAnalysis.furnitureArrangement
      .map((f: any, idx: number) => {
        const item = f.item || `Major furniture piece #${idx + 1}`;
        const loc = f.location || 'current position';
        const orient = f.orientation ? `, oriented ${f.orientation}` : '';
        const rel = f.relativeToWallsOrWindows ? ` (${f.relativeToWallsOrWindows})` : '';
        return `  - ${item}: REMAINS IN EXACT LOCATION at ${loc}${orient}${rel}. Do NOT move or remove. Restyle ONLY its surface materials, upholstery, and visual appearance to ${params.style} style.`;
      })
      .join('\n');
  } else if (Array.isArray(params.roomAnalysis?.furniture) && params.roomAnalysis.furniture.length > 0) {
    furniturePreservationMapping = params.roomAnalysis.furniture
      .map((f: any, idx: number) => {
        const item = f.item || `Major furniture piece #${idx + 1}`;
        return `  - ${item}: REMAINS IN EXACT LOCATION and orientation. Do NOT move, rotate, or remove. Restyle ONLY its surface materials, finishes, and colors to ${params.style} style.`;
      })
      .join('\n');
  } else {
    furniturePreservationMapping = `  - Every existing major furniture item must remain in its exact current location and orientation. Restyle ONLY appearance to ${params.style} aesthetic.`;
  }

  const visibleBoundaries =
    params.roomAnalysis?.visibleSpatialBoundaries ||
    'Strictly the visible room volume and walls shown in the original photograph; zero additional floor area or adjacent spaces';

  return `IMAGE-TO-IMAGE EDIT: Redesign the existing room shown in this photograph into ${params.style} style with a ${colorSpec}.

The uploaded original image is the PRIMARY VISUAL SOURCE and structural canvas.
We are NOT asking to create a new room inspired by the original.
We are EDITING AND REDESIGNING THIS EXACT ROOM.

The result must look like:
"THE SAME PHOTOGRAPHED ROOM AFTER AN INTERIOR DESIGNER REDESIGNED IT."
It must NOT look like:
"A NEW ROOM CREATED FROM THE DESCRIPTION."

The original image composition MUST dominate the generation.
If there is a conflict between style instructions and the original room geometry/layout, ALWAYS prioritize the original geometry and layout.

================================================================================
PRESERVATION PRIORITY (STRICTLY ENFORCED)
================================================================================
1. Original image composition
2. Room geometry (exact walls, ceiling geometry, floor area)
3. Camera/viewpoint (exact camera viewpoint, height, viewing direction, perspective: ${cameraDesc})
4. Furniture positions and orientations (exact arrangement, relative distances between objects, walking space)
5. Doors/windows and architectural openings (${windowsDoors})
6. Room proportions and visible spatial boundaries (${visibleBoundaries})
7. Selected design style (${params.style})
8. Decorative additions

================================================================================
DO NOT (STRICT NEGATIVE CONSTRAINTS):
================================================================================
- Do NOT create a larger room
- Do NOT extend the room
- Do NOT add another room
- Do NOT change the camera angle or height
- Do NOT rotate the room or mirror the room
- Do NOT move furniture from its current position
- Do NOT rotate furniture
- Do NOT remove major furniture
- Do NOT add major furniture that wasn't already present
- Do NOT change the room proportions
- Do NOT invent architectural elements
- Do NOT reconstruct the room from scratch
- ONLY redesign the EXISTING visible space.

================================================================================
ALLOWED CHANGES (APPEARANCE OF EXISTING ROOM ONLY):
================================================================================
- Furniture colors, materials, upholstery, and finishes
- Bedding and headboard styling
- Curtains on existing windows
- Rug design placed beneath existing furniture
- Lighting fixtures updated at existing lighting locations
- Wall colors and wall finishes
- Small decorative additions (plants, cushions, throws, small accessories) ONLY if they fit naturally into existing available space.
The existing furniture must remain in the same locations and orientations.

================================================================================
STYLE TRANSFORMATION (${params.style}):
================================================================================
${styleSpec.use}

================================================================================
EXISTING FURNITURE SPATIAL MAPPING (REMAIN IN PLACE):
================================================================================
${furniturePreservationMapping}

================================================================================
ROOM FUNCTION SPECIFICATION (${params.roomType}):
================================================================================
${roomFunctionSpec}

COLOR & LIGHTING:
- Overall color atmosphere: ${colorSpec}
- Lighting: ${params.lighting} illumination with realistic ${params.style} fixtures
- Flooring: ${flooring}
- Ambient light condition: ${ambientLight}
${params.userInstructions ? `- Client custom request: ${params.userInstructions}` : ''}

PHOTOGRAPHY STANDARD:
Photorealistic interior photograph of THE SAME PHOTOGRAPHED ROOM after an interior designer redesigned it, preserving original composition and perspective, 8k resolution.`;
}

export class DesignService {
  async analyzeRoom(imageData: string): Promise<RoomAnalysisResult> {
    return await geminiService.analyzeRoomImage(imageData);
  }

  async generateDesign(input: GenerateDesignInput) {
    if (!input.originalImage) {
      throw new Error('Original room image is required for image-to-image generation.');
    }

    let analysis = input.roomAnalysis;
    if (!analysis) {
      analysis = await geminiService.analyzeRoomImage(input.originalImage);
    }

    const roomType =
      input.room ||
      (analysis.roomType && analysis.roomType !== 'Unknown/Ambiguous'
        ? analysis.roomType
        : 'Workspace');

    // 1. Analyze redesign plan with Gemini multimodal model (preserves deep room analysis & insights)
    const redesignPlan = await geminiService.planInteriorRedesign({
      roomAnalysis: analysis,
      selectedRoomType: roomType,
      style: input.style,
      colorMood: input.colorMood,
      customColor: input.customColor,
      lighting: input.lighting,
      furniturePreference: input.furniturePreference,
      budget: input.budget,
      userInstructions: input.userInstructions,
    });

    // 2. Build the precise architectural prompt for Pollinations Flux
    const roomRedesignPrompt = buildRoomRedesignPrompt({
      roomType,
      style: input.style,
      colorMood: input.colorMood,
      customColor: input.customColor,
      lighting: input.lighting,
      furniturePreference: input.furniturePreference,
      budget: input.budget,
      userInstructions: input.userInstructions,
      roomAnalysis: analysis,
    });

    // 3. Generate the actual room photograph using Pollinations Flux
    const providerName = imageGenerationService.getProviderName();
    console.log(
      `[DesignService] Generating photorealistic room photograph for ${roomType} in ${input.style} style using ${providerName}...`
    );

    const imageGenResult = await imageGenerationService.generateImage({
      sourceImage: input.originalImage,
      prompt: roomRedesignPrompt,
      negativePrompt:
        'expanded room, larger room, extra space, extended walls, extra floor area, wide angle distortion of room size, newly created space, adjacent room, opened up walls, knocked down walls, different perspective, rotated room, flipped room, altered dimensions, moved walls, moved windows, moved doors, rearranged furniture, moved furniture, rotated furniture, different room layout, alternate camera viewpoint, different camera angle, missing furniture, extra large furniture, wrong room type, blueprint, floorplan, color palette card, text diagram, wireframe, user interface, collage, split-screen, low quality, blurry, distorted furniture, floating furniture, warped walls',
      roomType,
      style: input.style,
      aspectRatio: '4:3',
      strength: 0.65,
      mode: 'redesign',
    });

    if (!imageGenResult.success || !imageGenResult.generatedImage) {
      console.log('[DesignService] Pollinations image generation failed:', imageGenResult.error);
      return {
        generationSuccess: false,
        success: false,
        error: imageGenResult.error || 'Pollinations Flux image generation failed.',
        imageGenerationMessage: imageGenResult.error || 'Pollinations Flux image generation failed.',
        imageUrl: null,
        generatedImage: null,
        isAiGeneratedImage: false,
        imageGenerationAvailable: false,
        project: null,
        projectId: undefined,
        generationPrompt: roomRedesignPrompt,
        analysis,
        designInsights: redesignPlan ? {
          changesMade: redesignPlan.changesMade || [],
          colorPalette: redesignPlan.colorPalette || [],
          recommendedFurniture: redesignPlan.recommendedFurniture || [],
          designSummary: redesignPlan.designSummary || '',
        } : undefined,
        variations: [],
      };
    }

    const generatedImage = imageGenResult.generatedImage;
    const isAiGeneratedImage = true;
    const imageGenerationMessage = 'Redesigned room generated successfully with Pollinations Flux!';

    // 4. Structure final design response with structured insights from Gemini analysis
    const designInsights = {
      changesMade: redesignPlan.changesMade || [
        `Refined ${roomType} surfaces with ${input.style} architectural finishes`,
        `Installed essential functional ${roomType} furniture tailored to room boundaries`,
        `Integrated layered ${input.lighting.toLowerCase()} illumination fixtures`,
        'Upgraded flooring boundaries with textured materials',
        'Preserved sightlines and natural window illumination',
      ],
      colorPalette: redesignPlan.colorPalette || [
        { name: 'Warm Whisper', hex: '#FAF7F2', role: 'Main Wall' },
        { name: 'Smoked Oak', hex: '#58493B', role: 'Cabinetry & Wood' },
        { name: 'Oatmeal Bouclé', hex: '#DED3C4', role: 'Textiles' },
        { name: 'Brushed Brass', hex: '#C2A36B', role: 'Hardware & Accent' },
        { name: 'Sage Stone', hex: '#879183', role: 'Natural Accent' },
      ],
      recommendedFurniture: redesignPlan.recommendedFurniture || [
        {
          item: `${input.style} ${roomType} Essential Piece`,
          style: input.style,
          placement: `Anchoring primary functional ${roomType} zone`,
          reason: `Fulfills the core utility of a functional ${roomType} while elevating aesthetics`,
          estimatedPrice: '$800 - $1,500',
        },
      ],
      designSummary:
        redesignPlan.designSummary ||
        `A harmonious ${input.style} ${roomType} redesign tailored for functional living, natural textures, and generous spatial flow.`,
    };

    const projectData = {
      title: `${input.style} ${roomType} Redesign`,
      type: 'room' as const,
      originalImage: input.originalImage,
      analysis,
      preferences: {
        room: roomType,
        style: input.style,
        colorMood: input.colorMood,
        customColor: input.customColor,
        lighting: input.lighting,
        furniturePreference: input.furniturePreference,
        budget: input.budget,
        userInstructions: input.userInstructions,
      },
      generatedImage,
      variations: [],
      refinementHistory: [],
      designInsights,
    };

    let project: ProjectItem | null = null;
    if (input.saveToStudio !== false) {
      project = await projectRepository.create(projectData);
    }

    return {
      generationSuccess: true,
      success: true,
      project,
      projectId: project?.id,
      generatedImage,
      imageUrl: generatedImage,
      isAiGeneratedImage,
      imageGenerationAvailable: isAiGeneratedImage,
      imageGenerationMessage,
      generationPrompt: roomRedesignPrompt,
      analysis,
      designInsights,
      variations: [],
    };
  }

  async refineDesign(params: {
    projectId?: string;
    currentImage: string;
    originalImage?: string;
    refinementPrompt: string;
    currentStyle?: string;
  }) {
    const sourceImage = params.currentImage || params.originalImage;
    if (!sourceImage) {
      throw new Error('Original or current room image is required for image-to-image refinement.');
    }

    let project: ProjectItem | null = null;
    if (params.projectId) {
      project = await projectRepository.getById(params.projectId);
    }

    const roomType = project?.preferences?.room || 'Living Room';
    const style = project?.preferences?.style || params.currentStyle || 'Modern';

    const refinePrompt = `IMAGE-TO-IMAGE EDIT: Apply this specific refinement to the room photograph:
"${params.refinementPrompt}"

MANDATORY SPATIAL & CONFIGURATION PRESERVATION:
- The uploaded image is the PRIMARY VISUAL SOURCE and structural canvas.
- Redesign ONLY the space that is visible in the original photograph.
- Keep the EXACT same room geometry, walls, windows, doors, and camera viewpoint.
- Do NOT expand the room, do NOT make it appear larger, and do NOT add extra floor area.
- Keep EVERY existing major furniture item in its exact current location and orientation.
- Do NOT move, rotate, replace, remove, or rearrange existing furniture.
- Preserve the room function as a ${roomType} and style as ${style}.
- Apply the requested refinement strictly to materials, finishes, upholstery, colors, or subtle decor accents.`;

    let newImage: string | null = null;
    const providerName = imageGenerationService.getProviderName();
    console.log(`[DesignService] Refining design using image-to-image with ${providerName}...`);

    const imageGenResult = await imageGenerationService.generateImage({
      sourceImage,
      prompt: refinePrompt,
      negativePrompt:
        'expanded room, larger room, extra floor area, extended walls, opened up walls, different perspective, rotated room, flipped room, rearranged furniture, moved furniture, rotated furniture, different room layout, alternate camera angle, missing furniture, wrong room type, blurry, distorted, low quality, artifacts',
      roomType,
      style,
      aspectRatio: '4:3',
      mode: 'redesign',
    });

    if (imageGenResult.success && imageGenResult.generatedImage) {
      newImage = imageGenResult.generatedImage;
    } else {
      console.log('[DesignService] Refinement notice:', imageGenResult.error);
    }

    const historyEntry = {
      timestamp: new Date().toISOString(),
      prompt: params.refinementPrompt,
      image: newImage || sourceImage,
    };

    if (project) {
      const history = [...(project.refinementHistory || []), historyEntry];
      const updatedInsights = project.designInsights ? { ...project.designInsights } : undefined;
      if (updatedInsights && updatedInsights.changesMade) {
        updatedInsights.changesMade = [
          `Refinement: ${params.refinementPrompt}`,
          ...updatedInsights.changesMade.slice(0, 4),
        ];
      }

      await projectRepository.update(project.id, {
        refinementHistory: history,
        generatedImage: newImage || sourceImage,
        designInsights: updatedInsights,
      });
      project = await projectRepository.getById(project.id);
    }

    return {
      refinedImage: newImage || sourceImage,
      imageGenerationAvailable: imageGenResult.success,
      message: imageGenResult.success
        ? `Updated design with instruction: "${params.refinementPrompt}".`
        : (imageGenResult.error || 'Refinement preference logged. Image generation credit limit reached.'),
      project,
    };
  }
}

export const designService = new DesignService();
