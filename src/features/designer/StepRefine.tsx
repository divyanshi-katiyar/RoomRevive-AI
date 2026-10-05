import React, { useState } from 'react';
import {
  DesignInsightsData,
  DesignVariation,
  RoomAnalysisData,
} from '../../types';
import { CustomizePreferences } from './StepCustomize';
import { QUICK_REFINEMENTS } from '../../utils/presets';
import { ImageSlider } from '../../components/ImageSlider';
import {
  Sparkles,
  Download,
  Send,
  Wand2,
  Palette,
  Sofa,
  Layers,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Columns,
  Sliders,
  Sun,
  DollarSign,
  ShieldCheck,
  Building2,
  ShoppingBag,
} from 'lucide-react';
import { ShopThisLook } from '../../components/ShopThisLook';

interface StepRefineProps {
  originalImage: string;
  generatedImage: string | null;
  imageGenerationAvailable?: boolean;
  imageGenerationMessage?: string;
  generationPrompt?: string;
  designInsights?: DesignInsightsData;
  analysis?: RoomAnalysisData | null;
  preferences?: CustomizePreferences;
  variations: DesignVariation[];
  projectId?: string;
  onSelectVariation: (variation: DesignVariation) => void;
  onRefinePrompt: (prompt: string) => Promise<void>;
  onRegenerate?: () => void;
  onStartOver: () => void;
  isRefining: boolean;
  isGenerating?: boolean;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StepRefine: React.FC<StepRefineProps> = ({
  originalImage,
  generatedImage,
  imageGenerationAvailable,
  imageGenerationMessage,
  generationPrompt,
  designInsights,
  analysis,
  preferences,
  variations,
  onSelectVariation,
  onRefinePrompt,
  onRegenerate,
  onStartOver,
  isRefining,
  isGenerating = false,
  onToast,
}) => {
  const [customRefinement, setCustomRefinement] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');

  // Hard validation requirement: Both generationSuccess and a valid generated image must exist
  const hasValidGeneratedResult = Boolean(
    generatedImage &&
    imageGenerationAvailable !== false &&
    (generatedImage.startsWith('data:image/') || generatedImage.startsWith('http://') || generatedImage.startsWith('https://'))
  );

  const handleQuickRefine = async (chip: string) => {
    try {
      await onRefinePrompt(chip);
      onToast(`Applied refinement: "${chip}"`, 'success');
    } catch {
      onToast('Failed to refine design. Please try again.', 'error');
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRefinement.trim() || isRefining) return;
    try {
      const prompt = customRefinement.trim();
      setCustomRefinement('');
      await onRefinePrompt(prompt);
      onToast(`Applied refinement: "${prompt}"`, 'success');
    } catch {
      onToast('Failed to apply custom refinement.', 'error');
    }
  };

  const handleDownload = () => {
    const target = generatedImage || originalImage;
    if (!target) return;
    const a = document.createElement('a');
    a.href = target;
    a.download = `roomrevive-${generatedImage ? 'redesign' : 'original'}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onToast('Interior visualization saved to downloads', 'success');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C6849] font-semibold block mb-1">
            Step 05 · Design Specification & Result
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
            {hasValidGeneratedResult ? 'Your Redesigned Space' : 'AI Design Specifications'}
          </h2>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isGenerating || isRefining}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDD5C9] bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Regenerate redesign"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#8C6849] ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          )}

          {hasValidGeneratedResult && (
            <>
              <a
                href="#shop-this-look-section"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8C6849] hover:bg-[#78573B] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Shop furniture and decor inspired by this look"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#F5EFE6]" />
                <span>Shop This Look</span>
              </a>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDD5C9] bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Download image"
              >
                <Download className="w-3.5 h-3.5 text-stone-600" />
                <span>Download</span>
              </button>
            </>
          )}

          <button
            onClick={onStartOver}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Start fresh redesign"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E3D5C5]" />
            <span>Start New Design</span>
          </button>
        </div>
      </div>

      {/* When Image Generation Failed or is Unavailable: CLEAR VALIDATION ERROR */}
      {!hasValidGeneratedResult && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-bold text-amber-950">
                AI image generation is currently unavailable. Please try again.
              </h3>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                {imageGenerationMessage ||
                  'Gemini successfully analyzed your room architecture and prepared structured interior specifications. Connect Pollinations image generation (via POLLINATIONS_API_KEY) to generate the visual result.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-900 text-white text-xs font-semibold hover:bg-amber-950 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Try Regenerate</span>
                  </button>
                )}
                {generationPrompt && (
                  <button
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="text-xs font-semibold text-amber-900 hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {showPrompt ? 'Hide Generation Prompt' : 'Inspect AI Generation Prompt'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {showPrompt && generationPrompt && (
            <div className="p-5 rounded-2xl bg-white border border-[#DDD5C9] space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
                <span>Structured Prompt Built from Room Analysis</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generationPrompt);
                    onToast('Prompt copied to clipboard', 'success');
                  }}
                  className="text-[#8C6849] hover:underline normal-case cursor-pointer"
                >
                  Copy Prompt
                </button>
              </div>
              <pre className="text-xs text-stone-700 whitespace-pre-wrap font-sans bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/60 leading-relaxed">
                {generationPrompt}
              </pre>
            </div>
          )}

          {/* Original Room Photograph Only — NO STOCK OR FAKE IMAGES */}
          <div className="relative rounded-2xl overflow-hidden border border-[#DDD5C9] bg-stone-900 shadow-md aspect-[16/10] max-h-[480px]">
            <img
              src={originalImage}
              alt="Original Room"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <span className="px-3.5 py-1.5 rounded-lg bg-black/75 backdrop-blur-md text-xs font-semibold text-white tracking-wide uppercase border border-white/10 shadow-sm">
                Original Room Reference
              </span>
            </div>
          </div>
        </div>
      )}

      {/* When Image Generation Succeeded: Main Visual Comparison Area */}
      {hasValidGeneratedResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Before & After Comparison
            </span>
            <div className="flex items-center gap-1 bg-[#EAE3D7] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'slider'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Interactive Slider</span>
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>
          </div>

          {viewMode === 'slider' ? (
            <ImageSlider
              originalImage={originalImage}
              generatedImage={generatedImage!}
              originalLabel="Original Room"
              generatedLabel={`AI Redesign (${preferences?.style || 'Modern'})`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#DDD5C9] bg-stone-900 shadow-sm aspect-[4/3]">
                <img
                  src={originalImage}
                  alt="Original Room"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 rounded-md bg-black/75 backdrop-blur-md text-xs font-semibold text-white uppercase tracking-wider">
                    Original Room
                  </span>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-[#DDD5C9] bg-stone-900 shadow-sm aspect-[4/3]">
                <img
                  src={generatedImage!}
                  alt="AI Redesigned Room"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 rounded-md bg-[#242220]/85 backdrop-blur-md text-xs font-semibold text-[#E3D5C5] uppercase tracking-wider border border-white/10">
                    AI Redesign ({preferences?.style || 'Modern'})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DESIGN VARIATIONS GALLERY */}
      {variations && variations.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C6849]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                Design Variations ({variations.length})
              </h4>
            </div>
            <span className="text-[11px] text-stone-500">
              Select a variation to preview or refine
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {variations.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVariation(v)}
                className={`group relative rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                  generatedImage === v.image
                    ? 'border-[#8C6849] ring-2 ring-[#8C6849]/30 shadow-sm'
                    : 'border-[#E3DBD0] hover:border-stone-400'
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={v.image}
                    alt={v.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2 bg-white">
                  <span className="text-xs font-bold text-stone-800 block truncate">
                    {v.label}
                  </span>
                  <span className="text-[10px] text-[#8C6849] block truncate">
                    {v.style}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SHOP THIS LOOK (Rendered below the generated room design) */}
      {hasValidGeneratedResult && (
        <ShopThisLook
          generatedImage={generatedImage!}
          roomType={preferences?.room || analysis?.roomType}
          style={preferences?.style}
          onToast={onToast}
        />
      )}

      {/* DESIGN SPECIFICATION FLOW: Original -> AI Analysis -> Selected Requirements -> Redesign Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: AI Architectural Analysis Summary */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FAF5EE] text-[#8C6849] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-[#1F1E1D]">
                AI Architectural Analysis
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[#8C6849] bg-[#FAF5EE] px-2.5 py-1 rounded-full border border-[#EAE1D3]">
              Gemini Flash
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Detected Space</span>
              <span className="font-semibold text-stone-800">{analysis?.roomType || preferences?.room || 'Living Room'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Flooring</span>
              <span className="font-semibold text-stone-800">{analysis?.flooringType || 'Hardwood / Neutral Planks'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Lighting Exposure</span>
              <span className="font-semibold text-stone-800">{analysis?.lightingCondition || 'Natural diffused daylight'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Existing Style</span>
              <span className="font-semibold text-stone-800">{analysis?.existingStyle || 'Transitional Neutral'}</span>
            </div>
            {analysis?.approximateLayout && (
              <div className="py-1.5 border-b border-stone-100 space-y-1">
                <span className="text-stone-500 font-medium block">Spatial Layout</span>
                <p className="text-stone-700 leading-relaxed">{analysis.approximateLayout}</p>
              </div>
            )}
            {analysis?.suggestedImprovements && analysis.suggestedImprovements.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <span className="text-stone-500 font-medium block">Key Improvement Areas</span>
                <ul className="space-y-1">
                  {analysis.suggestedImprovements.slice(0, 2).map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-stone-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6849] shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Selected Requirements & Constraints */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FAF5EE] text-[#8C6849] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-[#1F1E1D]">
                Selected Requirements
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Hard Constraints Enforced
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">
                Room Function (Hard Constraint)
              </span>
              <span className="text-xs font-bold text-stone-900 block">
                {preferences?.room || 'Living Room'}
              </span>
              <span className="text-[10px] text-[#8C6849] block">
                Preserved functional furniture purpose
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">
                Interior Style
              </span>
              <span className="text-xs font-bold text-stone-900 block">
                {preferences?.style || 'Modern'}
              </span>
              <span className="text-[10px] text-stone-500 block">
                Determines aesthetic & textures
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">
                Color Mood
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
                  style={{ backgroundColor: preferences?.customColor || '#C7A785' }}
                />
                <span className="font-semibold text-stone-800">
                  {preferences?.colorMood || 'Warm'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">
                Lighting Atmosphere
              </span>
              <span className="font-semibold text-stone-800">
                {preferences?.lighting || 'Warm 2700K'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">
                Furniture Approach
              </span>
              <span className="font-semibold text-stone-800">
                {preferences?.furniturePreference || 'Keep existing'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">
                Budget Tier
              </span>
              <span className="font-semibold text-stone-800">
                {preferences?.budget || 'Moderate'}
              </span>
            </div>

            {preferences?.userInstructions && (
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] space-y-1 col-span-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">
                  Custom Instructions
                </span>
                <p className="text-xs text-stone-700 italic">
                  "{preferences.userInstructions}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Refinement & Regeneration Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3DBD0] shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F2EDE5] text-[#8C6849] flex items-center justify-center">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#1F1E1D]">
              Refine Your Interior
            </h3>
            <p className="text-xs text-stone-500">
              Iterate on specific materials, add accents, or alter lighting while preserving the room's function.
            </p>
          </div>
        </div>

        {/* Quick refinement prompt chips */}
        <div className="flex flex-wrap gap-2">
          {QUICK_REFINEMENTS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isRefining || !hasValidGeneratedResult}
              onClick={() => handleQuickRefine(chip)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#FAF8F5] hover:bg-[#F0EAE1] text-stone-700 border border-[#E3DDD2] hover:border-[#8C6849] transition-all cursor-pointer disabled:opacity-50"
            >
              + {chip}
            </button>
          ))}
        </div>

        {/* Custom text refinement input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-2">
          <input
            type="text"
            value={customRefinement}
            onChange={(e) => setCustomRefinement(e.target.value)}
            disabled={isRefining || !hasValidGeneratedResult}
            placeholder={
              hasValidGeneratedResult
                ? `e.g. "Add a large fluted pendant light and a travertine side table by the window"`
                : 'Configure image generation to enable visual refinements'
            }
            className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#DDD5C9] bg-[#FAF8F5] focus:outline-none focus:border-[#8C6849] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!customRefinement.trim() || isRefining || !hasValidGeneratedResult}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Apply Refinement</span>
          </button>
        </form>
      </div>

      {/* Structured Design Insights Section */}
      {designInsights && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8C6849]" />
            <h3 className="font-serif-luxury text-xl font-bold text-[#1F1E1D]">
              Architectural Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Changes Made */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3DBD0] space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8C6849]" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                  Architectural Adjustments
                </h4>
              </div>
              <ul className="space-y-2.5">
                {designInsights.changesMade.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6849] shrink-0 mt-1.5" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Color Palette */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3DBD0] space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#8C6849]" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                  Color Harmony Palette
                </h4>
              </div>
              <div className="space-y-3">
                {designInsights.colorPalette.map((swatch, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-stone-200 shadow-xs shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div>
                        <span className="text-xs font-semibold text-stone-800 block">
                          {swatch.name}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          {swatch.role}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-stone-600 bg-[#FAF8F5] px-2 py-0.5 rounded border border-stone-200">
                      {swatch.hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Recommended Furniture */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3DBD0] space-y-4">
              <div className="flex items-center gap-2">
                <Sofa className="w-4 h-4 text-[#8C6849]" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                  Recommended Pieces
                </h4>
              </div>
              <div className="space-y-3">
                {designInsights.recommendedFurniture.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">
                        {item.item}
                      </span>
                      {item.estimatedPrice && (
                        <span className="text-[11px] font-semibold text-[#8C6849]">
                          {item.estimatedPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">
                      <span className="font-medium text-stone-700">Placement:</span> {item.placement}
                    </p>
                    <p className="text-[11px] text-stone-600 leading-relaxed italic">
                      "{item.reason}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
