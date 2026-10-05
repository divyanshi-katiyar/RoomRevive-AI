export { useAppAuth, type AppAuthContextValue as AppAuthReturn } from '../context/AuthContext';

export const isClerkConfigured = Boolean(
  typeof import.meta !== 'undefined' &&
  import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY &&
  typeof import.meta.env.VITE_CLERK_PUBLISHABLE_KEY === 'string' &&
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_')
);
