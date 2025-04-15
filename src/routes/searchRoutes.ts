import { Router } from 'express';
import { searchAllController } from '../controllers/searchController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, searchAllController);

export default router;
