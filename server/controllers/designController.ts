import { Request, Response, NextFunction } from 'express';
import { designService } from '../services/designService.js';
import { recordSuccessfulGeneration } from '../middleware/generationLimitMiddleware.js';
import { Design } from '../models/Design.js';
import { isDbConnected } from '../db/connection.js';
import { saveImageReference } from '../services/imageStorageService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const analyzeRoomController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }
    const result = await designService.analyzeRoom(image);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const generateDesignController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required to generate designs' });
  }

  try {
    const {
      originalImage,
      roomAnalysis,
      room,
      style,
      colorTone,
      colorMood,
      customColor,
      lighting,
      furniturePreference,
      budget,
      userInstructions,
      saveToStudio,
    } = req.body;

    if (!originalImage) {
      return res.status(400).json({ error: 'Original image is required' });
    }

    const result = await designService.generateDesign({
      originalImage,
      roomAnalysis,
      room,
      style: style || 'Modern',
      colorTone: colorTone || colorMood || 'Warm',
      colorMood: colorMood || colorTone || 'Warm',
      customColor,
      lighting: lighting || 'Warm',
      furniturePreference: furniturePreference || 'Keep existing',
      budget: budget || 'Moderate',
      userInstructions,
      saveToStudio: saveToStudio ?? true,
    });

    // Record generation usage and persist to MongoDB Atlas ONLY AFTER image generation succeeds
    if (result.success && (result.generatedImage || result.imageUrl)) {
      await recordSuccessfulGeneration(userId);

      const finalGeneratedImg = result.generatedImage || result.imageUrl;
      const storedOriginalUrl = await saveImageReference(originalImage, 'orig');
      const storedGeneratedUrl = await saveImageReference(finalGeneratedImg, 'gen');
      const defaultTitle = `${style || 'Modern'} ${room || 'Room'}`;

      if (isDbConnected()) {
        try {
          console.log(`[MongoDB Persist] Saving generated design to Atlas for user ${userId}...`);
          const savedDoc = await Design.create({
            userId,
            title: defaultTitle,
            originalImageUrl: storedOriginalUrl,
            generatedImageUrl: storedGeneratedUrl,
            roomType: room || 'Living Room',
            selectedStyle: style || 'Modern',
            colorPreference: colorTone || colorMood || 'Warm',
            lightingPreference: lighting || 'Natural',
            furniturePreference: furniturePreference || 'Keep existing',
            budget: budget || 'Moderate',
            customInstructions: userInstructions || '',
            roomAnalysis: result.analysis || roomAnalysis || null,
            generationPrompt: result.generationPrompt || '',
            designInsights: result.designInsights || null,
            variations: result.variations || [],
            refinementHistory: [],
          });

          const docId = savedDoc._id ? savedDoc._id.toString() : null;
          if (!docId) {
            throw new Error('Mongoose Design.create did not return a valid document _id');
          }

          console.log(`[MongoDB Persist] SUCCESS: Design persisted to MongoDB Atlas with _id: ${docId} (user: ${userId})`);
          (result as any).mongoDesignId = docId;
          (result as any).savedDesignId = docId;
          (result as any).persistedToAtlas = true;
          (result as any).savedDesign = savedDoc;
        } catch (dbErr: any) {
          console.error('[MongoDB Persist] FAILURE: Failed to save design to MongoDB Atlas:', dbErr?.message || dbErr);
          (result as any).persistedToAtlas = false;
          (result as any).persistenceError = dbErr?.message || String(dbErr);
        }
      } else {
        console.warn('[MongoDB Persist] WARNING: Database is disconnected. Design not persisted to Atlas.');
        (result as any).persistedToAtlas = false;
        (result as any).persistenceError = 'MongoDB Atlas cluster is disconnected';
      }
    }

    res.json(result);
  } catch (err: any) {
    const rawMsg = err?.message || String(err);
    console.error('[DesignController] Design generation handler error:', rawMsg);
    const userMessage =
      rawMsg && !rawMsg.includes('{') && rawMsg.length < 200
        ? rawMsg
        : 'AI image generation is currently unavailable. Please try again.';
    res.status(500).json({
      generationSuccess: false,
      generatedImage: null,
      error: userMessage,
      details: rawMsg,
    });
  }
};

export const refineDesignController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required to refine designs' });
  }

  try {
    const { projectId, currentImage, originalImage, refinementPrompt, currentStyle } = req.body;
    if (!currentImage || !refinementPrompt) {
      return res.status(400).json({ error: 'currentImage and refinementPrompt are required' });
    }

    const result = await designService.refineDesign({
      projectId,
      currentImage,
      originalImage,
      refinementPrompt,
      currentStyle,
    });

    if (result.refinedImage) {
      await recordSuccessfulGeneration(userId);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};
