import { Request, Response, NextFunction } from 'express';
import {
  deleteAgent,
  updateAgent,
  getAllAgents,
  getAgentById,
  createSubAgent,
  createParentAgent,
  getAgentByUserId,
  toggleAgentStatus,
} from '../services/agentService';
import { StatusCodes } from '../utils/httpStatuses';
import { UnauthorizedError } from '../utils/appError';

/**
 * Register a Parent Agent (Public Route)
 */
export const registerAgentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { firstName, lastName, company, phone, email, password, address } =
      req.body;
    const agent = await createParentAgent({
      firstName,
      lastName,
      company,
      phone,
      email,
      password,
      address,
    });
    res.status(StatusCodes.CREATED).json(agent);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a Sub-Agent or Normal Agent (Only Parent & Sub-Agents)
 */
export const createSubAgentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subAgentData = req.body;
    const userId = req.user?.id || '';
    const { level, id: parentAgentId } = await getAgentByUserId(userId);
    if (level !== 'parent' && level !== 'sub-agent')
      throw new UnauthorizedError('You are not allowed to create agents');
    if (level === 'sub-agent' && subAgentData.level !== 'agent')
      throw new UnauthorizedError('Sub-agents can only create agents');
    const subAgent = await createSubAgent(parentAgentId, subAgentData);
    res.status(StatusCodes.CREATED).json(subAgent);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Agents
 */
export const getAllAgentsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.id || '';
    const loggedInAgent = await getAgentByUserId(userId);
    const paginatedResponse = await getAllAgents(
      loggedInAgent.level,
      loggedInAgent.id,
      loggedInAgent.company || '',
      Number(page),
      Number(limit),
    );
    res.status(StatusCodes.OK).json(paginatedResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Agent by ID
 */
export const getAgentByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await getAgentById(req.params.id);
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Agent Status (Only Parent and Sub-Agent)
 */
export const toggleAgentStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await toggleAgentStatus(id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an Agent
 */
export const updateAgentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedAgent = await updateAgent(req.params.id, req.body);
    res.status(StatusCodes.OK).json(updatedAgent);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an Agent (Admin Only)
 */
export const deleteAgentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteAgent(req.params.id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};
