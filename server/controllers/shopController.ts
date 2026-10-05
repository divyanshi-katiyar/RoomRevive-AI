import { Request, Response, NextFunction } from 'express';
import { shopService } from '../services/shopService.js';

export const analyzeShopLookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image, roomType, style } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required for Shop This Look analysis.' });
    }

    const result = await shopService.identifyItemsFromDesign(image, { roomType, style });
    res.json({
      success: true,
      items: result.items,
      categories: result.categories,
      providerInfo: shopService.getProviderInfo(),
    });
  } catch (err: any) {
    console.error('[ShopController] Analyze error:', err?.message || err);
    next(err);
  }
};

export const searchProductsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, item, category } = req.body;
    if (!query && !item?.name) {
      return res.status(400).json({ error: 'Search query or item specification is required.' });
    }

    const searchQuery = query || item?.searchQuery || `${item?.dominantColor || ''} ${item?.style || ''} ${item?.name || ''}`.trim();
    const result = await shopService.searchProducts(searchQuery, item, category);

    res.json({
      success: true,
      query: searchQuery,
      products: result.products,
      provider: result.provider,
      isDemoData: result.isDemoData,
      note: result.note,
    });
  } catch (err: any) {
    console.error('[ShopController] Search error:', err?.message || err);
    next(err);
  }
};

export const getShopLookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image, roomType, style } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required for Shop This Look.' });
    }

    const result = await shopService.getCompleteShopLook(image, { roomType, style });
    res.json({
      success: true,
      items: result.items,
      products: result.products,
      categories: result.categories,
      providerInfo: result.providerInfo,
    });
  } catch (err: any) {
    console.error('[ShopController] Complete look error:', err?.message || err);
    next(err);
  }
};

export const getProviderInfoController = async (req: Request, res: Response) => {
  res.json({
    success: true,
    ...shopService.getProviderInfo(),
    instructions:
      'To connect live shopping search via SerpApi, set SERPAPI_API_KEY in your server environment variables.',
  });
};
