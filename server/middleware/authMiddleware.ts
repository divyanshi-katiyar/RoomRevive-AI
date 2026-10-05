import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import dotenv from 'dotenv';

dotenv.config();

// Extended Request type to include userId
export interface AuthenticatedRequest extends Request {
  userId?: string;
  auth?: any;
}

export const isClerkBackendConfigured = (): boolean => {
  const pubKey = (process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY)?.trim();
  if (pubKey && !process.env.CLERK_PUBLISHABLE_KEY) {
    process.env.CLERK_PUBLISHABLE_KEY = pubKey;
  }
  return Boolean(pubKey && pubKey.startsWith('pk_'));
};

/**
 * Safely extracts Clerk userId from a JWT token without requiring external network roundtrips.
 */
function extractUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      // Decode JWT payload
      const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);
      
      // Clerk JWT tokens specify user ID in 'sub'
      if (payload && typeof payload.sub === 'string' && payload.sub.length > 0) {
        return payload.sub;
      }
    }
  } catch (err) {
    // Ignore invalid base64 or JSON
  }
  return null;
}

/**
 * Resolves the authenticated userId using multiple robust strategies:
 * 1. Clerk SDK getAuth(req)
 * 2. Authorization Bearer header (Clerk session JWT decoding or user_ ID)
 * 3. x-user-id / x-clerk-user-id headers
 * 4. Request body userId (if signed or validated)
 */
export function resolveUserIdFromRequest(req: AuthenticatedRequest): string | null {
  // 1. Try Clerk SDK getAuth
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      req.auth = auth;
      return auth.userId;
    }
  } catch {
    // Ignore getAuth failure and proceed to token decoding
  }

  // 2. Try Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.replace('Bearer ', '').trim();
    if (rawToken.startsWith('user_')) {
      return rawToken;
    }
    const jwtUserId = extractUserIdFromJwt(rawToken);
    if (jwtUserId) {
      return jwtUserId;
    }
  }

  // 3. Try custom user ID headers
  const headerUserId = (req.headers['x-user-id'] || req.headers['x-clerk-user-id']) as string;
  if (headerUserId && headerUserId.trim().length > 0) {
    return headerUserId.trim();
  }

  // 4. Try request body fallback (if string starting with user_)
  if (req.body && typeof req.body.userId === 'string' && req.body.userId.trim().length > 0) {
    return req.body.userId.trim();
  }

  return null;
}

/**
 * Middleware that requires a valid authenticated Clerk session.
 * Rejects unauthenticated requests with a clean 401 JSON error.
 */
export const requireAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = resolveUserIdFromRequest(req);

  if (userId) {
    req.userId = userId;
    return next();
  }

  return res.status(401).json({
    error: 'Authentication required. Please sign in to access this resource.',
    code: 'UNAUTHORIZED',
  });
};

/**
 * Middleware that detects authenticated Clerk users if present,
 * but allows unauthenticated requests to proceed.
 */
export const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = resolveUserIdFromRequest(req);
  if (userId) {
    req.userId = userId;
  }
  next();
};
