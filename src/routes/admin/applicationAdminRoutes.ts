import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireAdmin } from '../../middlewares/requireAdmins';
import {
  createApplicationAdmin,
  listApplicationsAdminController,
  updateApplicationAdmin,
  deleteApplicationAdmin,
  withdrawApplicationAdmin,
  getApplicationByIdAdmin,
} from '../../controllers/admin/applicationAdminController';

const router = Router();

// All admin endpoints require a valid token + admin role
router.use(authenticate, requireAdmin);

// CRUD + withdraw under /api/admin/applications
router.get('/:id', getApplicationByIdAdmin);
router.post('/', createApplicationAdmin);
router.get('/', listApplicationsAdminController);
router.put('/:id', updateApplicationAdmin);
router.delete('/:id', deleteApplicationAdmin);
router.patch('/:id/withdraw', withdrawApplicationAdmin);

export default router;
