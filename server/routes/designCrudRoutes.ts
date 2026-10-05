import { Router } from 'express';
import { requireAuthMiddleware } from '../middleware/authMiddleware.js';
import {
  getUserDesigns,
  getDesignById,
  createDesign,
  deleteDesign,
  getUserStats,
} from '../controllers/designCrudController.js';

const router = Router();

// All design CRUD endpoints require authentication
router.use(requireAuthMiddleware);

router.get('/', getUserDesigns);
router.get('/user/stats', getUserStats);
router.get('/:id', getDesignById);
router.post('/', createDesign);
router.delete('/:id', deleteDesign);

export default router;
