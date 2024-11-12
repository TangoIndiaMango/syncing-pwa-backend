import { Router } from 'express';
import { syncStoreProducts, syncTransactions } from '../controllers/sync.controller';

const router = Router();

router.post('/sync/store-products', syncStoreProducts);
router.post('/sync/transactions', syncTransactions);

export default router;
