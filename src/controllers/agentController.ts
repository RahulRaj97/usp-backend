import { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  createAgent as createAgentService,
  getAllAgents as getAllAgentsService,
  getAgentById as getAgentByIdService,
  updateAgent as updateAgentService,
  deleteAgent as deleteAgentService,
} from '../services/agentService';

import { NotFoundError, BadRequestError } from '../utils/appError';
import { StatusCodes } from '../utils/httpStatuses';

/**
 * Create an agent
 */
export const createAgent: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
      return next(
        new BadRequestError(
          'firstName, lastName, email, password, and role are required.',
        ),
      );
    }

    const agent = await createAgentService(req.body);
    res.status(StatusCodes.CREATED).json(agent);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all agents
 */
export const getAllAgents: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const agents = await getAllAgentsService();
    res.status(StatusCodes.OK).json(agents);
  } catch (error) {
    next(error);
  }
};

/**
 * Get an agent by ID
 */
export const getAgentById: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const agent = await getAgentByIdService(id);
    if (!agent) {
      return next(new NotFoundError(`Agent with id ${id} not found`));
    }
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an agent by ID
 */
export const updateAgent: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const agent = await updateAgentService(id, req.body);
    if (!agent) {
      return next(new NotFoundError(`Agent with id ${id} not found`));
    }
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an agent by ID
 */
export const deleteAgent: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const agent = await deleteAgentService(id);
    if (!agent) {
      return next(new NotFoundError(`Agent with id ${id} not found`));
    }
    res.status(StatusCodes.OK).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    next(error);
  }
};
