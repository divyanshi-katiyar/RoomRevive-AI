import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, Paintbrush, Compass, SunMedium } from 'lucide-react';

const GENERATING_STEPS = [
  'Synthesizing architectural wall structure and perspectives...',
  'Curating balanced color harmonies and natural material textures...',
  'Simulating ambient 2700K lighting and diffuse window illumination...',
  'Styling bespoke furniture silhouettes and artisanal decor...',
  'Polishing photorealistic interior visualization...',
];

export const StepGenerate: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % GENERATING_STEPS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-20 max-w-xl mx-auto text-center space-y-8 animate-in fade-in duration-300">
      {/* Animated Icon Cluster */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#EAE2D7] animate-ping opacity-30" />
        <div className="w-20 h-20 rounded-2xl bg-[#242220] text-[#E3D5C5] flex items-center justify-center shadow-xl relative z-10">
          <Sparkles className="w-9 h-9 animate-spin text-[#E3D5C5]" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#8C6849] font-semibold">
          Step 04 · AI Rendering
        </span>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
          Bringing Your Interior Vision to Life
        </h2>
        <p className="text-sm font-medium text-stone-700 min-h-[24px] transition-all">
          {GENERATING_STEPS[stepIndex]}
        </p>
      </div>

      {/* Atmospheric Pillars */}
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto pt-4 text-[11px] text-stone-500">
        <div className="p-2.5 rounded-xl bg-white border border-[#E4DDD3]">
          <Layers className="w-4 h-4 text-[#8C6849] mx-auto mb-1" />
          <span>True Geometry</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E4DDD3]">
          <SunMedium className="w-4 h-4 text-[#8C6849] mx-auto mb-1" />
          <span>Soft Lighting</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E4DDD3]">
          <Paintbrush className="w-4 h-4 text-[#8C6849] mx-auto mb-1" />
          <span>Curated Craft</span>
        </div>
      </div>
    </div>
  );
};
