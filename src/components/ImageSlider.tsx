import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, Download, Sliders, Eye } from 'lucide-react';

interface ImageSliderProps {
  originalImage: string;
  generatedImage: string;
  originalLabel?: string;
  generatedLabel?: string;
  className?: string;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  originalImage,
  generatedImage,
  originalLabel = 'Original Space',
  generatedLabel = 'AI Redesign',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, handleMove]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `roomrevive-ai-design-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`relative select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#121110] flex flex-col items-center justify-center p-4 sm:p-8'
          : 'w-full'
      } ${className}`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="p-2.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
          title="Download AI Visualization"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Image Slider Wrapper */}
      <div
        ref={containerRef}
        onClick={(e) => handleMove(e.clientX)}
        className={`relative overflow-hidden rounded-2xl cursor-ew-resize bg-[#2A2724] border border-[#DDD5C9] shadow-xl ${
          isFullscreen ? 'w-full max-w-6xl max-h-[85vh] aspect-[16/10]' : 'w-full aspect-[4/3] sm:aspect-[16/10]'
        }`}
      >
        {/* Layer 1: Generated Image (Background) */}
        <img
          src={generatedImage}
          alt={generatedLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Layer 2: Original Image (Clipped Overlay) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={originalImage}
            alt={originalLabel}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Labels Overlay */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <span className="px-3 py-1.5 rounded-md bg-black/65 backdrop-blur-md text-xs font-semibold tracking-wide text-white uppercase border border-white/10 shadow-sm">
            {originalLabel}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
          <span className="px-3 py-1.5 rounded-md bg-[#8C6849]/90 backdrop-blur-md text-xs font-semibold tracking-wide text-white uppercase border border-white/20 shadow-sm">
            {generatedLabel}
          </span>
        </div>

        {/* Divider Line & Circular Grip */}
        <div
          className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div
            onMouseDown={handleMouseDown}
            onTouchMove={handleTouchMove}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-stone-900 shadow-xl flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing border-2 border-stone-800 hover:scale-105 transition-transform"
          >
            <Sliders className="w-4 h-4 rotate-90 text-stone-800" />
          </div>
        </div>
      </div>

      {/* Guidance bar below slider */}
      <div className="mt-3 flex items-center justify-between text-xs text-stone-500 px-1">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-stone-400" />
          Drag slider or tap anywhere to compare
        </span>
        <span className="font-mono text-[11px]">
          {Math.round(sliderPosition)}% Original / {Math.round(100 - sliderPosition)}% Redesign
        </span>
      </div>
    </div>
  );
};
