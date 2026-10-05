import { Router } from 'express';
import {
  analyzeShopLookController,
  searchProductsController,
  getShopLookController,
  getProviderInfoController,
} from '../controllers/shopController.js';

const router = Router();

router.post('/analyze', analyzeShopLookController);
router.post('/search', searchProductsController);
router.post('/look', getShopLookController);
router.get('/provider', getProviderInfoController);

export default router;
