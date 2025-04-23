import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  listProgrammesForAgentController,
  getProgrammeByIdForAgentController,
} from '../controllers/programmeController';

const router = Router();

router.use(authenticate);

router.get('/', listProgrammesForAgentController);
router.get('/:id', getProgrammeByIdForAgentController);

export default router;
