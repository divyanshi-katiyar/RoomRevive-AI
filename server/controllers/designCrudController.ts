import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Design } from '../models/Design.js';
import { isDbConnected } from '../db/connection.js';
import { saveImageReference } from '../services/imageStorageService.js';

// In-memory fallback design storage when MongoDB is temporarily disconnected
const fallbackDesignsMap = new Map<string, any>();

/**
 * GET /api/designs
 * Fetches designs belonging ONLY to the currently authenticated user.
 */
export const getUserDesigns = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (isDbConnected()) {
    try {
      const designs = await Design.find({ userId }).sort({ createdAt: -1 });
      return res.json(designs);
    } catch (err: any) {
      console.warn('[DesignCRUD] Notice: Using fallback store for designs query:', err?.message || err);
    }
  }

  // Fallback to in-memory store
  const userDesigns = Array.from(fallbackDesignsMap.values())
    .filter((d) => d.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json(userDesigns);
};

/**
 * GET /api/designs/:id
 * Fetches a single design, strictly scoped to the authenticated user.
 */
export const getDesignById = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const design = await Design.findOne({ _id: id, userId });
      if (design) {
        return res.json(design);
      }
    } catch (err: any) {
      console.warn('[DesignCRUD] Notice: Checking fallback store for design ID:', id);
    }
  }

  const inMem = fallbackDesignsMap.get(id);
  if (inMem && inMem.userId === userId) {
    return res.json(inMem);
  }

  return res.status(404).json({
    error: 'Design not found or you do not have permission to view this design',
  });
};

/**
 * POST /api/designs
 * Saves a new design to MongoDB Atlas associated with the authenticated user.
 * Explicitly executes Design.create() using the Mongoose model.
 */
export const createDesign = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId || req.body?.userId;
  if (!userId) {
    console.warn('[MongoDB Persist] Save rejected: Unauthenticated request');
    return res.status(401).json({ error: 'Authentication required to save designs' });
  }

  try {
    const {
      originalImageUrl,
      generatedImageUrl,
      roomType,
      selectedStyle,
      colorPreference,
      lightingPreference,
      furniturePreference,
      budget,
      customInstructions,
      roomAnalysis,
      generationPrompt,
      designInsights,
      variations,
      refinementHistory,
      title,
    } = req.body;

    if (!originalImageUrl || !generatedImageUrl) {
      console.warn('[MongoDB Persist] Save rejected: Missing required image URLs');
      return res.status(400).json({ error: 'originalImageUrl and generatedImageUrl are required' });
    }

    console.log(`[MongoDB Persist] Persisting design for user: ${userId} (${selectedStyle} ${roomType})...`);

    // Persist image references instead of storing huge base64 in MongoDB
    const storedOriginalUrl = await saveImageReference(originalImageUrl, 'orig');
    const storedGeneratedUrl = await saveImageReference(generatedImageUrl, 'gen');

    const defaultTitle = `${selectedStyle || 'Modern'} ${roomType || 'Room'}`;
    const designPayload = {
      userId,
      title: title || defaultTitle,
      originalImageUrl: storedOriginalUrl,
      generatedImageUrl: storedGeneratedUrl,
      roomType: roomType || 'Living Room',
      selectedStyle: selectedStyle || 'Modern',
      colorPreference: colorPreference || 'Warm',
      lightingPreference: lightingPreference || 'Natural',
      furniturePreference: furniturePreference || 'Keep existing',
      budget: budget || 'Moderate',
      customInstructions: customInstructions || '',
      roomAnalysis: roomAnalysis || null,
      generationPrompt: generationPrompt || '',
      designInsights: designInsights || null,
      variations: variations || [],
      refinementHistory: refinementHistory || [],
    };

    // Explicit Mongoose Design.create execution
    const newDesign = await Design.create(designPayload);
    const documentId = newDesign._id.toString();

    console.log(`[MongoDB Persist] SUCCESS: Document persisted to MongoDB Atlas! _id: ${documentId} (userId: ${userId})`);

    // Keep session cache updated as well
    fallbackDesignsMap.set(documentId, newDesign.toObject ? newDesign.toObject() : newDesign);

    return res.status(201).json({
      success: true,
      id: documentId,
      mongoId: documentId,
      _id: documentId,
      design: newDesign,
    });
  } catch (err: any) {
    console.error('[MongoDB Persist] FAILURE: Failed to persist design to MongoDB Atlas:', err?.message || err);
    return res.status(500).json({
      error: 'Failed to persist design to MongoDB Atlas: ' + (err?.message || String(err)),
      details: err?.message,
    });
  }
};

/**
 * DELETE /api/designs/:id
 * Deletes a design, strictly scoped to the authenticated user.
 */
export const deleteDesign = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let deleted = false;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const result = await Design.findOneAndDelete({ _id: id, userId });
      if (result) {
        deleted = true;
        console.log(`[MongoDB Persist] Deleted document ${id} for user ${userId}`);
      }
    } catch (err: any) {
      console.warn('[DesignCRUD] Notice: Checking fallback store for deletion of ID:', id);
    }
  }

  if (fallbackDesignsMap.has(id)) {
    const item = fallbackDesignsMap.get(id);
    if (item.userId === userId) {
      fallbackDesignsMap.delete(id);
      deleted = true;
    }
  }

  if (deleted) {
    return res.json({ success: true, message: 'Design deleted successfully', id });
  }

  return res.status(404).json({
    error: 'Design not found or you do not have permission to delete this design',
  });
};

/**
 * GET /api/designs/user/stats
 * Returns the authenticated user's current generation stats.
 */
export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const totalDesigns = isDbConnected()
      ? await Design.countDocuments({ userId })
      : Array.from(fallbackDesignsMap.values()).filter((d) => d.userId === userId).length;

    return res.json({
      dailyLimit: 20,
      usedToday: totalDesigns,
      remainingToday: Math.max(0, 20 - totalDesigns),
    });
  } catch (err: any) {
    return res.json({
      dailyLimit: 20,
      usedToday: 0,
      remainingToday: 20,
    });
  }
};
