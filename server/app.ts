import express from 'express';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import designRoutes from './routes/designRoutes.js';
import designCrudRoutes from './routes/designCrudRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { getTempImage } from './services/imageStore.js';
import { getStoredImagePath } from './services/imageStorageService.js';
import { connectDB, isDbConnected } from './db/connection.js';

dotenv.config();

// Ensure both CLERK_PUBLISHABLE_KEY and VITE_CLERK_PUBLISHABLE_KEY are populated
const clerkPubKey = (process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY)?.trim();
const clerkSecKey = process.env.CLERK_SECRET_KEY?.trim();

if (clerkPubKey) {
  process.env.CLERK_PUBLISHABLE_KEY = clerkPubKey;
  process.env.VITE_CLERK_PUBLISHABLE_KEY = clerkPubKey;
}

const app = express();

// Clerk Express Middleware strictly scoped to /api endpoints
if (clerkPubKey && clerkPubKey.startsWith('pk_')) {
  app.use('/api', clerkMiddleware({ publishableKey: clerkPubKey, secretKey: clerkSecKey }));
}

// Enable large JSON payloads for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Persistent stored image serving route
app.get('/api/images/:filename', (req, res) => {
  const stored = getStoredImagePath(req.params.filename);
  if (!stored) {
    return res.status(404).send('Image not found or removed');
  }
  res.setHeader('Content-Type', stored.mimeType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(stored.filePath);
});

// Temporary image serving route for preview or cache
app.get('/api/images/temp/:id', (req, res) => {
  const item = getTempImage(req.params.id);
  if (!item) {
    return res.status(404).send('Image not found or expired');
  }
  res.setHeader('Content-Type', item.mimeType);
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.send(item.buffer);
});

// API Routes
app.use('/api/design', designRoutes);
app.use('/api/designs', designCrudRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/shop', shopRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RoomRevive AI',
    database: isDbConnected() ? 'connected' : 'disconnected/in-memory',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
