import { Router } from 'express';
import { chatAssistantController } from '../controllers/assistantController.js';

const router = Router();

router.post('/chat', chatAssistantController);

export default router;
