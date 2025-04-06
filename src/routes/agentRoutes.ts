import { Router } from 'express';
import {
  deleteAgentController,
  verifyOTPController,
  updateAgentController,
  getAllAgentsController,
  getAgentByIdController,
  createAgentController,
  registerAgentController,
  toggleAgentStatusController,
} from '../controllers/agentController';
import { uploadToS3 } from '../services/s3Uploader';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

const uploadUserImage = uploadToS3('users');

// Public route - Parent agent registration
router.post('/register', registerAgentController);

// Public route - Verify OTP
router.post('/verify-otp', verifyOTPController);

// Protected route - Only parent agents can create sub-agents/agents
router.post('/', authenticate, createAgentController);

// Get all agents (Admin only)
router.get('/', authenticate, getAllAgentsController);

// Get agent by ID
router.get('/:id', authenticate, getAgentByIdController);

// Update agent details
router.put(
  '/:id',
  authenticate,
  uploadUserImage.single('profileImage'),
  updateAgentController,
);

// Toggle agent status (Only Parent or Sub-Agent)
router.put('/:id/toggle-status', authenticate, toggleAgentStatusController);

// Delete an agent (Admin only)
router.delete('/:id', authenticate, deleteAgentController);

export default router;
