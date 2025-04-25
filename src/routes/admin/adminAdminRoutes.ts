import { Router } from 'express';
import {
  loginUser,
  logoutUser,
  refreshToken,
} from '../../controllers/authController';
import { authenticate } from '../../middlewares/authMiddleware';
import {
  createAdminController,
  getAdminByIdController,
  updateAdminController,
} from '../../controllers/admin/adminController';
import { uploadToS3 } from '../../services/s3Uploader';
import multer from 'multer';

const router = Router();

router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logoutUser);

router.get('/:id', authenticate, getAdminByIdController);

const memoryUpload = multer();

router.post('/', memoryUpload.single('profileImage'), createAdminController);

// ↓ Update uses multer-s3, subPath = req.params.id
const uploadForUpdate = uploadToS3('users', (req) => req.params.id);

router.put(
  '/:id',
  authenticate,
  uploadForUpdate.single('profileImage'),
  updateAdminController,
);

export default router;
