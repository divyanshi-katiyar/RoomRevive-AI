import React from 'react';
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { User, LogIn, UserPlus } from 'lucide-react';
import { useAppAuth } from '../hooks/useAppAuth';

export const NavbarAuth: React.FC = () => {
  const { isClerkActive } = useAppAuth();

  if (!isClerkActive) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-[#F1ECE4] border border-[#DDD5C9] rounded-lg opacity-80 cursor-default select-none"
          title="Guest Mode active (all features available)"
        >
          <User className="w-3.5 h-3.5 text-[#8C6849]" />
          <span className="hidden sm:inline">Guest Mode</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <Link
          to="/sign-in"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1F1E1D] hover:text-[#8C6849] bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#DDD5C9] rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          <LogIn className="w-3.5 h-3.5 text-[#8C6849]" />
          <span>Sign In</span>
        </Link>

        <Link
          to="/sign-up"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#8C6849] hover:bg-[#78573C] rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Sign Up</span>
        </Link>
      </SignedOut>

      <SignedIn>
        <div className="flex items-center gap-2 pl-1 border-l border-[#E8E2D8]">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-8 h-8 rounded-full border border-[#D5C7B7] shadow-xs',
                userButtonTrigger: 'focus:shadow-none focus:outline-hidden',
              },
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
};
