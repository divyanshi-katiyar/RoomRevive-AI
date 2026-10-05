import { Router } from 'express';
import {
  analyzeRoomController,
  generateDesignController,
  refineDesignController,
} from '../controllers/designController.js';
import { requireAuthMiddleware } from '../middleware/authMiddleware.js';
import { generationLimitMiddleware } from '../middleware/generationLimitMiddleware.js';

const router = Router();

// Protect all AI room design routes with Clerk authentication
router.post('/analyze', requireAuthMiddleware, analyzeRoomController);
router.post('/generate', requireAuthMiddleware, generationLimitMiddleware, generateDesignController);
router.post('/refine', requireAuthMiddleware, generationLimitMiddleware, refineDesignController);

export default router;
