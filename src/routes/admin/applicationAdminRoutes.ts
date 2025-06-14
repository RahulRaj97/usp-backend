import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireAdmin } from '../../middlewares/requireAdmins';
import {
  createApplicationAdmin,
  listApplicationsAdminController,
  updateApplicationAdmin,
  deleteApplicationAdmin,
  withdrawApplicationAdmin,
  getApplicationByIdAdmin,
  uploadSupportingDocsAdmin,
  setStageStatusAdmin,
  addCommentAdmin,
  updateCommentAdmin,
  deleteCommentAdmin,
} from '../../controllers/admin/applicationAdminController';

export const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// all admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// list before get-by-id
router.get('/', listApplicationsAdminController);
router.get('/:id', getApplicationByIdAdmin);

router.post('/', createApplicationAdmin);
router.put('/:id', updateApplicationAdmin);
router.patch('/:id/withdraw', withdrawApplicationAdmin);
router.patch('/:id/stage-status', setStageStatusAdmin);
router.delete('/:id', deleteApplicationAdmin);

// Comment routes
router.post('/:id/comments', addCommentAdmin);
router.put('/:id/comments/:commentIndex', updateCommentAdmin);
router.delete('/:id/comments/:commentIndex', deleteCommentAdmin);

router.post(
  '/:id/supporting-documents',
  upload.array('files', 10),
  uploadSupportingDocsAdmin,
);

export default router;
