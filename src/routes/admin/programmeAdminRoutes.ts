import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireAdmin } from '../../middlewares/requireAdmins';
import {
  listProgrammesAdminController,
  getProgrammeByIdAdminController,
  createProgrammeAdminController,
  updateProgrammeAdminController,
  deleteProgrammeAdminController,
} from '../../controllers/admin/programmeAdminController';

const router = Router();

router.use(authenticate, requireAdmin);

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', listProgrammesAdminController);
router.get('/:id', getProgrammeByIdAdminController);
router.post('/', upload.array('images'), createProgrammeAdminController);
router.put('/:id', upload.array('images'), updateProgrammeAdminController);
router.delete('/:id', deleteProgrammeAdminController);

export default router;
