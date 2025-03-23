// src/routes/companyRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import {
  updateCompanyController,
  getCompanyByIdController,
  getAllCompaniesController,
} from '../controllers/companyController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() }); // just store in memory,

router.get('/', authenticate, getAllCompaniesController);
router.get('/:id', authenticate, getCompanyByIdController);
router.put(
  '/:id',
  authenticate,
  upload.single('logo'),
  updateCompanyController,
);

export default router;
