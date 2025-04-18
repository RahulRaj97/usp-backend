import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireAdmin } from '../../middlewares/requireAdmins';
import multer from 'multer';
import {
  listUniversitiesAdminController,
  getUniversityByIdAdmin,
  createUniversityAdmin,
  updateUniversityAdmin,
  deleteUniversityAdmin,
} from '../../controllers/admin/universityAdminController';

const router = Router();
const upload = multer();

router.use(authenticate, requireAdmin);

router.get('/', listUniversitiesAdminController);
router.get('/:id', getUniversityByIdAdmin);
router.post('/', upload.single('logo'), createUniversityAdmin);
router.patch('/:id', upload.single('logo'), updateUniversityAdmin);
router.delete('/:id', deleteUniversityAdmin);

export default router;
