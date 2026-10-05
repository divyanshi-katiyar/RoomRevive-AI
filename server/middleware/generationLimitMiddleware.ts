import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import { Usage } from '../models/Usage.js';
import { isDbConnected } from '../db/connection.js';

// In-memory fallback tracking if MongoDB is disconnected
const inMemoryUsageMap = new Map<string, { count: number; date: string }>();

export function getDailyLimit(): number {
  const envLimit = process.env.DAILY_GENERATION_LIMIT;
  if (envLimit) {
    const parsed = parseInt(envLimit, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 15; // default daily limit per user
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

/**
 * Checks if the user has reached their daily generation limit.
 */
export async function checkGenerationLimit(
  userId: string
): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
  const limit = getDailyLimit();
  const date = getTodayKey();

  if (isDbConnected()) {
    try {
      const record = await Usage.findOne({ userId, date });
      const currentCount = record ? record.count : 0;
      return {
        allowed: currentCount < limit,
        currentCount,
        limit,
      };
    } catch (err) {
      console.warn('[LimitMiddleware] Database query failed, using in-memory tracker:', err);
    }
  }

  // Fallback to in-memory map
  const key = `${userId}_${date}`;
  const current = inMemoryUsageMap.get(key);
  const currentCount = current ? current.count : 0;

  return {
    allowed: currentCount < limit,
    currentCount,
    limit,
  };
}

/**
 * Increments generation count for a user after a successful generation.
 */
export async function recordSuccessfulGeneration(userId: string): Promise<number> {
  const date = getTodayKey();
  let newCount = 1;

  if (isDbConnected()) {
    try {
      const record = await Usage.findOneAndUpdate(
        { userId, date },
        { $inc: { count: 1 }, $set: { lastGeneratedAt: new Date() } },
        { upsert: true, new: true }
      );
      if (record) newCount = record.count;
    } catch (err) {
      console.warn('[LimitMiddleware] Failed to persist usage in DB:', err);
    }
  }

  // Also update in-memory
  const key = `${userId}_${date}`;
  const current = inMemoryUsageMap.get(key);
  const updated = (current?.count || 0) + 1;
  inMemoryUsageMap.set(key, { count: updated, date });

  return newCount;
}

/**
 * Express middleware to prevent abuse before starting expensive generation.
 */
export const generationLimitMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // If user is authenticated, track by Clerk userId; otherwise fallback to client IP
  const identifier = req.userId || req.ip || 'anonymous';

  try {
    const { allowed, currentCount, limit } = await checkGenerationLimit(identifier);

    if (!allowed) {
      return res.status(429).json({
        error: `Daily generation limit of ${limit} designs reached. Please try again tomorrow to renew your allowance.`,
        code: 'GENERATION_LIMIT_EXCEEDED',
        limit,
        current: currentCount,
        resetsAt: '00:00 UTC',
      });
    }

    next();
  } catch (err) {
    console.error('[LimitMiddleware] Error evaluating generation limits:', err);
    next(); // Don't block user if tracking check encounters unexpected error
  }
};
