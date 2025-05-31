// src/routes/studentRoutes.ts
import express from 'express';
import {
  createStudentController,
  updateStudentController,
  deleteStudentController,
  getStudentByIdController,
  listStudentsController,
} from '../controllers/studentController';
import { authenticate } from '../middlewares/authMiddleware';
import multer from 'multer';

const router = express.Router();

const upload = multer();

router.post(
  '/',
  authenticate,
  upload.array('documents'),
  createStudentController,
);

router.put(
  '/:id',
  authenticate,
  upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'documents' }]),
  updateStudentController,
);

router.delete('/:id', authenticate, deleteStudentController);
router.get('/:id', authenticate, getStudentByIdController);
router.get('/', authenticate, listStudentsController);

export default router;
