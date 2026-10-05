import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connects to MongoDB Atlas using Mongoose.
 * Explicitly connects to the 'roomrevive' database on the cluster specified by MONGODB_URI.
 * Logs connection status and database name securely without revealing credentials.
 */
export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.warn('[MongoDB Atlas] MONGODB_URI is not set in environment variables.');
    return false;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    // Mask credentials for secure logging
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.info(`[MongoDB Atlas] Initializing connection to cluster: ${maskedUri}...`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: 'roomrevive', // Explicit database name
    });

    isConnected = conn.connection.readyState === 1;
    const dbName = conn.connection.db ? conn.connection.db.databaseName : 'roomrevive';
    const host = conn.connection.host || 'MongoDB Atlas';

    console.info(
      `[MongoDB Atlas] SUCCESS: Connected to MongoDB Atlas cluster!\n` +
      `  - Host: ${host}\n` +
      `  - Database: "${dbName}"\n` +
      `  - ReadyState: ${conn.connection.readyState} (Connected)\n` +
      `  - Target Collections: "designs", "usages"`
    );

    return true;
  } catch (error: any) {
    isConnected = false;
    console.error(`[MongoDB Atlas] Connection error:`, error?.message || error);
    console.warn(
      '[MongoDB Atlas] Tip: Ensure "0.0.0.0/0" (Allow Access from Anywhere) is added to your MongoDB Atlas Network Access IP whitelist.'
    );
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

// Graceful connection lifecycle listeners
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB Atlas] Warning: Database connection disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.info('[MongoDB Atlas] Database connection re-established.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[MongoDB Atlas] Database connection error:', err?.message || err);
});
