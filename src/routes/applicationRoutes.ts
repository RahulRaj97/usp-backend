import { Router } from 'express';
import {
  createApplicationController,
  listApplicationsController,
  getApplicationByIdController,
} from '../controllers/applicationController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createApplicationController);
router.get('/', authenticate, listApplicationsController);
router.get('/:id', authenticate, getApplicationByIdController);

export default router;
