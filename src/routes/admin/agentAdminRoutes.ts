import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireAdmin } from '../../middlewares/requireAdmins';
import {
  listAgentsAdminController,
  getAgentByIdAdminController,
  createAgentAdminController,
  updateAgentAdminController,
  deleteAgentAdminController,
  toggleAgentStatusAdminController,
} from '../../controllers/admin/agentAdminController';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/', listAgentsAdminController);
router.get('/:id', getAgentByIdAdminController);
router.post('/', createAgentAdminController);
router.patch('/:id', updateAgentAdminController);
router.delete('/:id', deleteAgentAdminController);
router.patch('/:id/toggle-active', toggleAgentStatusAdminController);

export default router;
