import { Router } from 'express';
import {
  loginUser,
  refreshToken,
  logoutUser,
  getUserDetails,
} from '../controllers/authController';
import { authenticate } from './../middlewares/authMiddleware';

const router = Router();

router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getUserDetails);
router.post('/logout', authenticate, logoutUser);

export default router;
