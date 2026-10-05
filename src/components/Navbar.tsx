import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Layers, Compass, Plus, MessageSquare, Bookmark } from 'lucide-react';
import { NavbarAuth } from './NavbarAuth';

interface NavbarProps {
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAssistant }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-[#242220] flex items-center justify-center text-[#FAF8F5] transition-transform group-hover:scale-105 shadow-sm">
            <Layers className="w-5 h-5 text-[#E3D5C5]" />
          </div>
          <div>
            <span className="font-serif-luxury text-xl font-bold tracking-tight text-[#1F1E1D] block">
              RoomRevive <span className="font-sans font-light text-xs tracking-widest uppercase text-[#8C6849]">AI</span>
            </span>
            <span className="text-[11px] tracking-wide text-stone-500 hidden sm:block">
              See your space differently
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link
            to="/design"
            className={`transition-colors relative py-1 ${
              isActive('/design')
                ? 'text-[#1F1E1D] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#8C6849]'
                : 'text-stone-600 hover:text-[#1F1E1D]'
            }`}
          >
            AI Room Designer
          </Link>

          <Link
            to="/my-designs"
            className={`transition-colors relative py-1 flex items-center gap-1.5 ${
              isActive('/my-designs')
                ? 'text-[#1F1E1D] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#8C6849]'
                : 'text-stone-600 hover:text-[#1F1E1D]'
            }`}
          >
            <span>My Designs</span>
          </Link>

          <Link
            to="/studio"
            className={`transition-colors relative py-1 ${
              isActive('/studio')
                ? 'text-[#1F1E1D] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#8C6849]'
                : 'text-stone-600 hover:text-[#1F1E1D]'
            }`}
          >
            Design Studio
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-[#1F1E1D] bg-[#F1ECE4] hover:bg-[#EAE4DC] border border-[#DDD5C9] rounded-lg transition-colors cursor-pointer"
              title="Open AI Interior Assistant"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#8C6849]" />
              <span className="hidden lg:inline">Design Assistant</span>
            </button>
          )}

          <Link
            to="/design"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white bg-[#242220] hover:bg-[#383532] rounded-lg shadow-2xs transition-all hover:shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Design</span>
          </Link>

          {/* Clerk Authentication Controls */}
          <NavbarAuth />
        </div>
      </div>
    </header>
  );
};
