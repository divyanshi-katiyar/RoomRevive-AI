import { Router } from 'express';
import {
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from '../controllers/projectController.js';

const router = Router();

router.get('/', getProjectsController);
router.get('/:id', getProjectByIdController);
router.patch('/:id', updateProjectController);
router.delete('/:id', deleteProjectController);

export default router;
