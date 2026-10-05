import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export interface DetectedShopItem {
  id: string;
  name: string;
  category: 'Furniture' | 'Lighting' | 'Decor' | 'Textiles' | 'Accessories';
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
  category: 'Furniture' | 'Lighting' | 'Decor' | 'Textiles' | 'Accessories';
  price: string;
  retailer: string;
  imageUrl: string;
  productUrl: string;
  rating?: number | null;
  reviews?: number | null;
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

export interface ShopSearchResult {
  success: boolean;
  query: string;
  products: ShopProduct[];
  provider: string;
  isDemoData: boolean;
  note?: string;
}

export class ShopService {
  private ai: GoogleGenAI;
  private serpApiKey: string;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    this.serpApiKey = process.env.SERPAPI_API_KEY?.trim() || '';
  }

  public getProviderInfo() {
    const hasSerpApi = Boolean(this.serpApiKey);
    return {
      providerName: hasSerpApi ? 'SerpApi (Google Shopping)' : 'Curated Architectural Catalog',
      isDemoData: !hasSerpApi,
      note: hasSerpApi
        ? 'Live real-time product results searched via SerpApi Google Shopping.'
        : 'SerpApi key not set; showing design inspiration pieces.',
    };
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
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${imageData} (${response.status})`);
      }
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const mimeType = contentType.split(';')[0].trim();
      const arrayBuffer = await response.arrayBuffer();
      const cleanData = Buffer.from(arrayBuffer).toString('base64');
      return { mimeType, cleanData };
    }
    return { mimeType: 'image/jpeg', cleanData: imageData };
  }

  /**
   * Gemini identifies relevant furniture and decor items from the generated design.
   */
  async identifyItemsFromDesign(
    imageData: string,
    context?: { roomType?: string; style?: string }
  ): Promise<{ items: DetectedShopItem[]; categories: string[] }> {
    const { cleanData, mimeType } = await this.resolveImageData(imageData);

    const prompt = `You are an expert interior design product identifier.
Carefully examine this room interior photograph.
Identify 4 to 8 primary, clearly visible furniture, lighting, and decor items in this space.

For each item, identify:
1. name: descriptive title (e.g., "Fluted White Oak Coffee Table", "Tufted Bouclé Sectional Sofa", "Sculptural Brass Floor Lamp")
2. category: exactly one of "Furniture", "Lighting", "Decor", "Textiles", "Accessories"
3. style: aesthetic style (e.g., "${context?.style || 'Modern'}", "Scandinavian", "Industrial", "Japandi", "Traditional")
4. material: visible materials (e.g., "White oak", "Bouclé", "Linen", "Brushed Brass", "Velvet", "Marble")
5. dominantColor: visible color (e.g., "Oatmeal", "Warm Oak", "Matte Black", "Cream")
6. shape: form factor (e.g., "Round", "L-shaped", "Linear")
7. description: 1-sentence visual description
8. importance: "focal" | "primary" | "accent" | "essential"
9. searchQuery: precise commercial product search query to find this exact style item online (e.g., "round fluted white oak coffee table", "beige boucle low profile 3 seater sofa", "brass arc floor lamp with marble base")

Return ONLY valid JSON matching this schema:
{
  "items": [
    {
      "name": "string",
      "category": "Furniture",
      "style": "string",
      "material": "string",
      "dominantColor": "string",
      "shape": "string",
      "description": "string",
      "importance": "focal",
      "searchQuery": "string"
    }
  ]
}`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let rawText = '';

    for (const model of modelsToTry) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents: {
            parts: [
              { inlineData: { data: cleanData, mimeType } },
              { text: prompt },
            ],
          },
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });
        rawText = response.text || '';
        if (rawText) break;
      } catch (err: any) {
        console.warn(`[ShopService] Gemini item identification failed on ${model}:`, err?.message || err);
      }
    }

    let parsedItems: any[] = [];
    if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        parsedItems = Array.isArray(parsed) ? parsed : parsed.items || [];
      } catch {
        const match = rawText.match(/\[[\s\S]*\]/) || rawText.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const p = JSON.parse(match[0]);
            parsedItems = Array.isArray(p) ? p : p.items || [];
          } catch {
            // fallback below
          }
        }
      }
    }

    if (!parsedItems || parsedItems.length === 0) {
      parsedItems = [
        {
          name: `${context?.style || 'Modern'} Essential Seating`,
          category: 'Furniture',
          style: context?.style || 'Modern',
          material: 'Linen / Bouclé',
          dominantColor: 'Warm Neutral',
          shape: 'Contemporary',
          description: 'Comfortable architectural seating matching room tone.',
          importance: 'focal',
          searchQuery: `${context?.style || 'modern'} ${context?.roomType || 'room'} sofa seating`,
        },
        {
          name: 'Architectural Coffee / Accent Table',
          category: 'Furniture',
          style: context?.style || 'Modern',
          material: 'Natural Timber / Stone',
          dominantColor: 'Warm Oak',
          shape: 'Curved / Geometric',
          description: 'Accent table coordinating with the room surfaces.',
          importance: 'primary',
          searchQuery: `${context?.style || 'modern'} natural oak coffee table`,
        },
      ];
    }

    const items: DetectedShopItem[] = parsedItems.map((item: any, idx: number) => ({
      id: `item-${idx + 1}-${Date.now().toString(36)}`,
      name: item.name || 'Room Accent Item',
      category: ['Furniture', 'Lighting', 'Decor', 'Textiles', 'Accessories'].includes(item.category)
        ? item.category
        : 'Furniture',
      style: item.style || context?.style || 'Contemporary',
      material: item.material || 'Mixed materials',
      dominantColor: item.dominantColor || 'Neutral',
      shape: item.shape || 'Standard',
      description: item.description || '',
      importance: item.importance || 'primary',
      searchQuery: item.searchQuery || `${item.dominantColor || ''} ${item.style || ''} ${item.name || ''}`.trim(),
    }));

    const categories = Array.from(new Set(items.map((i) => i.category)));
    return { items, categories };
  }

  /**
   * Search real products using SerpApi Google Shopping engine.
   * Never fabricates products.
   */
  async searchProducts(
    query: string,
    item?: Partial<DetectedShopItem>,
    categoryFilter?: string
  ): Promise<ShopSearchResult> {
    const searchQuery = query || item?.searchQuery || `${item?.dominantColor || ''} ${item?.style || ''} ${item?.name || ''}`.trim();
    const apiKey = process.env.SERPAPI_API_KEY?.trim() || this.serpApiKey;

    if (!apiKey) {
      console.log('[ShopService] SERPAPI_API_KEY not configured. Returning empty live results with helpful guidance.');
      return {
        success: true,
        query: searchQuery,
        products: [],
        provider: 'SerpApi (Google Shopping)',
        isDemoData: false,
        note: 'SERPAPI_API_KEY is not configured on the server. Please set your SERPAPI_API_KEY to retrieve live shopping results.',
      };
    }

    try {
      console.log(`[ShopService] Querying SerpApi Google Shopping for: "${searchQuery}"...`);
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.set('engine', 'google_shopping');
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('num', '8');

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RoomRevive-AI/1.0',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ShopService] SerpApi error (${response.status}):`, errorText.slice(0, 200));
        return {
          success: false,
          query: searchQuery,
          products: [],
          provider: 'SerpApi (Google Shopping)',
          isDemoData: false,
          note: `SerpApi returned status ${response.status}: ${errorText.slice(0, 150)}`,
        };
      }

      const data = await response.json();
      const shoppingResults = data.shopping_results || [];

      if (!Array.isArray(shoppingResults) || shoppingResults.length === 0) {
        console.log(`[ShopService] No products returned by SerpApi for: "${searchQuery}"`);
        return {
          success: true,
          query: searchQuery,
          products: [],
          provider: 'SerpApi (Google Shopping)',
          isDemoData: false,
          note: `No live products found for query "${searchQuery}".`,
        };
      }

      // Map strictly real data returned by SerpApi — never fabricate
      const products: ShopProduct[] = shoppingResults.slice(0, 6).map((p: any, idx: number) => {
        const price = p.price || (p.extracted_price ? `$${p.extracted_price}` : 'Check store');
        const store = p.source || p.merchant?.name || 'Online Store';
        const rating = typeof p.rating === 'number' ? p.rating : null;
        const reviews = typeof p.reviews === 'number' ? p.reviews : null;
        const productUrl = p.link || p.direct_link || p.product_link || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(searchQuery)}`;
        const imageUrl = p.thumbnail || p.image || '';

        return {
          id: `serp-${p.product_id || idx}-${Date.now().toString(36)}`,
          title: p.title || 'Product',
          category: (item?.category as any) || (categoryFilter as any) || 'Furniture',
          price,
          retailer: store,
          imageUrl,
          productUrl,
          rating,
          reviews,
          sourceQuery: searchQuery,
          matchReason: `Live product matching "${item?.name || searchQuery}"`,
          detectedItemId: item?.id,
          specs: {
            color: item?.dominantColor,
            material: item?.material,
            style: item?.style,
          },
          isSimilar: true,
        };
      });

      return {
        success: true,
        query: searchQuery,
        products,
        provider: 'SerpApi (Google Shopping)',
        isDemoData: false,
      };
    } catch (err: any) {
      console.error('[ShopService] SerpApi request exception:', err?.message || err);
      return {
        success: false,
        query: searchQuery,
        products: [],
        provider: 'SerpApi (Google Shopping)',
        isDemoData: false,
        note: `Search error: ${err?.message || err}`,
      };
    }
  }

  /**
   * Complete Shop My Look orchestration:
   * 1. Gemini identifies items from the design
   * 2. Search SerpApi for the top items
   */
  async getCompleteShopLook(
    imageData: string,
    context?: { roomType?: string; style?: string }
  ) {
    const { items, categories } = await this.identifyItemsFromDesign(imageData, context);

    const products: ShopProduct[] = [];
    const topItems = items.slice(0, 4);

    for (const item of topItems) {
      const searchRes = await this.searchProducts(item.searchQuery, item);
      if (searchRes.products && searchRes.products.length > 0) {
        products.push(...searchRes.products.slice(0, 2));
      }
    }

    return {
      items,
      products,
      categories,
      providerInfo: this.getProviderInfo(),
    };
  }
}

export const shopService = new ShopService();
export const shoppingService = shopService;
