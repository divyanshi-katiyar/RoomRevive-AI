import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in environment variables.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export interface RoomAlternativeType {
  type: string;
  confidence: number;
}

export interface RoomAnalysisResult {
  roomType: string;
  confidence: number;
  evidence: string[];
  detectedObjects: string[];
  alternativeTypes: RoomAlternativeType[];
  furniture: Array<{
    item: string;
    material: string;
    condition: string;
    style: string;
  }>;
  furnitureArrangement?: Array<{
    item: string;
    location: string;
    orientation?: string;
    relativeToWallsOrWindows?: string;
  }>;
  windowsAndDoorsDetail?: string;
  walkingPaths?: string;
  visibleSpatialBoundaries?: string;
  existingFurniture?: string[];
  walls?: string;
  wallColors: Array<{
    name: string;
    hex: string;
    role: string;
  }>;
  flooringType: string;
  flooring?: string;
  ceiling?: string;
  lightingCondition: string;
  lighting?: string;
  windows?: number | string;
  doors?: number | string;
  cameraPerspective?: string;
  roomDimensionsApproximation?: string;
  existingColorPalette?: string[];
  existingStyle: string;
  approximateLayout: string;
  emptySpace: string;
  emptyAreas?: string[];
  architecturalFeatures?: string[];
  suggestedImprovements: string[];
  isAmbiguous?: boolean;
  ambiguityReason?: string;
}

export interface DesignGenerationResult {
  generatedImage: string | null;
  isAiGeneratedImage: boolean;
  changesMade: string[];
  colorPalette: Array<{ name: string; hex: string; role: string }>;
  recommendedFurniture: Array<{
    item: string;
    style: string;
    placement: string;
    reason: string;
    estimatedPrice?: string;
  }>;
  designSummary: string;
}

export class GeminiService {
  private ai: GoogleGenAI;
  // Models in priority order: gemini-3.8-flash provides fast, robust vision & multimodal analysis
  private textModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  constructor() {
    this.ai = getGeminiClient();
  }

