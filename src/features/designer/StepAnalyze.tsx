import React, { useState } from 'react';
import { RoomAnalysisData } from '../../types';
import { ROOM_TYPES } from '../../utils/presets';
import {
  Sparkles,
  Sofa,
  Palette,
  SunMedium,
  Compass,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Tag,
  HelpCircle,
  Layers,
  Check,
  Edit3,
  Info,
} from 'lucide-react';

interface StepAnalyzeProps {
  image: string;
  analysis: RoomAnalysisData | null;
  isLoading: boolean;
  onProceed: () => void;
  selectedRoomType?: string;
  onSelectRoomType?: (roomType: string) => void;
  onReanalyze?: () => void;
}

export const StepAnalyze: React.FC<StepAnalyzeProps> = ({
  image,
  analysis,
  isLoading,
  onProceed,
  selectedRoomType,
  onSelectRoomType,
}) => {
  if (isLoading || !analysis) {
    return (
      <div className="py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EFE9DF] flex items-center justify-center text-[#8C6849] animate-pulse">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif-luxury text-2xl font-semibold text-[#1F1E1D]">
            Deconstructing Room Architecture & Function
          </h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Gemini is evaluating functional objects, workstation vs lounge layouts, lighting vectors, and architectural cues...
          </p>
        </div>
        <div className="max-w-xs mx-auto h-1.5 bg-[#EAE2D7] rounded-full overflow-hidden">
          <div className="h-full bg-[#8C6849] rounded-full animate-indeterminate"></div>
        </div>
      </div>
    );
  }

  const confidencePct =
    analysis.confidence !== undefined
      ? Math.round(analysis.confidence * 100)
      : null;

  const isHighConfidence = (analysis.confidence ?? 0.8) >= 0.8;
  const isAmbiguous =
    analysis.roomType === 'Unknown/Ambiguous' ||
    (analysis.confidence !== undefined && analysis.confidence < 0.5) ||
    Boolean(analysis.alternativeTypes && analysis.alternativeTypes.length > 0 && (analysis.confidence ?? 1) < 0.7);

  const [showRoomPicker, setShowRoomPicker] = useState(false);

  const effectiveRoomType =
    selectedRoomType && selectedRoomType !== 'Unknown/Ambiguous'
      ? selectedRoomType
      : analysis.roomType !== 'Unknown/Ambiguous'
      ? analysis.roomType
      : analysis.alternativeTypes?.[0]?.type || 'Workspace';

  const isUserConfirmed = Boolean(
    selectedRoomType && selectedRoomType !== 'Unknown/Ambiguous'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8C6849] font-semibold">
          Step 02 · Smart Room Analysis
        </span>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
          AI Architectural & Functional Audit
        </h2>
        <p className="text-sm text-stone-500">
          Our vision model analyzed functional evidence, primary furniture layout, and materials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Original Room Image with Analysis Badge */}
        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#DDD5C9] shadow-sm bg-stone-900 sticky top-24">
          <img
            src={image}
            alt="Analyzed Room"
            className="w-full aspect-[4/3] object-cover"
          />
          <div className="p-4 bg-[#FAF8F5] border-t border-[#DDD5C9] flex items-center justify-between text-xs">
            <span className="text-stone-500">Target Space</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">{effectiveRoomType}</span>
              {isUserConfirmed ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Confirmed
                </span>
              ) : confidencePct !== null ? (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isAmbiguous
                      ? 'bg-amber-100 text-amber-800'
                      : isHighConfidence
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {confidencePct}% confidence
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right: Structural Analysis Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#E4DDD3] relative group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                  Room Function
                </span>
                <div className="flex items-center gap-1">
                  {isUserConfirmed && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Confirmed
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowRoomPicker((prev) => !prev)}
                    className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors text-[10px] flex items-center gap-0.5"
                    title="Change target room function"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{showRoomPicker ? 'Close' : 'Change'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-800 block truncate">
                  {effectiveRoomType}
                </span>
              </div>
              {confidencePct !== null && (
                <span className="text-[11px] text-stone-500 font-medium">
                  {confidencePct}% certainty
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E4DDD3]">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block mb-1">
                Existing Style
              </span>
              <span className="text-sm font-semibold text-stone-800 block truncate">
                {analysis.existingStyle}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E4DDD3] col-span-2 sm:col-span-1">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block mb-1">
                Flooring
              </span>
              <span className="text-sm font-semibold text-stone-800 block truncate">
                {analysis.flooringType}
              </span>
            </div>
          </div>

          {/* Quick Room Function Switcher (When toggled by user) */}
          {showRoomPicker && !isAmbiguous && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Select Desired Room Function:
                </span>
                <button
                  type="button"
                  onClick={() => setShowRoomPicker(false)}
                  className="text-xs text-stone-400 hover:text-stone-700"
                >
                  Done
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Workspace',
                  'Office',
                  'Study',
                  'Living Room',
                  'Bedroom',
                  'Studio / Multi-Purpose',
                  'Dining Room',
                  'Kitchen',
                ].map((type) => {
                  const isSelected = effectiveRoomType.toLowerCase() === type.toLowerCase();
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onSelectRoomType?.(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                        isSelected
                          ? 'bg-[#242220] text-white font-semibold ring-2 ring-stone-800'
                          : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <span>{type}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ambiguity notice & interactive room confirmation if multi-use room */}
          {isAmbiguous && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 space-y-4 shadow-sm animate-in fade-in">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm sm:text-base text-amber-950">
                      Ambiguous functional layout detected
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                      Multi-Use Space
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                    This space exhibits features across multiple room types. You can confirm your target room function below:
                  </p>
                </div>
              </div>

              {/* Guidelines explaining direct object-to-room identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-amber-100/60 border border-amber-200/80 text-amber-950">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-emerald-800 font-bold">➔</span>
                  <span>Sofa present ➔ <strong>Living Room</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-emerald-800 font-bold">➔</span>
                  <span>Laptop table / desk present ➔ <strong>Workspace</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-emerald-800 font-bold">➔</span>
                  <span>Bed present ➔ <strong>Bedroom</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-emerald-800 font-bold">➔</span>
                  <span>Gas / utensils present ➔ <strong>Kitchen</strong></span>
                </div>
              </div>

              {/* Instant 1-click room selection chips */}
              <div className="space-y-2 pt-2 border-t border-amber-200/80">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-900 block">
                  Confirm Your Target Room Function:
                </span>
                <div className="flex flex-wrap gap-2">
                  {/* Candidates from AI analysis */}
                  {analysis.alternativeTypes && analysis.alternativeTypes.length > 0 &&
                    analysis.alternativeTypes.map((alt, idx) => {
                      const isSelected = effectiveRoomType.toLowerCase() === alt.type.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onSelectRoomType?.(alt.type)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                            isSelected
                              ? 'bg-[#242220] text-white ring-2 ring-stone-800'
                              : 'bg-white text-stone-800 border border-amber-300 hover:bg-amber-100/60'
                          }`}
                        >
                          <span>{alt.type}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {Math.round(alt.confidence * 100)}% match
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}

                  {/* Standard functional room options */}
                  {[
                    'Workspace',
                    'Office',
                    'Study',
                    'Living Room',
                    'Bedroom',
                    'Studio / Multi-Purpose',
                    'Dining Room',
                    'Kitchen',
                  ].map((type) => {
                    const alreadyShown = analysis.alternativeTypes?.some(
                      (a) => a.type.toLowerCase() === type.toLowerCase()
                    );
                    if (alreadyShown) return null;
                    const isSelected = effectiveRoomType.toLowerCase() === type.toLowerCase();
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onSelectRoomType?.(type)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                          isSelected
                            ? 'bg-[#242220] text-white font-semibold ring-2 ring-stone-800'
                            : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span>{type}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status and quick proceed */}
              <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Selected target: <strong className="text-emerald-950 underline">{effectiveRoomType}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onProceed}
                  className="px-4 py-2 rounded-lg bg-[#242220] text-white text-xs font-semibold hover:bg-[#383532] transition-colors cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <span>Confirm as {effectiveRoomType} & Proceed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Functional Evidence & Detected Objects */}
          {((analysis.evidence && analysis.evidence.length > 0) ||
            (analysis.detectedObjects && analysis.detectedObjects.length > 0)) && (
            <div className="p-4 rounded-xl bg-white border border-[#E4DDD3] space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8C6849]" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Functional Classification Evidence
                </h4>
              </div>

              {analysis.evidence && analysis.evidence.length > 0 && (
                <div className="space-y-1.5">
                  {analysis.evidence.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {analysis.detectedObjects && analysis.detectedObjects.length > 0 && (
                <div className="border-t border-[#EFE9DF] pt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                      Detected Objects
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.detectedObjects.map((obj, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#ECE5DC] text-[11px] text-stone-700 font-medium capitalize"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.alternativeTypes && analysis.alternativeTypes.length > 0 && (
                <div className="border-t border-[#EFE9DF] pt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Layers className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                      Alternative Potential Types
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.alternativeTypes.map((alt, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-stone-50 border border-stone-200 text-xs text-stone-600"
                      >
                        {alt.type}: <span className="font-semibold">{Math.round(alt.confidence * 100)}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lighting & Layout */}
          <div className="p-4 rounded-xl bg-white border border-[#E4DDD3] space-y-3">
            <div className="flex items-start gap-3">
              <SunMedium className="w-5 h-5 text-[#8C6849] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-stone-800 mb-0.5">
                  Natural Lighting & Exposure
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {analysis.lightingCondition}
                </p>
              </div>
            </div>

            <div className="border-t border-[#EFE9DF] pt-3 flex items-start gap-3">
              <Compass className="w-5 h-5 text-[#8C6849] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-stone-800 mb-0.5">
                  Spatial Arrangement & Circulation
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {analysis.approximateLayout}
                </p>
              </div>
            </div>
          </div>

          {/* Furniture Detected */}
          <div className="p-4 rounded-xl bg-white border border-[#E4DDD3] space-y-3">
            <div className="flex items-center gap-2">
              <Sofa className="w-4 h-4 text-[#8C6849]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Furniture Identified ({analysis.furniture.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {analysis.furniture.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#ECE5DC] text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-stone-800">{item.item}</span>
                  <span className="text-[11px] text-stone-500">{item.material}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Color Pigments & Empty Space */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color Swatches */}
            <div className="p-4 rounded-xl bg-white border border-[#E4DDD3] space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-[#8C6849]" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Detected Wall Tones
                </h4>
              </div>

              <div className="flex items-center gap-2.5">
                {analysis.wallColors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full border border-stone-300 shadow-xs"
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} (${color.hex})`}
                    />
                    <div className="text-[11px]">
                      <span className="font-mono text-stone-700 block">{color.hex}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="p-4 rounded-xl bg-white border border-[#E4DDD3] space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Spatial Opportunity
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {analysis.emptySpace || 'Ample negative space to establish curated focal layout.'}
              </p>
            </div>
          </div>

          {/* Next Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E4DDD3]">
            <div className="text-xs text-stone-500">
              Target Function: <strong className="text-stone-800 font-semibold">{effectiveRoomType}</strong>
              {isUserConfirmed ? ' (Confirmed)' : ''}
            </div>
            <button
              onClick={onProceed}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <span>Continue to Style Customization</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
