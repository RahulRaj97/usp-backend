import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireAdmin } from '../../middlewares/requireAdmins';
import {
  createProgrammeAdmin,
  listProgrammesAdminController,
  getProgrammeByIdAdmin,
  updateProgrammeAdmin,
  deleteProgrammeAdmin,
} from '../../controllers/admin/programmeAdminController';

const router = Router();
const upload = multer();

// All admin endpoints require JWT + admin role
router.use(authenticate, requireAdmin);

// POST   /api/admin/programmes
router.post('/', upload.array('images'), createProgrammeAdmin);

// GET    /api/admin/programmes
router.get('/', listProgrammesAdminController);

// GET    /api/admin/programmes/:id
router.get('/:id', getProgrammeByIdAdmin);

// PUT    /api/admin/programmes/:id
router.put('/:id', upload.array('images'), updateProgrammeAdmin);

// DELETE /api/admin/programmes/:id
router.delete('/:id', deleteProgrammeAdmin);

export default router;
