import React, { createContext, useContext } from 'react';

export interface AppAuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  isClerkActive: boolean;
}

export const fallbackGuestAuth: AppAuthContextValue = {
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  sessionId: null,
  getToken: async () => null,
  signOut: async () => {},
  isClerkActive: false,
};

export const AuthContext = createContext<AppAuthContextValue>(fallbackGuestAuth);

export const useAppAuth = (): AppAuthContextValue => {
  return useContext(AuthContext);
};
