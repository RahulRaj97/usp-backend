// routes/universityRoutes.ts
import express from 'express';
import {
  createUniversityController,
  getAllUniversitiesController,
  getUniversityByIdController,
  updateUniversityController,
  deleteUniversityController,
} from '../controllers/universityController';
import { uploadToS3 } from '../services/s3Uploader';

const router = express.Router();

const uploadUniversityLogo = uploadToS3('universities');

router.post(
  '/',
  uploadUniversityLogo.single('logo'),
  createUniversityController,
);
router.get('/', getAllUniversitiesController);
router.get('/:id', getUniversityByIdController);
router.put(
  '/:id',
  uploadUniversityLogo.single('logo'),
  updateUniversityController,
);
router.delete('/:id', deleteUniversityController);

export default router;
