import { Router } from 'express';
import {
  deleteAgentController,
  updateAgentController,
  getAllAgentsController,
  getAgentByIdController,
  createSubAgentController,
  registerAgentController,
  toggleAgentStatusController,
} from '../controllers/agentController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Public route - Parent agent registration
router.post('/register', registerAgentController);

// Protected route - Only parent agents can create sub-agents/agents
router.post('/', authenticate, createSubAgentController);

// Get all agents (Admin only)
router.get('/', authenticate, getAllAgentsController);

// Get agent by ID
router.get('/:id', authenticate, getAgentByIdController);

// Update agent details
router.put('/:id', authenticate, updateAgentController);

// Toggle agent status (Only Parent or Sub-Agent)
router.put('/:id/toggle-status', authenticate, toggleAgentStatusController);

// Delete an agent (Admin only)
router.delete('/:id', authenticate, deleteAgentController);

export default router;
