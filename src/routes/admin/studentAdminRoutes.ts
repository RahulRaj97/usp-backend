import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireAdmin } from '../../middlewares/requireAdmins';
import multer from 'multer';
import {
  listStudentsAdminController,
  getStudentByIdAdminController,
  createStudentAdminController,
  updateStudentAdminController,
  deleteStudentAdminController,
} from '../../controllers/admin/studentAdminController';

const router = Router();
const upload = multer();

router.use(authenticate, requireAdmin);

router.get('/', listStudentsAdminController);
router.get('/:id', getStudentByIdAdminController);
router.post('/', upload.array('documents'), createStudentAdminController);
router.put('/:id', upload.array('documents'), updateStudentAdminController);
router.delete('/:id', deleteStudentAdminController);

export default router;
