import { Router } from 'express';
import {
  createAgentController,
  getAllAgentsController,
  getAgentByIdController,
  updateAgentController,
  deleteAgentController,
} from '../controllers/agentController';

const router = Router();

router.route('/').post(createAgentController).get(getAllAgentsController);

router
  .route('/:id')
  .get(getAgentByIdController)
  .put(updateAgentController)
  .delete(deleteAgentController);

export default router;
