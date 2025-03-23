import express from 'express';
import multer from 'multer';
import {
  createProgrammeController,
  getProgrammeByIdController,
  updateProgrammeController,
  deleteProgrammeController,
  getAllProgrammesController,
} from '../controllers/programmeController';

const router = express.Router();

const upload = multer();

router.post('/', upload.array('images'), createProgrammeController);

router.get('/', getAllProgrammesController);

router.get('/:id', getProgrammeByIdController);

router.put('/:id', upload.array('images'), updateProgrammeController);

router.delete('/:id', deleteProgrammeController);

export default router;