  private async resolveImageData(imageData: string): Promise<{ cleanData: string; mimeType: string }> {
    if (!imageData) {
      throw new Error('Image data is required.');
    }
    if (imageData.startsWith('data:')) {
      const matches = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        return { mimeType: matches[1], cleanData: matches[2] };
      }
    }
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      try {
        console.log(`[GeminiService] Fetching remote image URL for analysis: ${imageData.slice(0, 80)}...`);
        const response = await fetch(imageData);
        if (!response.ok) {
          throw new Error(`Failed to fetch image from URL: ${imageData} (${response.status})`);
        }
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const mimeType = contentType.split(';')[0].trim();
        const arrayBuffer = await response.arrayBuffer();
        const cleanData = Buffer.from(arrayBuffer).toString('base64');
        return { mimeType, cleanData };
      } catch (err: any) {
        console.error('[GeminiService] Error resolving image URL to base64:', err.message || err);
        throw new Error(`Unable to fetch and process image URL: ${err.message || err}`);
      }
    }
    return { mimeType: 'image/jpeg', cleanData: imageData };
  }

  /**
   * Helper to safely extract and parse JSON from Gemini text response
   */
  private parseSafeJson<T>(rawText: string, fallback: T): T {
    if (!rawText) return fallback;
    try {
      // 1. Try direct parse
      return JSON.parse(rawText.trim());
    } catch {
      // 2. Try removing markdown code blocks
      const clean = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      try {
        return JSON.parse(clean);
      } catch {
        // 3. Try regex extraction of JSON object {...}
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch {
            // continue to fallback
          }
        }
      }
    }
    return fallback;
  }

  /**
   * Resilient execute with model fallback and automatic retry for 503/429 demand spikes
   */
  private async executeWithFallback<T>(
    operationName: string,
    buildParams: (model: string) => any,
    parseResponse: (text: string) => T,
    fallbackValue: T
  ): Promise<T> {
    for (const model of this.textModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const params = buildParams(model);
          const response = await this.ai.models.generateContent({
            model,
            ...params,
          });

          const text = response.text || '';
          if (text) {
            return parseResponse(text);
          }
        } catch (error: any) {
          const errorMsg = error?.message || String(error);
          const is503 = errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE');
          const is429 = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('resource_exhausted') || errorMsg.includes('quota');

          if (is429) {
            console.warn(`[GeminiService] ${operationName} quota exhausted on ${model}. Immediately switching to alternative model.`);
            break;
          }

          if (is503 && attempt === 0) {
            await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
            continue;
          }

          console.log(`[GeminiService] ${operationName} with model ${model} temporarily unavailable. Seamlessly cascading to next candidate.`);
          break;
        }
      }
    }

    console.warn(`[GeminiService] All candidate models busy for ${operationName}, applying curated architectural data.`);
    return fallbackValue;
  }

  /**
   * Analyze uploaded room photograph with function-based detection
   */
  async analyzeRoomImage(imageData: string): Promise<RoomAnalysisResult> {
    const { cleanData, mimeType } = await this.resolveImageData(imageData);

    const prompt = `You are an expert architectural spatial analyst and functional room classification engine.
Carefully examine the entire room photograph and determine the room's PRIMARY FUNCTION based on visible evidence, furniture arrangements, spatial layout, appliances, fixtures, and overall room purpose.

================================================================================
SUPPORTED ROOM TYPES
================================================================================
Classify the room as one of these supported room types:
- Living Room
- Bedroom
- Kitchen
- Bathroom
- Workspace
- Dining Room

================================================================================
CRITICAL MANDATE: PRIORITIZE PRIMARY ROOM FUNCTION OVER INDIVIDUAL OBJECTS
================================================================================
Analyze the ENTIRE image before deciding. Focus on what the space is ACTUALLY USED FOR.

1. LIVING ROOM:
Strong indicators:
- sofa, sectional sofa, loveseat, couch, settee
- coffee table
- TV / media console / entertainment unit
- lounge chairs / accent armchairs
- living-room seating arrangement
- decorative living-room furniture, area rugs, and floor lamps

CRITICAL RULE FOR LIVING ROOM:
If a clearly visible sofa/sectional and living-room seating arrangement are present, classify the room as "Living Room" unless there is overwhelming architectural evidence that it is another room.
Do NOT classify a room as Kitchen merely because:
- it has cabinets
- there is a countertop
- there is a small dining area
- there are appliances visible in the background
- the room has an open-plan layout

2. BEDROOM:
Strong indicators:
- bed, headboard, mattress, sleeping furniture
- bedside tables / nightstands
- bedroom wardrobe
- pillows / bedding / duvet
- bedroom-specific layout
CRITICAL RULE: If a bed is clearly present, classify as "Bedroom" unless the image is genuinely insufficient.

3. KITCHEN:
Strong indicators:
- kitchen cabinets
- countertop / worktop
- kitchen sink
- stove / cooktop / oven
- refrigerator
- kitchen island
- clearly recognizable kitchen work triangle
CRITICAL RULE: Do NOT classify a living room as Kitchen simply because cabinets or counters are visible in an open-plan room.

4. WORKSPACE:
Strong indicators:
- work desk / study desk / computer desk
- computer / monitor setup, keyboard
- office chair / task chair
- workstation
- dedicated study / work arrangement
CRITICAL RULE: If the dominant functional arrangement is a workspace, classify as "Workspace" even if a sofa or decorative furniture is present.

5. DINING ROOM:
Strong indicators:
- dining table
- multiple dining chairs (set of 4 to 8 chairs)
- dining-focused layout
- dining lighting / central chandelier arrangement

6. BATHROOM:
Strong indicators:
- toilet, shower, bathtub, bathroom vanity, sink specifically arranged as a bathroom fixture.

================================================================================
DO NOT RETURN "AMBIGUOUS" TOO EASILY
================================================================================
- Do NOT use "Ambiguous" simply because multiple types of furniture exist.
- Choose the most likely PRIMARY ROOM FUNCTION.
- Only classify as uncertain ("Unknown/Ambiguous") when:
  - the image is severely unclear,
  - the room is heavily obstructed,
  - or there is genuinely insufficient visual information.
- When enough evidence exists, ALWAYS choose the best-supported room type.

================================================================================
REQUIRED JSON RESPONSE STRUCTURE
================================================================================
Return ONLY valid JSON in this exact structure:
{
  "roomType": "Living Room",
  "confidence": 0.94,
  "evidence": [
    "Sofa and coffee table centered in room forming primary living seating area",
    "TV media console and lounge chairs present",
    "Open-concept layout: background cabinets do not alter the living room function"
  ],
  "detectedObjects": [
    "sofa",
    "coffee table",
    "armchair",
    "media console",
    "area rug",
    "floor lamp"
  ],
  "alternativeTypes": [],
  "furniture": [
    { "item": "Sectional Sofa", "material": "Fabric", "condition": "Good", "style": "Contemporary" },
    { "item": "Coffee Table", "material": "Wood", "condition": "Good", "style": "Modern" }
  ],
  "furnitureArrangement": [
    { "item": "Sectional Sofa", "location": "Center of room facing media wall", "orientation": "Facing front right", "relativeToWallsOrWindows": "Anchoring central seating zone away from perimeter walls" },
    { "item": "Coffee Table", "location": "Directly in front of sofa", "orientation": "Parallel to sofa length", "relativeToWallsOrWindows": "Resting on central area rug" }
  ],
  "cameraPerspective": "Eye-level wide shot from entryway looking towards the main seating area and rear windows",
  "windowsAndDoorsDetail": "Large picture windows along the right wall; entryway door frame in left foreground",
  "walkingPaths": "Direct clear passage from entryway along left perimeter to back windows, passing around central seating group",
  "visibleSpatialBoundaries": "Exact visible room volume: bounded strictly by left perimeter wall, rear wall with windows, right perimeter wall, ceiling, and foreground floor; no adjacent rooms or invented space",
  "wallColors": [
    { "name": "Soft Warm White", "hex": "#F4EFE6", "role": "Primary wall finish" }
  ],
  "flooringType": "Light Oak Hardwood",
  "lightingCondition": "Direct daylight with warm ambient fixtures",
  "existingStyle": "Contemporary Living Space",
  "approximateLayout": "Central conversational living arrangement with open circulation",
  "emptySpace": "Clear circulation space around seating group",
  "suggestedImprovements": [
    "Introduce warm layered 2700K lighting",
    "Upgrade textiles and accessories"
  ]
}

Do not return markdown.
Do not return explanatory text outside the JSON.`;

    const fallback: RoomAnalysisResult = {
      roomType: 'Unknown/Ambiguous',
      confidence: 0,
      evidence: ['Vision analysis currently unavailable; please select your desired room function manually.'],
      detectedObjects: [],
      alternativeTypes: [
        { type: 'Workspace', confidence: 0 },
        { type: 'Living Room', confidence: 0 },
        { type: 'Bedroom', confidence: 0 },
      ],
      furniture: [],
      wallColors: [
        { name: 'Neutral White', hex: '#F5F5F5', role: 'Main Walls' },
      ],
      flooringType: 'Natural Flooring',
      lightingCondition: 'Ambient lighting',
      existingStyle: 'Contemporary',
      approximateLayout: 'Standard room layout',
      emptySpace: 'Circulation space available',
      suggestedImprovements: ['Review room function selection and styling preferences'],
    };

    const sanitizeResult = (parsed: any): RoomAnalysisResult => {
      if (!parsed || typeof parsed !== 'object') {
        return fallback;
      }

      let parsedType = typeof parsed.roomType === 'string' && parsed.roomType.trim() ? parsed.roomType.trim() : '';
      let confidence = typeof parsed.confidence === 'number' && !isNaN(parsed.confidence) ? Math.max(0, Math.min(1, parsed.confidence)) : 0.88;
      const evidence = Array.isArray(parsed.evidence) ? parsed.evidence.map(String) : [];
      const detectedObjects = Array.isArray(parsed.detectedObjects) ? parsed.detectedObjects.map(String) : [];
      const alternativeTypes: Array<{ type: string; confidence: number }> = Array.isArray(parsed.alternativeTypes)
        ? parsed.alternativeTypes
            .filter((alt: any) => alt && typeof alt.type === 'string')
            .map((alt: any) => ({
              type: String(alt.type),
              confidence: typeof alt.confidence === 'number' ? Math.max(0, Math.min(1, alt.confidence)) : 0.3,
            }))
        : [];

      // Combine detected objects and evidence for rigorous keyword matching
      const allText = `${detectedObjects.join(' ')} ${evidence.join(' ')} ${parsedType}`.toLowerCase();

      // Precise signature detection using word boundaries (avoids substring issues like 'pot' in 'potted plant')
      const hasSofa = /\b(sofa|sectional|couch|loveseat|settee|lounge seating|chaise lounge)\b/i.test(allText);
      const hasBed = /\b(bed|mattress|headboard|bedding|nightstand)\b/i.test(allText) && !/\b(sofa bed|daybed|dog bed)\b/i.test(allText);
      const hasWorkspaceEquipment = /\b(work desk|study desk|computer desk|office chair|task chair|computer monitor|laptop table|workstation)\b/i.test(allText);
      const hasBathFixtures = /\b(toilet|shower|bathtub|bath vanity|bathroom vanity|bathroom sink)\b/i.test(allText);
      const hasDiningSetup = /\b(dining table|dining chairs|dining seating)\b/i.test(allText);
      const hasDedicatedKitchen = /\b(stove|cooktop|gas burner|oven|refrigerator|kitchen sink|range hood|kitchen island)\b/i.test(allText);

      let roomType = 'Living Room';
      let isAmbiguous = false;

      // 1. BATHROOM (unmistakable sanitary fixtures)
      if (hasBathFixtures) {
        roomType = 'Bathroom';
        confidence = Math.max(confidence, 0.95);
      }
      // 2. BEDROOM (bed as primary sleeping furniture)
      else if (hasBed && !hasSofa) {
        roomType = 'Bedroom';
        confidence = Math.max(confidence, 0.94);
        if (hasWorkspaceEquipment && !alternativeTypes.some((a) => a.type === 'Workspace')) {
          alternativeTypes.push({ type: 'Workspace', confidence: 0.7 });
        }
      }
      // 3. LIVING ROOM (sofa / sectional / couch present)
      // MANDATE: If a clearly visible sofa/sectional and living-room seating arrangement are present,
      // classify the room as LIVING ROOM.
      // Do NOT classify as Kitchen merely because cabinets, countertops, or background appliances exist in an open-plan layout.
      else if (hasSofa) {
        // If workspace equipment is also present, determine primary focal arrangement
        if (hasWorkspaceEquipment && parsedType.toLowerCase().includes('work')) {
          roomType = 'Workspace';
          confidence = Math.max(confidence, 0.86);
          if (!alternativeTypes.some((a) => a.type === 'Living Room')) {
            alternativeTypes.push({ type: 'Living Room', confidence: 0.75 });
          }
        } else {
          roomType = 'Living Room';
          confidence = Math.max(confidence, 0.92);
          if (hasWorkspaceEquipment && !alternativeTypes.some((a) => a.type === 'Workspace')) {
            alternativeTypes.push({ type: 'Workspace', confidence: 0.65 });
          }
          if (hasDedicatedKitchen && !alternativeTypes.some((a) => a.type === 'Kitchen')) {
            alternativeTypes.push({ type: 'Kitchen', confidence: 0.45 });
          }
        }
      }
      // 4. KITCHEN (only when NO sofa is present and cooking/food prep fixtures dominate)
      else if (hasDedicatedKitchen) {
        roomType = 'Kitchen';
        confidence = Math.max(confidence, 0.93);
      }
      // 5. WORKSPACE (dedicated desk, monitor, office chair setup)
      else if (hasWorkspaceEquipment) {
        roomType = 'Workspace';
        confidence = Math.max(confidence, 0.92);
      }
      // 6. DINING ROOM (dining table and chairs dominate without sofa)
      else if (hasDiningSetup) {
        roomType = 'Dining Room';
        confidence = Math.max(confidence, 0.90);
      }
      // 7. Fallback to model's parsed type if it matches one of our 6 canonical room types
      else if (parsedType) {
        const lower = parsedType.toLowerCase();
        if (lower.includes('living')) roomType = 'Living Room';
        else if (lower.includes('bed')) roomType = 'Bedroom';
        else if (lower.includes('work') || lower.includes('office') || lower.includes('study')) roomType = 'Workspace';
        else if (lower.includes('kitchen')) roomType = 'Kitchen';
        else if (lower.includes('dining')) roomType = 'Dining Room';
        else if (lower.includes('bath')) roomType = 'Bathroom';
        else roomType = 'Living Room';
      } else {
        roomType = 'Living Room';
      }

      // DO NOT return "Ambiguous" too easily. Only flag if image is severely unreadable (<0.35 confidence)
      if (confidence < 0.35) {
        roomType = 'Unknown/Ambiguous';
        isAmbiguous = true;
      }

      return {
        roomType,
        confidence,
        evidence,
        detectedObjects,
        alternativeTypes,
        furniture: Array.isArray(parsed.furniture) ? parsed.furniture : [],
        wallColors: Array.isArray(parsed.wallColors) && parsed.wallColors.length > 0 ? parsed.wallColors : [
          { name: 'Warm Whisper White', hex: '#F6F3EE', role: 'Main Walls' }
        ],
        flooringType: typeof parsed.flooringType === 'string' ? parsed.flooringType : 'Natural Light Oak Flooring',
        lightingCondition: typeof parsed.lightingCondition === 'string' ? parsed.lightingCondition : 'Natural ambient illumination',
        existingStyle: typeof parsed.existingStyle === 'string' ? parsed.existingStyle : 'Contemporary',
        approximateLayout: typeof parsed.approximateLayout === 'string' ? parsed.approximateLayout : 'Functional layout with defined zones',
        emptySpace: typeof parsed.emptySpace === 'string' ? parsed.emptySpace : 'Open circulation area',
        suggestedImprovements: Array.isArray(parsed.suggestedImprovements) ? parsed.suggestedImprovements : [],
        isAmbiguous,
        existingFurniture: parsed.existingFurniture,
        walls: parsed.walls,
        flooring: parsed.flooring,
        ceiling: parsed.ceiling,
        lighting: parsed.lighting,
        windows: parsed.windows,
        doors: parsed.doors,
        cameraPerspective: parsed.cameraPerspective,
        windowsAndDoorsDetail: typeof parsed.windowsAndDoorsDetail === 'string' ? parsed.windowsAndDoorsDetail : typeof parsed.windowsAndDoors === 'string' ? parsed.windowsAndDoors : undefined,
        walkingPaths: typeof parsed.walkingPaths === 'string' ? parsed.walkingPaths : undefined,
        visibleSpatialBoundaries: typeof parsed.visibleSpatialBoundaries === 'string' ? parsed.visibleSpatialBoundaries : undefined,
        furnitureArrangement: Array.isArray(parsed.furnitureArrangement) ? parsed.furnitureArrangement : [],
        roomDimensionsApproximation: parsed.roomDimensionsApproximation,
        existingColorPalette: parsed.existingColorPalette,
        emptyAreas: parsed.emptyAreas,
        architecturalFeatures: parsed.architecturalFeatures,
      };
    };

    return await this.executeWithFallback(
      'analyzeRoomImage',
      () => ({
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanData,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
      (text) => sanitizeResult(this.parseSafeJson(text, fallback)),
      fallback
    );
  }

  /**
   * Formulate deep interior design strategy + insights
   * HARD CONSTRAINT: Room Type determines Function. Style modifies Visual Appearance only.
   */
  async planInteriorRedesign(params: {
    roomAnalysis: RoomAnalysisResult;
    selectedRoomType: string;
    style: string;
    colorMood: string;
    customColor?: string;
    lighting: string;
    furniturePreference: string;
    budget: string;
    userInstructions?: string;
  }) {
    const targetRoom = params.selectedRoomType || params.roomAnalysis.roomType || 'Living Room';

    const prompt = `You are a world-renowned interior architect and interior styling master.

================================================================================
CRITICAL MANDATE — ROOM TYPE AND FUNCTION MUST BE PRESERVED AS A HARD CONSTRAINT
================================================================================
The selected room type is: "${targetRoom}".
The selected interior style is: "${params.style}".

The selected room type is a HARD CONSTRAINT that determines what the generated room must be used for.
You must NEVER treat the selected room type as a visual suggestion or change the room's function.
SEPARATE ROOM TYPE FROM DESIGN STYLE:
- ROOM TYPE = FUNCTION (Determines functional layout, essential furniture, and purpose).
- STYLE = VISUAL APPEARANCE (Determines materials, lines, silhouettes, and aesthetic).

For example:
- If "${targetRoom}" is Workspace or Office: The result MUST be a functional workspace with a work desk, ergonomic chair, computer/laptop setup, task lighting, and workspace storage. DO NOT turn it into a living room, dining room, or lounge!
- If "${targetRoom}" is Study: The result MUST be a dedicated study with study desk, comfortable study chair, bookshelves, and desk lighting.
- If "${targetRoom}" is Living Room: The result MUST be a living room with sofa, coffee table, and lounge seating.
- If "${targetRoom}" is Bedroom: The result MUST be a bedroom with a bed as the focal furniture. DO NOT replace the bed with a sofa.
- If "${targetRoom}" is Studio / Multi-Purpose: The result MUST be a coherent multi-functional studio with dedicated functional zoning for living, work/study, and sleeping/kitchenette spaces.
- If "${targetRoom}" is Dining Room: The result MUST be a dining room with dining table and dining chairs.
- If "${targetRoom}" is Kitchen: The result MUST be a kitchen with counters, cabinets, sink, and appliances.
- If "${targetRoom}" is Bathroom: The result MUST be a bathroom with vanity, sink, and mirror.

PRIORITY ORDER:
PRIORITY 1 — EXISTING ARCHITECTURE: Preserve walls, windows, doors, ceiling, flooring boundaries, and camera perspective.
PRIORITY 2 — ROOM FUNCTION: The selected room type "${targetRoom}" determines essential furniture.
PRIORITY 3 — USER FURNITURE INSTRUCTION: ${params.furniturePreference}.
PRIORITY 4 — DESIGN STYLE: Apply "${params.style}" styling to "${targetRoom}".
PRIORITY 5 — COLOR AND MOOD: Apply "${params.colorMood}" palette.
PRIORITY 6 — DECORATION: Add decor only after functional requirements are satisfied.

Original Room Analysis (Detected in image):
${JSON.stringify(params.roomAnalysis, null, 2)}

Client Desired Preferences:
- Selected Room Type (HARD CONSTRAINT): ${targetRoom}
- Target Style: ${params.style}
- Color Mood: ${params.colorMood} ${params.customColor ? `(Accent Hex: ${params.customColor})` : ''}
- Lighting Atmosphere: ${params.lighting}
- Furniture Approach: ${params.furniturePreference}
- Budget Tier: ${params.budget}
- Custom Instructions: ${params.userInstructions || 'None'}

Return a structured JSON object with the following schema:
{
  "internalInterpretation": {
    "selectedRoomType": "${targetRoom}",
    "detectedRoomType": "${params.roomAnalysis.roomType || 'Unknown'}",
    "primaryFunction": "Exact primary function of ${targetRoom}",
    "requiredFurniture": ["List of essential functional furniture for ${targetRoom}"],
    "forbiddenCrossRoomFurniture": ["List of furniture that must NOT be primary in ${targetRoom}"],
    "selectedStyle": "${params.style}",
    "colorMood": "${params.colorMood}",
    "lighting": "${params.lighting}",
    "furniturePreference": "${params.furniturePreference}",
    "preserveArchitecture": true,
    "preserveCameraPerspective": true
  },
  "functionalFurnitureValidation": {
    "question1_selectedRoomType": "${targetRoom}",
    "question2_essentialFurniture": "Key essential pieces required",
    "question3_essentialFurnitureIncluded": true,
    "question4_crossRoomFurnitureAvoided": true,
    "question5_functionallyRepresentsSelectedRoom": true
  },
  "designSummary": "An evocative 2-sentence description of the new ${targetRoom} redesign in ${params.style} style.",
  "imageGenerationPrompt": "A highly detailed, photorealistic architectural rendering prompt for an interior design visualizer depicting a functional ${targetRoom} designed in ${params.style} style, retaining the original room perspective and windows, with essential ${targetRoom} furniture, ${params.lighting} lighting, ${params.colorMood} color mood, high-end materials, photorealistic architectural photography, 8k resolution, Architectural Digest aesthetic.",
  "negativePrompt": "cross-room furniture, wrong room type, bed in office, dining table as primary desk, sofa-centric room when office requested",
  "changesMade": [
    "Specific change 1 (walls/surfaces)",
    "Specific change 2 (essential furniture for ${targetRoom})",
    "Specific change 3 (lighting fixtures)",
    "Specific change 4 (flooring & rug)",
    "Specific change 5 (functional storage & decor for ${targetRoom})"
  ],
  "colorPalette": [
    { "name": "Color Name", "hex": "#HEXCODE", "role": "Primary / Secondary / Accent / Wood / Metal" },
    { "name": "Color Name", "hex": "#HEXCODE", "role": "Primary / Secondary / Accent / Wood / Metal" },
    { "name": "Color Name", "hex": "#HEXCODE", "role": "Primary / Secondary / Accent / Wood / Metal" },
    { "name": "Color Name", "hex": "#HEXCODE", "role": "Primary / Secondary / Accent / Wood / Metal" },
    { "name": "Color Name", "hex": "#HEXCODE", "role": "Primary / Secondary / Accent / Wood / Metal" }
  ],
  "recommendedFurniture": [
    {
      "item": "Product / Piece Name specifically for a ${targetRoom}",
      "style": "${params.style}",
      "placement": "Where in the room",
      "reason": "Why this piece serves the functional purpose of a ${targetRoom}",
      "estimatedPrice": "e.g. $800 - $1,500"
    }
  ]
}
Strictly return valid JSON only.`;

    // Dynamic fallback customized strictly to the selected room type
    const getRoomSpecificFallback = (rType: string, style: string) => {
      const lower = rType.toLowerCase();
      if (lower.includes('work') || lower.includes('office') || lower.includes('study')) {
        return {
          designSummary: `A sophisticated ${style} workspace designed for deep focus and productivity, combining ergonomic comfort with refined natural materials.`,
          imageGenerationPrompt: `A photorealistic architectural interior of a functional ${style} workspace, executive desk, ergonomic chair, task lighting, bookshelves, 8k resolution`,
          changesMade: [
            `Positioned a tailored ${style} solid wood work desk facing natural window light`,
            `Installed an ergonomic high-performance task chair with breathable textile`,
            `Added architectural open wall shelving for curated books, documents, and reference objects`,
            `Integrated layered glare-free 2700K task lighting and dimmable ambient sconces`,
            'Concealed all wire management and introduced air-purifying indoor greenery'
          ],
          colorPalette: [
            { name: 'Warm Alabaster', hex: '#F6F3EE', role: 'Main Wall' },
            { name: 'Smoked Walnut', hex: '#544133', role: 'Desk & Joinery' },
            { name: 'Oatmeal Wool', hex: '#DED3C4', role: 'Acoustic Panel / Rug' },
            { name: 'Matte Graphite', hex: '#2A2928', role: 'Metal Hardware' },
            { name: 'Muted Sage', hex: '#879183', role: 'Natural Accent' }
          ],
          recommendedFurniture: [
            { item: `${style} Solid Wood Work Desk`, style, placement: 'Centered near natural light source', reason: 'Generous workspace with integrated cable routing', estimatedPrice: '$1,650' },
            { item: 'Ergonomic Executive Task Chair', style, placement: 'At main desk', reason: 'Provides lumbar support and refined aesthetic', estimatedPrice: '$890' },
            { item: 'Fluted Ceramic Desk Lamp', style, placement: 'Desk corner', reason: 'Directional, glare-free warm task lighting', estimatedPrice: '$280' }
          ]
        };
      }
      if (lower.includes('bed')) {
        return {
          designSummary: `A tranquil ${style} bedroom sanctuary tailored for restorative rest, with layered organic linens and warm architectural illumination.`,
          imageGenerationPrompt: `A photorealistic architectural interior of a ${style} bedroom, platform bed with linen duvet, bedside tables, warm lighting, 8k resolution`,
          changesMade: [
            `Anchored room with a low-profile ${style} platform bed and upholstered headboard`,
            'Dressed bed in washed Belgian linen and natural wool throws',
            'Installed floating bedside tables with integrated warm drop pendants',
            'Layered a plush high-pile organic wool rug beneath the bed frame',
            'Treated windows with sheer floor-to-ceiling linen drapery'
          ],
          colorPalette: [
            { name: 'Whisper White', hex: '#FAF8F5', role: 'Main Wall' },
            { name: 'Honey Oak', hex: '#C7A785', role: 'Bed Frame & Tables' },
            { name: 'Stone Grey Linen', hex: '#C2BBB0', role: 'Bedding' },
            { name: 'Brushed Brass', hex: '#C2A36B', role: 'Lighting' },
            { name: 'Earthy Clay', hex: '#A37759', role: 'Accent Cushions' }
          ],
          recommendedFurniture: [
            { item: `${style} Platform Bed Frame`, style, placement: 'Focal wall center', reason: 'Anchors the room with grounding proportions', estimatedPrice: '$2,100' },
            { item: 'Floating Oak Nightstands', style, placement: 'Flanking bed', reason: 'Keeps floor clear while offering bedtime storage', estimatedPrice: '$550 pair' },
            { item: 'Layered Linen Pendant Light', style, placement: 'Ceiling center', reason: 'Casts gentle diffused bedtime glow', estimatedPrice: '$320' }
          ]
        };
      }
      if (lower.includes('dining')) {
        return {
          designSummary: `An elegant ${style} dining room celebrating convivial gathering, centered around a sculptural table and artisan illumination.`,
          imageGenerationPrompt: `A photorealistic architectural interior of a ${style} dining room with dining table, dining chairs, chandelier, 8k resolution`,
          changesMade: [
            `Centered a handcrafted ${style} dining table seating 6-8 guests`,
            'Selected ergonomic sculptural dining chairs in tactile upholstery',
            'Suspended an architectural linear chandelier above the table center',
            'Added a bespoke timber sideboard console for dinnerware and glassware',
            'Grounded the dining zone with an easy-care flatweave wool rug'
          ],
          colorPalette: [
            { name: 'Chalk Plaster', hex: '#F4EFE6', role: 'Main Walls' },
            { name: 'Rich Walnut', hex: '#4E3E31', role: 'Dining Table' },
            { name: 'Natural Cane', hex: '#D7BC93', role: 'Chair Backs' },
            { name: 'Blackened Steel', hex: '#262422', role: 'Light Fixture' },
            { name: 'Terracotta', hex: '#B86F54', role: 'Centerpiece Pottery' }
          ],
          recommendedFurniture: [
            { item: `${style} Solid Wood Dining Table`, style, placement: 'Room center under chandelier', reason: 'Durable, sculptural gathering anchor', estimatedPrice: '$2,400' },
            { item: 'Curved Dining Chairs (Set of 6)', style, placement: 'Around dining table', reason: 'Supportive ergonomics and tactile texture', estimatedPrice: '$1,800' },
            { item: 'Sculptural Linear Pendant', style, placement: '30 inches above tabletop', reason: 'Defines the dining space with intimate lighting', estimatedPrice: '$750' }
          ]
        };
      }
      if (lower.includes('kitchen')) {
        return {
          designSummary: `A streamlined ${style} kitchen balancing culinary functionality with architectural finishes and warm textural details.`,
          imageGenerationPrompt: `A photorealistic architectural interior of a ${style} kitchen, custom cabinetry, stone counters, island with barstools, 8k resolution`,
          changesMade: [
            `Installed flat-panel ${style} custom cabinetry with concealed hardware`,
            'Specified honed quartzite countertops with seamless full-height backsplash',
            'Added a monolithic kitchen island with counter seating',
            'Integrated hidden induction cooktop and panel-ready appliances',
            'Layered under-cabinet 2700K task strips and minimalist island pendants'
          ],
          colorPalette: [
            { name: 'Soft Linen White', hex: '#FAF6EE', role: 'Cabinetry' },
            { name: 'Taj Mahal Quartzite', hex: '#DDD2C3', role: 'Countertops' },
            { name: 'Light White Oak', hex: '#C2A580', role: 'Island Fluting' },
            { name: 'Aged Bronze', hex: '#403830', role: 'Faucets & Hardware' },
            { name: 'Smoked Glass', hex: '#7D7A75', role: 'Pendants' }
          ],
          recommendedFurniture: [
            { item: `${style} Oak Counter Stools (Set of 3)`, style, placement: 'At kitchen island', reason: 'Comfortable casual breakfast seating', estimatedPrice: '$950' },
            { item: 'Fluted Ceramic Island Pendants', style, placement: 'Over island counter', reason: 'Focused ambient downlighting', estimatedPrice: '$480 pair' },
            { item: 'Artisan Stone Fruit Basin', style, placement: 'Island center', reason: 'Organic sculptural countertop styling', estimatedPrice: '$160' }
          ]
        };
      }
      if (lower.includes('bath')) {
        return {
          designSummary: `A spa-inspired ${style} bathroom sanctuary emphasizing tactile stone, fluted millwork, and serene indirect illumination.`,
          imageGenerationPrompt: `A photorealistic architectural interior of a ${style} bathroom, floating vanity, backlit mirror, stone walls, walk-in shower, 8k resolution`,
          changesMade: [
            `Installed a floating ${style} vanity in water-sealed natural oak`,
            'Specified a seamless integrated stone basin with wall-mounted faucets',
            'Added an oversized frameless LED backlit ambient mirror',
            'Created an open walk-in curbless shower with fluted glass enclosure',
            'Finished walls in waterproof lime plaster microcement'
          ],
          colorPalette: [
            { name: 'Warm Microcement', hex: '#EBE5DC', role: 'Walls & Floors' },
            { name: 'Natural White Oak', hex: '#C2A580', role: 'Vanity Cabinet' },
            { name: 'Brushed Nickel', hex: '#A8A49D', role: 'Plumbing Fixtures' },
            { name: 'Honed Travertine', hex: '#D9CEBD', role: 'Shower Niche' },
            { name: 'Crisp Porcelain', hex: '#FFFFFF', role: 'Basin & Sanitary' }
          ],
          recommendedFurniture: [
            { item: `Floating ${style} Double Vanity`, style, placement: 'Main plumbing wall', reason: 'Clean open visual lines with generous concealed storage', estimatedPrice: '$2,200' },
            { item: 'Backlit Curved Mirror', style, placement: 'Above vanity', reason: 'Shadow-free cosmetic lighting and spatial reflection', estimatedPrice: '$420' },
            { item: 'Teak Spa Bench & Ladder', style, placement: 'Shower entry', reason: 'Water-resistant natural warmth for towels and oils', estimatedPrice: '$210' }
          ]
        };
      }

      // Default Living Room
      return {
        designSummary: `A refined ${style} living room transformation celebrating tactile materials, balanced spatial proportion, and serene ${params.colorMood.toLowerCase()} tones.`,
        imageGenerationPrompt: `A photorealistic modern ${style} living room visualization, sectional sofa, coffee table, ${params.lighting} lighting, architectural photography`,
        changesMade: [
          `Repainted walls in warm architectural mineral wash (${params.colorMood} palette)`,
          `Replaced existing seating with custom tailored ${style} silhouettes`,
          `Installed sculptural layered ${params.lighting.toLowerCase()} lighting fixtures`,
          'Upgraded floor surface with wide-plank natural hardwood and hand-knotted wool rug',
          'Introduced biophilic elements, curated ceramics, and refined tactile decor'
        ],
        colorPalette: [
          { name: 'Warm Alabaster', hex: '#F6F3EE', role: 'Primary Wall' },
          { name: 'Smoked Walnut', hex: '#544133', role: 'Architectural Joinery' },
          { name: 'Oatmeal Bouclé', hex: '#DED3C4', role: 'Main Upholstery' },
          { name: 'Aged Patina Brass', hex: '#C2A36B', role: 'Metal Hardware' },
          { name: 'Fossil Stone', hex: '#8F867C', role: 'Stone & Accent' }
        ],
        recommendedFurniture: [
          { item: `Modular Curvilinear ${style} Lounge`, style, placement: 'Room center facing view', reason: 'Fosters open conversation without blocking light', estimatedPrice: '$2,400' },
          { item: 'Sculptural Plinth Coffee Table', style, placement: 'Center of lounge', reason: 'Tactile natural stone focal anchor', estimatedPrice: '$950' },
          { item: 'Oversized Paper Lantern Fixture', style, placement: 'Ceiling center', reason: 'Diffuses calm warm illumination', estimatedPrice: '$420' }
        ]
      };
    };

    const fallback = getRoomSpecificFallback(targetRoom, params.style);

    return await this.executeWithFallback(
      'planInteriorRedesign',
      () => ({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
      (text) => this.parseSafeJson(text, fallback),
      fallback
    );
  }

  /**
   * Assistant chat with design context
   */
  async chatAssistant(params: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; text: string }>;
    context?: {
      roomType?: string;
      currentStyle?: string;
      roomAnalysis?: any;
    };
  }): Promise<string> {
    const systemInstruction = `You are the RoomRevive AI Interior Design Assistant.
You are a warm, sophisticated, and deeply knowledgeable interior architect and interior stylist.
You help users with design advice, color selection, furniture placement, spatial flow, lighting layers, and material pairings.
Current context:
- Room Type: ${params.context?.roomType || 'Interior Space'}
- Selected Style: ${params.context?.currentStyle || 'Custom'}
${params.context?.roomAnalysis ? `Recent Analysis: ${JSON.stringify(params.context.roomAnalysis)}` : ''}

Provide practical, inspiring, design-forward advice in concise, beautifully formatted paragraphs. Mention specific materials (e.g. travertine, bouclé, white oak, linen), color hex codes when helpful, and lighting rules (e.g. 2700K warm glow). Keep answers concise and engaging (under 150 words unless asked for an in-depth plan).`;

    const contents: any[] = [];
    if (params.history && params.history.length > 0) {
      for (const h of params.history) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: params.message }],
    });

    const fallback = `To elevate this space, I recommend focusing on three core layers: first, introducing soft ambient lighting at eye level (around 2700K); second, selecting a cohesive natural material palette such as white oak and warm linen; and third, keeping clear circulation paths to maximize visual space.`;

    return await this.executeWithFallback(
      'chatAssistant',
      () => ({
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      }),
      (text) => text || fallback,
      fallback
    );
  }
}

export const geminiService = new GeminiService();
