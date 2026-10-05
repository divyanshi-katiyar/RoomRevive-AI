import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  Info,
  Check,
  RefreshCw,
  Tag,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  Eye,
  Sliders,
} from 'lucide-react';
import { shopApi } from '../services/shopApi';
import { DetectedShopItem, ShopProduct, ShopCategory, ShopLookResult } from '../types';

interface ShopThisLookProps {
  generatedImage: string;
  roomType?: string;
  style?: string;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  // If user opens this directly or wants automatic expansion
  initialAutoOpen?: boolean;
}

export const ShopThisLook: React.FC<ShopThisLookProps> = ({
  generatedImage,
  roomType = 'Living Room',
  style = 'Contemporary',
  onToast,
  initialAutoOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialAutoOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ShopLookResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItemForSimilar, setSelectedItemForSimilar] = useState<DetectedShopItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingCustom, setIsSearchingCustom] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopProduct | null>(null);

  // Auto-load if opened
  const handleOpenAndAnalyze = async () => {
    setIsOpen(true);
    if (data) return; // already analyzed

    setIsLoading(true);
    try {
      const res = await shopApi.getCompleteLook(generatedImage, { roomType, style });
      setData(res);
      onToast(`Identified ${res.items.length} design pieces from your room!`, 'success');
    } catch (err: any) {
      console.error('[ShopThisLook] Error analyzing room image:', err);
      onToast('Could not complete Shop This Look analysis. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-analyze or refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await shopApi.getCompleteLook(generatedImage, { roomType, style });
      setData(res);
      setSelectedItemForSimilar(null);
      setSearchQuery('');
      onToast('Refreshed inspiration catalog matches', 'success');
    } catch {
      onToast('Failed to refresh products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Shop Similar for a specific detected item
  const handleShopSimilar = async (item: DetectedShopItem) => {
    setSelectedItemForSimilar(item);
    setIsSearchingCustom(true);
    try {
      const res = await shopApi.searchSimilar(item.searchQuery, item, item.category);
      if (data) {
        // Merge or prioritize products for this item
        setData({
          ...data,
          products: [
            ...res.products,
            ...data.products.filter((p) => !res.products.some((np) => np.title === p.title)),
          ],
        });
      }
      setActiveCategory(item.category);
      onToast(`Showing products similar to "${item.name}"`, 'info');
    } catch {
      onToast('Could not retrieve similar products', 'error');
    } finally {
      setIsSearchingCustom(false);
    }
  };

  // Custom text search query
  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingCustom(true);
    try {
      const res = await shopApi.searchSimilar(searchQuery.trim());
      if (data) {
        setData({
          ...data,
          products: res.products,
        });
      }
      onToast(`Searched for: "${searchQuery.trim()}"`, 'success');
    } catch {
      onToast('Search failed. Please try again.', 'error');
    } finally {
      setIsSearchingCustom(false);
    }
  };

  // Reset filter back to all items
  const handleClearFilter = () => {
    setSelectedItemForSimilar(null);
    setActiveCategory('All');
    setSearchQuery('');
  };

  const categories: string[] = ['All', 'Furniture', 'Lighting', 'Decor', 'Textiles', 'Accessories'];

  // Filter products by selected category and search query
  const filteredProducts = (data?.products || []).filter((product) => {
    const matchCategory =
      activeCategory === 'All' || product.category.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch =
      !searchQuery.trim() ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.retailer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div id="shop-this-look-section" className="space-y-6 pt-4 scroll-mt-20">
      {/* Prominent Trigger Button if section is closed */}
      {!isOpen && (
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-[#F5EFE6] via-[#FAF8F5] to-[#EFE7DC] border-2 border-[#DDD1C0] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#8C6849]/10 to-transparent blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C6849]/15 text-[#6D4F35] text-xs font-semibold tracking-wide uppercase border border-[#8C6849]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6849]" />
                <span>AI Vision Product Match</span>
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
                Shop This Look
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Love the furniture, lighting, and decor in your redesigned room? Let Gemini Vision analyze
                the visible elements and discover visually similar pieces inspired by your design.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAndAnalyze}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#242220] hover:bg-[#383532] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E3D5C5]" />
                  <span>Analyzing Room Items...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#E3D5C5]" />
                  <span>Shop This Look</span>
                  <ChevronRight className="w-4 h-4 text-[#E3D5C5]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Section when Open */}
      {isOpen && (
        <div className="rounded-3xl bg-white border border-[#E3DBD0] shadow-sm overflow-hidden animate-in fade-in duration-300">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-linear-to-b from-[#FAF8F5] to-white border-b border-[#E8E2D8] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8C6849]/10 text-[#8C6849] text-[11px] font-semibold tracking-wider uppercase">
                    <Sparkles className="w-3 h-3 text-[#8C6849]" />
                    <span>Inspiration Match</span>
                  </span>
                  {data?.isDemoData && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                      <Tag className="w-2.5 h-2.5" />
                      <span>Demo Shopping Catalog</span>
                    </span>
                  )}
                </div>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
                  Shop This Look
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Here are items inspired by your design. Discover similar furniture and decor matching
                  the style, materials, and silhouettes of your AI room.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DDD5C9] bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  title="Re-analyze image and refresh recommendations"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#8C6849] ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh Look</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl border border-[#DDD5C9] bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
                  title="Collapse section"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transparent AI Behavior Notice */}
            <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E9E1D5] flex items-start gap-3 text-xs text-stone-600">
              <Info className="w-4 h-4 text-[#8C6849] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-stone-800">Similar Products:</strong> Your
                AI-generated room is an artistic concept image. These recommended products are visual
                matches selected for their matching silhouettes, materials, and color palette.
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#242220] text-[#E3D5C5] mx-auto flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif-luxury text-base font-bold text-stone-800">
                  Gemini Vision Analyzing Room Elements
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Identifying visible furniture, lighting, rugs, and decor items in your room design...
                </p>
              </div>
            </div>
          )}

          {!isLoading && data && (
            <div className="p-6 sm:p-8 space-y-8">
              {/* SECTION 1: DETECTED INSPIRATION PIECES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#8C6849]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Identified Design Elements ({data.items.length})
                    </h4>
                  </div>
                  {selectedItemForSimilar && (
                    <button
                      type="button"
                      onClick={handleClearFilter}
                      className="text-xs font-semibold text-[#8C6849] hover:underline cursor-pointer"
                    >
                      Clear Item Filter
                    </button>
                  )}
                </div>

                {/* Horizontal Scrolling Detected Items Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {data.items.map((item) => {
                    const isSelected = selectedItemForSimilar?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between space-y-2.5 ${
                          isSelected
                            ? 'bg-[#FAF5EE] border-[#8C6849] shadow-xs ring-1 ring-[#8C6849]'
                            : 'bg-[#FAF8F5] border-[#E8E2D8] hover:border-[#8C6849]/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6849]">
                              {item.category}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-500 capitalize">
                              {item.importance}
                            </span>
                          </div>
                          <h5 className="font-serif-luxury font-bold text-stone-900 text-sm line-clamp-1">
                            {item.name}
                          </h5>
                          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Specs */}
                        <div className="space-y-1 pt-1 border-t border-stone-200/60 text-[11px] text-stone-600">
                          <div className="flex justify-between">
                            <span className="text-stone-400">Material:</span>
                            <span className="font-medium text-stone-800 truncate ml-1">{item.material}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400">Color:</span>
                            <span className="font-medium text-stone-800 truncate ml-1">{item.dominantColor}</span>
                          </div>
                        </div>

                        {/* Shop Similar Button */}
                        <button
                          type="button"
                          onClick={() => handleShopSimilar(item)}
                          className={`w-full py-2 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#8C6849] text-white'
                              : 'bg-white hover:bg-stone-100 text-stone-800 border border-[#DDD5C9]'
                          }`}
                        >
                          <Search className="w-3 h-3" />
                          <span>Shop Similar</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: FILTER & SEARCH CONTROLS */}
              <div className="space-y-4 pt-4 border-t border-[#E8E2D8]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Category Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {categories.map((cat) => {
                      const count =
                        cat === 'All'
                          ? data.products.length
                          : data.products.filter(
                              (p) => p.category.toLowerCase() === cat.toLowerCase()
                            ).length;
                      const isActive = activeCategory.toLowerCase() === cat.toLowerCase();

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setActiveCategory(cat);
                            setSelectedItemForSimilar(null);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-[#242220] text-white shadow-xs'
                              : 'bg-[#FAF8F5] hover:bg-[#F2ECE3] text-stone-700 border border-[#E3DBD0]'
                          }`}
                        >
                          <span>{cat}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-stone-200/80 text-stone-600'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Query Form */}
                  <form
                    onSubmit={handleCustomSearch}
                    className="flex items-center gap-2 max-w-sm w-full"
                  >
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search materials, shapes, colors..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#DDD5C9] focus:outline-none focus:border-[#8C6849] focus:bg-white"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingCustom}
                      className="px-3 py-1.5 rounded-xl bg-[#242220] text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isSearchingCustom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
                    </button>
                  </form>
                </div>

                {/* Active Filter Indicator */}
                {(selectedItemForSimilar || searchQuery) && (
                  <div className="flex items-center gap-2 text-xs text-stone-600 bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E9E1D5]">
                    <span className="font-semibold text-stone-800">Active View:</span>
                    {selectedItemForSimilar && (
                      <span className="bg-white px-2.5 py-0.5 rounded-md border border-stone-200 font-medium">
                        Similar to: {selectedItemForSimilar.name} ({selectedItemForSimilar.dominantColor},{' '}
                        {selectedItemForSimilar.material})
                      </span>
                    )}
                    {searchQuery && (
                      <span className="bg-white px-2.5 py-0.5 rounded-md border border-stone-200 font-medium">
                        Query: "{searchQuery}"
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleClearFilter}
                      className="ml-auto text-xs font-semibold text-[#8C6849] hover:underline cursor-pointer"
                    >
                      Reset to All
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 3: RECOMMENDED PRODUCTS GRID */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Showing {filteredProducts.length} similar products inspired by your space</span>
                  <span className="text-[11px] text-stone-400">
                    Provider: {data.provider}
                  </span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="py-16 text-center space-y-3 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD5C9]">
                    <Search className="w-8 h-8 mx-auto text-stone-400" />
                    <h5 className="font-serif-luxury text-base font-bold text-stone-800">
                      No similar products found for this filter
                    </h5>
                    <p className="text-xs text-stone-500">
                      Try resetting your search query or selecting a different category.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearFilter}
                      className="px-4 py-2 rounded-xl bg-[#242220] text-white text-xs font-semibold cursor-pointer"
                    >
                      Show All Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="group rounded-2xl bg-white border border-[#E3DBD0] hover:border-[#8C6849] hover:shadow-md transition-all flex flex-col overflow-hidden"
                      >
                        {/* Image Container */}
                        <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Category Tag */}
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-white border border-white/10 shadow-xs">
                              {product.category}
                            </span>
                          </div>

                          {/* Quick View Button on Hover */}
                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(product)}
                            className="absolute bottom-2.5 right-2.5 p-2 rounded-lg bg-black/70 hover:bg-black text-white text-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                            title="Quick view product specs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-400 font-medium">
                                {product.retailer}
                              </span>
                              <span className="font-semibold text-stone-900 bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#ECE4D8]">
                                {product.price}
                              </span>
                            </div>

                            <h5 className="font-serif-luxury font-bold text-stone-900 text-sm line-clamp-2 group-hover:text-[#8C6849] transition-colors">
                              {product.title}
                            </h5>

                            <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                              {product.matchReason}
                            </p>
                          </div>

                          {/* Attribute Tags */}
                          {product.specs && (
                            <div className="flex flex-wrap gap-1 pt-1 text-[10px] text-stone-600">
                              {product.specs.material && (
                                <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-stone-200">
                                  {product.specs.material}
                                </span>
                              )}
                              {product.specs.color && (
                                <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-stone-200">
                                  {product.specs.color}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Buttons: View Product & Shop Similar */}
                          <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2">
                            <a
                              href={product.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-2.5 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <span>View Product</span>
                              <ExternalLink className="w-3 h-3 text-[#E3D5C5]" />
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery(product.title);
                                onToast(`Searching for alternatives to "${product.title}"`, 'info');
                              }}
                              className="w-full py-2 px-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE3] text-stone-800 text-xs font-semibold border border-[#DDD5C9] transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Sliders className="w-3 h-3 text-[#8C6849]" />
                              <span>Shop Similar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Developer / Engineering Integration Guidance Footer */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E3DBD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#8C6849]" />
                  <span>
                    <strong>Shopping Provider:</strong> {data.provider}.{' '}
                    {data.isDemoData
                      ? 'Demonstration catalog active. Live Google Shopping API is configurable in backend.'
                      : 'Live shopping results retrieved.'}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  RoomRevive Product Inspiration Engine
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border border-[#DDD5C9] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-[#F2EDE5] border-b border-[#E3DBD0] flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6849]">
                Product Match Details
              </span>
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-[#E3DBD0]">
                <img
                  src={quickViewProduct.imageUrl}
                  alt={quickViewProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">{quickViewProduct.retailer}</span>
                    <span className="text-sm font-bold text-stone-900 bg-white px-2.5 py-0.5 rounded-md border border-[#DDD5C9]">
                      {quickViewProduct.price}
                    </span>
                  </div>
                  <h4 className="font-serif-luxury text-lg font-bold text-stone-900">
                    {quickViewProduct.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {quickViewProduct.matchReason}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E3DBD0] text-xs space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Product Attributes
                  </span>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Category:</span>
                    <span className="font-semibold text-stone-800">{quickViewProduct.category}</span>
                  </div>
                  {quickViewProduct.specs?.material && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Material:</span>
                      <span className="font-semibold text-stone-800">{quickViewProduct.specs.material}</span>
                    </div>
                  )}
                  {quickViewProduct.specs?.color && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Color:</span>
                      <span className="font-semibold text-stone-800">{quickViewProduct.specs.color}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={quickViewProduct.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-xs font-semibold text-center flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>View on Google Shopping</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#E3D5C5]" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(quickViewProduct.title);
                      setQuickViewProduct(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-[#DDD5C9] text-xs font-semibold cursor-pointer"
                  >
                    Shop Similar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
