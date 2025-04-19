import { Router } from 'express';
import {
  loginUser,
  logoutUser,
  refreshToken,
} from '../../controllers/authController';
import { authenticate } from '../../middlewares/authMiddleware';
import {
  createAdminController,
  updateAdminController,
} from '../../controllers/admin/adminController';

const router = Router();

router.post('/login', loginUser);
router.post('/refresh', authenticate, refreshToken);
router.post('/logout', authenticate, logoutUser);
router.post('/', createAdminController);
router.put('/:id', authenticate, updateAdminController);

export default router;
