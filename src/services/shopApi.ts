import { apiClient } from './api';
import { DetectedShopItem, ShopProduct, ShopCategory, ShopLookResult } from '../types';

export const shopApi = {
  /**
   * Analyze generated room image to identify visible furniture and decor items
   */
  async analyzeLook(
    image: string,
    context?: { roomType?: string; style?: string }
  ): Promise<{ items: DetectedShopItem[]; categories: ShopCategory[] }> {
    const res = await apiClient.post('/shop/analyze', { image, ...context });
    return res.data;
  },

  /**
   * Search for products matching a visual query or detected item
   */
  async searchSimilar(
    query: string,
    item?: Partial<DetectedShopItem>,
    category?: ShopCategory
  ): Promise<{ products: ShopProduct[]; provider: string; isDemoData: boolean; note: string }> {
    const res = await apiClient.post('/shop/search', { query, item, category });
    return res.data;
  },

  /**
   * Get complete Shop This Look (identifies items + retrieves similar products in one step)
   */
  async getCompleteLook(
    image: string,
    context?: { roomType?: string; style?: string }
  ): Promise<ShopLookResult> {
    const res = await apiClient.post<ShopLookResult>('/shop/look', { image, ...context });
    return res.data;
  },

  /**
   * Get provider metadata and configuration status
   */
  async getProviderInfo(): Promise<{
    providerName: string;
    isDemoData: boolean;
    note: string;
    instructions: string;
  }> {
    const res = await apiClient.get('/shop/provider');
    return res.data;
  },
};
