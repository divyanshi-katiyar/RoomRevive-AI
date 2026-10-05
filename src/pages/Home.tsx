import React from 'react';
import { Link } from 'react-router-dom';
import { ImageSlider } from '../components/ImageSlider';
import {
  Sparkles,
  Layers,
  Compass,
  Palette,
  Wand2,
  Sliders,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  MoveRight,
} from 'lucide-react';
import { INTERIOR_STYLES } from '../utils/presets';

export const Home: React.FC = () => {
  const heroBefore = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80';
  const heroAfter = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80';

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE2D7] text-[#5C4530] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#8C6849]" />
            <span>Turn your ideas into beautiful spaces with AI</span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1F1E1D] leading-[1.1]">
            Reimagine Your Space with AI
          </h1>

          <p className="text-base sm:text-xl text-stone-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Upload a photo of any room and transform it into a stunning, architecturally preserved interior design with modern AI vision.
          </p>

          {/* Primary CTA Button */}
          <div className="flex items-center justify-center pt-4">
            <Link
              to="/design"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-[#242220] hover:bg-[#383532] text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#E3D5C5]" />
              <span>Redesign My Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Hero Interactive Visual Demonstration (Before vs After) */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="p-3 sm:p-4 rounded-3xl bg-[#FAF8F5] border border-[#DDD5C9] shadow-2xl">
            <ImageSlider
              originalImage={heroBefore}
              generatedImage={heroAfter}
              originalLabel="Original Room"
              generatedLabel="Scandinavian Warm Concept"
            />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase tracking-widest text-[#8C6849] font-semibold">
            Capabilities
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1F1E1D]">
            Intelligent Interior Transformation
          </h2>
          <p className="text-sm text-stone-600">
            A harmonious bridge between your existing room architecture and curated world-class interior styles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs space-y-4 hover:border-[#8C6849] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#8C6849]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#1F1E1D]">
              AI Room Redesign
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Upload a room photo and transform its interior style while preserving structural walls, window vectors, and perspective.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs space-y-4 hover:border-[#8C6849] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#8C6849]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#1F1E1D]">
              Smart Room Analysis
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              AI automatically identifies furniture items, existing wall colors, flooring materials, daylight angles, and spatial layout opportunities.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs space-y-4 hover:border-[#8C6849] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#8C6849]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#1F1E1D]">
              Function & Style Harmony
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Target room functions are preserved as hard constraints. Your workspace stays a workspace, your bedroom stays a bedroom.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs space-y-4 hover:border-[#8C6849] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#8C6849]">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#1F1E1D]">
              Style Exploration
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Instantly try Scandinavian, Japandi, Minimalist, Luxury, Industrial, and Bohemian styles to find the perfect aesthetic synergy.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs space-y-4 hover:border-[#8C6849] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#8C6849]">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#1F1E1D]">
              AI Refinement
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Tell AI exactly what you want changed: "Make it warmer", "Add plants", "Change flooring", or replace individual furniture items.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl bg-white border border-[#E3DBD0] shadow-xs space-y-4 hover:border-[#8C6849] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#8C6849]">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#1F1E1D]">
              Design Variations
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Generate multiple distinctive design concepts simultaneously with curated color palettes and recommended furniture pieces.
            </p>
          </div>
        </div>
      </section>

      {/* Style Showcase Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#8C6849] font-semibold block mb-1">
              Curated Aesthetics
            </span>
            <h2 className="font-serif-luxury text-3xl font-bold text-[#1F1E1D]">
              Explore Signature Styles
            </h2>
          </div>
          <Link
            to="/design"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C6849] hover:text-[#5C4530] transition-colors"
          >
            <span>Start designing with these styles</span>
            <MoveRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INTERIOR_STYLES.slice(0, 4).map((style) => (
            <Link
              key={style.id}
              to={`/design?style=${style.id}`}
              className="group rounded-2xl overflow-hidden border border-[#E3DBD0] bg-white hover:border-[#8C6849] hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={style.image}
                  alt={style.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-serif-luxury text-lg font-bold text-stone-900 group-hover:text-[#8C6849] transition-colors">
                  {style.name}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-1">
                  {style.subtitle}
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {style.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] text-stone-600 bg-[#FAF8F5] px-2 py-0.5 rounded border border-stone-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Room Redesign CTA Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#242220] text-white p-8 sm:p-14 overflow-hidden relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-widest text-[#E3D5C5] font-semibold block">
                Instant AI Room Makeover
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold leading-tight">
                Transform Any Room in Seconds
              </h2>
              <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed">
                Take a photo of your living room, home office, or bedroom. Gemini vision analyzes room proportions, lighting, and layout, while the generative diffusion engine produces a tailored redesign in your favorite interior style.
              </p>
              <div className="pt-2">
                <Link
                  to="/design"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-stone-950 font-semibold text-xs sm:text-sm hover:bg-stone-100 transition-colors shadow-lg cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#8C6849]" />
                  <span>Start Room Redesign</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80"
                alt="Scandinavian Room Redesign"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
