import { Request, Response, NextFunction } from 'express';
import {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
} from '../services/agentService';
import { StatusCodes } from '../utils/httpStatuses';

/**
 * Create a new Agent
 */
export const createAgentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await createAgent(req.body);
    res.status(StatusCodes.CREATED).json(agent);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Agents
 */
export const getAllAgentsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agents = await getAllAgents();
    res.status(StatusCodes.OK).json(agents);
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
 * Delete an Agent
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
