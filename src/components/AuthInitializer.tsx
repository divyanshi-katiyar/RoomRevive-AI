import React, { useEffect } from 'react';
import { useAppAuth } from '../hooks/useAppAuth';
import { setAuthTokenGetter } from '../services/api';

/**
 * Initializes and syncs Clerk JWT token retrieval and userId with the Axios API client.
 * Ensures all requests to protected backend routes seamlessly include Authorization and x-user-id headers.
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken, isSignedIn, userId } = useAppAuth();

  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter(
        async () => {
          try {
            return await getToken();
          } catch {
            return null;
          }
        },
        userId || null
      );
    } else {
      setAuthTokenGetter(null, null);
    }
  }, [isSignedIn, getToken, userId]);

  return <>{children}</>;
};
