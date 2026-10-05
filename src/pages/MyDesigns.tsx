import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppAuth } from '../hooks/useAppAuth';
import { designsApi, UserSavedDesign, UserStats } from '../services/designsApi';
import {
  Layers,
  Sparkles,
  Trash2,
  ExternalLink,
  Calendar,
  Search,
  Filter,
  Loader2,
  Plus,
  Lock,
  ArrowRight,
  Eye,
  Download,
  AlertCircle,
  X,
} from 'lucide-react';
import { ImageSlider } from '../components/ImageSlider';

interface MyDesignsProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MyDesigns: React.FC<MyDesignsProps> = ({ onToast }) => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAppAuth();

  const [designs, setDesigns] = useState<UserSavedDesign[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('all');
  const [activeModalDesign, setActiveModalDesign] = useState<UserSavedDesign | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDesigns = async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [data, userStats] = await Promise.all([
        designsApi.getAll(),
        designsApi.getUserStats().catch(() => null),
      ]);
      setDesigns(data);
      if (userStats) setStats(userStats);
    } catch (err: any) {
      console.error('[MyDesigns] Fetch error:', err);
      onToast('Failed to load your saved designs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchDesigns();
    }
  }, [isLoaded, isSignedIn]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved design?')) {
      return;
    }

    setDeletingId(id);
    try {
      await designsApi.delete(id);
      setDesigns((prev) => prev.filter((d) => d._id !== id));
      if (activeModalDesign?._id === id) {
        setActiveModalDesign(null);
      }
      onToast('Design deleted successfully', 'success');
    } catch (err: any) {
      console.error('[MyDesigns] Delete error:', err);
      onToast(err?.response?.data?.error || 'Failed to delete design', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (imageUrl: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Image downloaded', 'success');
  };

  // Unique styles for filter dropdown
  const availableStyles = Array.from(new Set(designs.map((d) => d.selectedStyle).filter(Boolean)));

  // Filtered designs
  const filteredDesigns = designs.filter((d) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.selectedStyle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStyle =
      selectedStyleFilter === 'all' ||
      d.selectedStyle.toLowerCase() === selectedStyleFilter.toLowerCase();

    return matchesQuery && matchesStyle;
  });

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C6849] font-semibold block mb-1">
            Personal Collection
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1F1E1D]">
            My Designs
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Browse and manage all your AI-redesigned interior spaces stored in MongoDB Atlas.
          </p>
        </div>

        {/* Action Controls & Stats */}
        <div className="flex flex-wrap items-center gap-3">
          {stats && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F4EFE6] border border-[#DDD5C9] rounded-lg text-xs font-medium text-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-[#8C6849]" />
              <span>
                Today's Allowance: <strong className="text-[#1F1E1D]">{stats.remainingToday}</strong> / {stats.dailyLimit} remaining
              </span>
            </div>
          )}

          <Link
            to="/design"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#242220] hover:bg-[#383532] rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Design</span>
          </Link>
        </div>
      </div>

      {/* Unauthenticated State */}
      {!isSignedIn && isLoaded && (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-12 text-center max-w-xl mx-auto space-y-5 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#8C6849]">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif-luxury text-2xl font-bold text-[#1F1E1D]">
              Sign In to View Your Designs
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              Sign in with your Clerk account to persistently save, view, and manage all your redesigned spaces in MongoDB Atlas.
            </p>
          </div>
          <Link
            to="/design"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#8C6849] hover:bg-[#76563B] rounded-lg transition-colors shadow-sm"
          >
            <span>Start Designing Spaces</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Authenticated View */}
      {isSignedIn && (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by title, room, or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#DDD5C9] rounded-lg focus:outline-hidden focus:border-[#8C6849] text-stone-800 placeholder-stone-400 transition-colors shadow-2xs"
              />
            </div>

            {availableStyles.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-stone-500" />
                <select
                  value={selectedStyleFilter}
                  onChange={(e) => setSelectedStyleFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-[#DDD5C9] rounded-lg focus:outline-hidden focus:border-[#8C6849] text-stone-700 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Styles</option>
                  {availableStyles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#8C6849]" />
              <p className="text-xs uppercase tracking-widest font-medium">Loading your saved designs from MongoDB...</p>
            </div>
          ) : filteredDesigns.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-[#E8E2D8] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#8C6849]">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-[#1F1E1D]">
                  {searchQuery || selectedStyleFilter !== 'all' ? 'No matching designs found' : 'No saved designs yet'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {searchQuery || selectedStyleFilter !== 'all'
                    ? 'Try adjusting your search query or filter to find what you are looking for.'
                    : 'Transform your first room using RoomRevive AI. All your successful redesigns will be stored here.'}
                </p>
              </div>
              <Link
                to="/design"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#242220] hover:bg-[#383532] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Design</span>
              </Link>
            </div>
          ) : (
            /* Designs Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDesigns.map((design) => (
                <div
                  key={design._id}
                  onClick={() => setActiveModalDesign(design)}
                  className="group bg-white border border-[#E8E2D8] rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  {/* Image Preview Container */}
                  <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                    <img
                      src={design.generatedImageUrl}
                      alt={design.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Style Tag */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 text-[11px] font-semibold bg-[#242220]/80 backdrop-blur-xs text-[#FAF8F5] rounded-md shadow-xs">
                        {design.selectedStyle}
                      </span>
                      <span className="px-2.5 py-1 text-[11px] font-medium bg-white/90 backdrop-blur-xs text-[#1F1E1D] rounded-md shadow-xs">
                        {design.roomType}
                      </span>
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalDesign(design);
                        }}
                        className="p-2.5 rounded-full bg-white text-[#1F1E1D] hover:bg-[#F4EFE6] transition-colors shadow-sm"
                        title="View Before & After comparison"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDownload(design.generatedImageUrl, design.title, e)}
                        className="p-2.5 rounded-full bg-white text-[#1F1E1D] hover:bg-[#F4EFE6] transition-colors shadow-sm"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(design._id, e)}
                        disabled={deletingId === design._id}
                        className="p-2.5 rounded-full bg-white text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                        title="Delete design"
                      >
                        {deletingId === design._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-serif-luxury text-base font-bold text-[#1F1E1D] line-clamp-1 group-hover:text-[#8C6849] transition-colors">
                        {design.title}
                      </h3>
                      {design.customInstructions && (
                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                          "{design.customInstructions}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-xs text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {formatDate(design.createdAt)}
                      </span>
                      <span className="font-semibold text-[#8C6849] flex items-center gap-1">
                        View Details <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail / Comparison Modal */}
      {activeModalDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E8E2D8] flex items-center justify-between bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#8C6849] text-white rounded">
                    {activeModalDesign.selectedStyle}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {activeModalDesign.roomType}
                  </span>
                </div>
                <h2 className="font-serif-luxury text-xl font-bold text-[#1F1E1D] mt-1">
                  {activeModalDesign.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalDesign(null)}
                className="p-2 text-stone-400 hover:text-[#1F1E1D] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Interactive Before & After Slider */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
                  Original Room vs. Redesigned Room
                </span>
                <div className="rounded-xl overflow-hidden border border-[#E8E2D8] aspect-16/10 bg-stone-900">
                  <ImageSlider
                    originalImage={activeModalDesign.originalImageUrl}
                    generatedImage={activeModalDesign.generatedImageUrl}
                  />
                </div>
              </div>

              {/* Design Details & Palette */}
              {activeModalDesign.designInsights && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E8E2D8]">
                  {/* Changes & Summary */}
                  <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-2">
                    <span className="text-xs font-bold text-[#1F1E1D] uppercase tracking-wider block">
                      Architectural Changes Applied
                    </span>
                    <ul className="text-xs text-stone-600 space-y-1.5 list-disc pl-4">
                      {activeModalDesign.designInsights.changesMade?.slice(0, 4).map((change, i) => (
                        <li key={i}>{change}</li>
                      )) || <li>Complete style transformation applied cleanly to existing boundaries.</li>}
                    </ul>
                  </div>

                  {/* Curated Color Palette */}
                  {activeModalDesign.designInsights.colorPalette && (
                    <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-2">
                      <span className="text-xs font-bold text-[#1F1E1D] uppercase tracking-wider block">
                        Curated Material & Color Palette
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {activeModalDesign.designInsights.colorPalette.map((col, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E8E2D8] bg-[#FAF8F5] text-xs font-medium"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span className="text-stone-700">{col.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E8E2D8] bg-white flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Created: {formatDate(activeModalDesign.createdAt)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDownload(activeModalDesign.generatedImageUrl, activeModalDesign.title, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-[#F4EFE6] hover:bg-[#ECE4D8] rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={(e) => handleDelete(activeModalDesign._id, e)}
                  disabled={deletingId === activeModalDesign._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
