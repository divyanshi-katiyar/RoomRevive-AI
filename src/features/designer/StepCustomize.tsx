import React from 'react';
import {
  InteriorStyle,
  ColorMood,
  LightingType,
  FurnitureApproach,
  BudgetTier,
} from '../../types';
import {
  INTERIOR_STYLES,
  ROOM_TYPES,
  COLOR_MOODS,
  LIGHTING_OPTIONS,
  FURNITURE_OPTIONS,
  BUDGET_TIERS,
} from '../../utils/presets';
import {
  Sparkles,
  Palette,
  Sun,
  Sofa,
  DollarSign,
  PenTool,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export interface CustomizePreferences {
  room: string;
  style: InteriorStyle;
  colorMood: ColorMood;
  customColor: string;
  lighting: LightingType;
  furniturePreference: FurnitureApproach;
  budget: BudgetTier;
  userInstructions: string;
}

interface StepCustomizeProps {
  preferences: CustomizePreferences;
  onChange: (updates: Partial<CustomizePreferences>) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

export const StepCustomize: React.FC<StepCustomizeProps> = ({
  preferences,
  onChange,
  onGenerate,
  onBack,
  isGenerating,
}) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8C6849] font-semibold">
          Step 03 · Design Direction
        </span>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
          Tailor Your Interior Vision
        </h2>
        <p className="text-sm text-stone-500">
          Select architectural styles, lighting atmosphere, and specific instructions for the redesign.
        </p>
      </div>

      <div className="space-y-10">
        {/* Section 1: Room Type */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
              Room Type & Function <span className="text-[#8C6849] font-normal text-[11px]">(Hard Constraint)</span>
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Target Function: {preferences.room}
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            Select your desired room type and function for the redesign:
          </p>
          <div className="flex flex-wrap gap-2">
            {ROOM_TYPES.map((type) => {
              const isSelected = preferences.room === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ room: type })}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#242220] text-white shadow-sm ring-1 ring-stone-900'
                      : 'bg-white text-stone-700 border border-[#E3DDD2] hover:border-[#8C6849]'
                  }`}
                >
                  <span>{type}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Interior Style (Visual Cards) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
              Interior Style Concept
            </label>
            <span className="text-xs text-[#8C6849] font-medium">
              Selected: {preferences.style}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {INTERIOR_STYLES.map((style) => {
              const isSelected = preferences.style === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onChange({ style: style.id })}
                  className={`group relative rounded-2xl overflow-hidden border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#242220] ring-2 ring-[#242220] shadow-md'
                      : 'border-[#E4DDD3] bg-white hover:border-[#8C6849]'
                  }`}
                >
                  <div className="aspect-[16/10] overflow-hidden bg-stone-100 relative">
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#242220] text-white flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-stone-900 mb-0.5">
                      {style.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">
                      {style.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Color Mood & Custom Hex */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#8C6849]" />
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Color Palette & Mood
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {COLOR_MOODS.map((mood) => {
              const isSelected = preferences.colorMood === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => onChange({ colorMood: mood.id })}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#242220] bg-white ring-2 ring-[#242220] shadow-sm'
                      : 'border-[#E4DDD3] bg-white hover:border-[#8C6849]'
                  }`}
                >
                  <span className="text-xs font-semibold text-stone-900 block mb-2">
                    {mood.name}
                  </span>
                  <div className="flex items-center gap-1.5 mb-2">
                    {mood.hexCodes.map((hex, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-stone-200"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-500 block line-clamp-1">
                    {mood.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Optional Custom Accent Picker */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-stone-500">Custom Accent Color:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={preferences.customColor || '#C7A785'}
                onChange={(e) => onChange({ customColor: e.target.value })}
                className="w-7 h-7 rounded-md cursor-pointer border border-stone-300 p-0.5 bg-white"
              />
              <input
                type="text"
                value={preferences.customColor || '#C7A785'}
                onChange={(e) => onChange({ customColor: e.target.value })}
                placeholder="#C7A785"
                className="w-24 text-xs font-mono px-2 py-1 rounded-md border border-[#DDD5C9] bg-white text-stone-800"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Lighting & Furniture Approach */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lighting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#8C6849]" />
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Lighting Atmosphere
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {LIGHTING_OPTIONS.map((light) => {
                const isSelected = preferences.lighting === light.id;
                return (
                  <button
                    key={light.id}
                    type="button"
                    onClick={() => onChange({ lighting: light.id })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#242220] bg-white ring-2 ring-[#242220]'
                        : 'border-[#E4DDD3] bg-white hover:border-[#8C6849]'
                    }`}
                  >
                    <span className="text-xs font-semibold text-stone-800 block">
                      {light.title}
                    </span>
                    <span className="text-[10px] text-stone-500 block line-clamp-1">
                      {light.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Furniture Preference */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sofa className="w-4 h-4 text-[#8C6849]" />
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Furniture Approach
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {FURNITURE_OPTIONS.map((opt) => {
                const isSelected = preferences.furniturePreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ furniturePreference: opt.id })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#242220] bg-white ring-2 ring-[#242220]'
                        : 'border-[#E4DDD3] bg-white hover:border-[#8C6849]'
                    }`}
                  >
                    <span className="text-xs font-semibold text-stone-800 block">
                      {opt.title}
                    </span>
                    <span className="text-[10px] text-stone-500 block line-clamp-1">
                      {opt.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 5: Budget Tier */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#8C6849]" />
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Budget Target
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BUDGET_TIERS.map((tier) => {
              const isSelected = preferences.budget === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onChange({ budget: tier.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#242220] bg-white ring-2 ring-[#242220]'
                      : 'border-[#E4DDD3] bg-white hover:border-[#8C6849]'
                  }`}
                >
                  <span className="text-xs font-semibold text-stone-800 block">
                    {tier.title}
                  </span>
                  <span className="text-[10px] text-stone-500 block line-clamp-1">
                    {tier.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 6: Custom Designer Instructions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[#8C6849]" />
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Custom Instructions (Optional)
            </label>
          </div>
          <textarea
            rows={3}
            value={preferences.userInstructions}
            onChange={(e) => onChange({ userInstructions: e.target.value })}
            placeholder='e.g. "Keep my sofa but make the room warmer, add lush plants, and create concealed storage along the east wall."'
            className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#DDD5C9] bg-white focus:outline-none focus:border-[#8C6849] placeholder:text-stone-400"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E8E2D8]">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#DDD5C9] text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Analysis</span>
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={onGenerate}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#E3D5C5]" />
                <span>Generating your redesigned room...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#E3D5C5]" />
                <span>Generate AI Redesign</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
