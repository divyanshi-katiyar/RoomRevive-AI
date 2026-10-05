import app from '../server/app.js';
import { connectDB } from '../server/db/connection.js';

let dbInitPromise: Promise<boolean> | null = null;

/**
 * Vercel Serverless Function entry point for RoomRevive AI Express API.
 * Handles all requests routed to /api/* on Vercel deployments.
 */
export default async function handler(req: any, res: any) {
  if (!dbInitPromise) {
    dbInitPromise = connectDB().catch((err) => {
      console.warn('[Vercel Serverless] DB connection notice:', err?.message || err);
      return false;
    });
  }
  await dbInitPromise;

  // Normalizes URL in case Vercel rewrites strip the /api prefix
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
}
