import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAppAuth } from '../hooks/useAppAuth';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { isClerkActive } = useAppAuth();
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      {/* Back navigation */}
      <div className="w-full max-w-md mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-[#8C6849] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E8E2D8] p-8 text-center">
        {/* Logo / Badge */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#8C6849] text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#1F1E1D]">
            RoomRevive
          </span>
        </div>
        <p className="text-xs text-stone-500 mb-6">
          Sign in to save and access your personalized interior redesigns
        </p>

        {isIframe && (
          <div className="mb-6 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-left text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 mb-0.5">Preview Iframe Notice</p>
              <p className="text-amber-700 leading-relaxed">
                If your browser restricts third-party cookies or popups in this preview pane, you can sign in directly below or open the full tab.
              </p>
            </div>
          </div>
        )}

        {/* Embedded Clerk SignIn component */}
        {isClerkActive ? (
          <div className="flex justify-center my-2">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/design"
              forceRedirectUrl="/design"
              appearance={{
                variables: {
                  colorPrimary: '#8C6849',
                  colorText: '#1F1E1D',
                  colorBackground: '#FFFFFF',
                  colorInputBackground: '#FAF8F5',
                  colorInputText: '#1F1E1D',
                  borderRadius: '0.75rem',
                  fontFamily: 'inherit',
                },
                elements: {
                  card: 'shadow-none border-0 p-0 w-full',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  formButtonPrimary: 'bg-[#8C6849] hover:bg-[#78573C] text-sm font-semibold rounded-xl py-2.5 transition-colors',
                  footerActionText: 'text-xs text-stone-500',
                  footerActionLink: 'text-xs text-[#8C6849] font-medium hover:underline',
                },
              }}
            />
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-stone-600 mb-4">
              Clerk authentication is operating in guest mode. You can continue designing without creating an account!
            </p>
            <button
              onClick={() => navigate('/design')}
              className="w-full py-2.5 px-4 bg-[#8C6849] hover:bg-[#78573C] text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
            >
              Continue to AI Designer
            </button>
          </div>
        )}

        {/* Guest Alternative */}
        <div className="mt-6 pt-5 border-t border-[#F0EAE1]">
          <button
            type="button"
            onClick={() => navigate('/design')}
            className="w-full py-2 px-3 text-xs text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5] border border-dashed border-stone-300 rounded-xl transition-colors cursor-pointer"
          >
            Explore as Guest without signing in →
          </button>
        </div>
      </div>
    </div>
  );
};
