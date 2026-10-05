import React, { useState } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { AuthInitializer } from './AuthInitializer';
import { AuthContext, fallbackGuestAuth, AppAuthContextValue } from '../context/AuthContext';
import { isClerkConfigured } from '../hooks/useAppAuth';
import { ErrorBoundary } from './ErrorBoundary';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * ClerkBridge mounts strictly inside <ClerkProvider />.
 * It safely accesses Clerk's useAuth() hook and synchronizes it with our global AuthContext.
 */
const ClerkBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clerkAuth = useAuth();

  const authValue: AppAuthContextValue = {
    isLoaded: clerkAuth.isLoaded,
    isSignedIn: Boolean(clerkAuth.isSignedIn),
    userId: clerkAuth.userId || null,
    sessionId: clerkAuth.sessionId || null,
    getToken: clerkAuth.getToken,
    signOut: clerkAuth.signOut,
    isClerkActive: true,
  };

  return (
    <AuthContext.Provider value={authValue}>
      <AuthInitializer>{children}</AuthInitializer>
    </AuthContext.Provider>
  );
};

export const ClerkProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clerkFailed, setClerkFailed] = useState(false);

  // If Clerk is not configured or failed to load in this environment, provide fallback guest auth
  if (!isClerkConfigured || !publishableKey || clerkFailed) {
    return (
      <AuthContext.Provider value={fallbackGuestAuth}>
        <AuthInitializer>{children}</AuthInitializer>
      </AuthContext.Provider>
    );
  }

  const fallbackUi = (
    <AuthContext.Provider value={fallbackGuestAuth}>
      <AuthInitializer>{children}</AuthInitializer>
    </AuthContext.Provider>
  );

  return (
    <ErrorBoundary
      fallback={fallbackUi}
      onError={(err) => {
        console.warn('[Clerk] Failed to initialize in current iframe/environment. Falling back to guest mode:', err.message);
        setClerkFailed(true);
      }}
    >
      <ClerkProvider
        publishableKey={publishableKey}
        signInFallbackRedirectUrl="/design"
        signUpFallbackRedirectUrl="/design"
        appearance={{
          variables: {
            colorPrimary: '#8C6849',
            colorText: '#1F1E1D',
            colorBackground: '#FAF8F5',
            colorInputBackground: '#FFFFFF',
            colorInputText: '#1F1E1D',
            borderRadius: '0.5rem',
            fontFamily: 'inherit',
          },
          elements: {
            card: 'border border-[#E8E2D8] shadow-md bg-[#FAF8F5]',
            navbar: 'border-b border-[#E8E2D8]',
          },
        }}
      >
        <ClerkBridge>{children}</ClerkBridge>
      </ClerkProvider>
    </ErrorBoundary>
  );
};
