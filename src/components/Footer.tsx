import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1C1A18] text-[#D8D2C9] border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2E2B27] flex items-center justify-center text-[#E3D5C5]">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-serif-luxury text-xl font-bold tracking-tight text-white">
                RoomRevive AI
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              Transform your room photos into beautiful, personalized interior designs. An intuitive interior design companion powered by modern AI vision.
            </p>
            <div className="text-xs text-stone-500">
              Note: Designs are AI-generated interior interpretations for design inspiration and decorating guidance.
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300">Features</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/design" className="hover:text-white transition-colors">
                  AI Room Redesign
                </Link>
              </li>
              <li>
                <Link to="/studio" className="hover:text-white transition-colors">
                  Design Studio & History
                </Link>
              </li>
              <li>
                <span className="text-stone-500">Gemini Room Vision</span>
              </li>
              <li>
                <span className="text-stone-500">Curated Furniture Sourcing</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300">Aesthetics</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Scandinavian & Nordic</li>
              <li>Japandi & Wabi-Sabi</li>
              <li>Modern Minimalist</li>
              <li>Architectural Luxury</li>
              <li>Contemporary Organic</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} RoomRevive AI. See your space differently.</p>
          <div className="flex items-center gap-6">
            <span>Spatial Visual AI</span>
            <span>·</span>
            <span>Interior Design Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
