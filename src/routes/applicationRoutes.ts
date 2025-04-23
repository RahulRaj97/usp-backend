import { Router } from 'express';
import multer from 'multer';
import {
  createApplicationController,
  listApplicationsController,
  getApplicationByIdController,
  uploadSupportingDocsController,
} from '../controllers/applicationController';
import { authenticate } from '../middlewares/authMiddleware';

export const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post('/', authenticate, createApplicationController);
router.get('/', authenticate, listApplicationsController);
router.get('/:id', authenticate, getApplicationByIdController);
router.post(
  '/:id/supporting-documents',
  authenticate,
  upload.array('files', 10),
  uploadSupportingDocsController,
);

export default router;
