import { RequestHandler } from 'express';
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
export const createAgent: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      throw new BadRequestError('name, email, and phone are required fields');
    }

    const agent = await createAgentService(req.body);
    res.status(StatusCodes.CREATED).json(agent);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all agents
 */
export const getAllAgents: RequestHandler = async (_, res, next) => {
  try {
    const agents = await getAllAgentsService();
    res.status(StatusCodes.OK).json(agents);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get an agent by ID
 */
export const getAgentById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await getAgentByIdService(id);
    if (!agent) {
      throw new NotFoundError(`Agent with id ${id} not found`);
    }
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    return next(error);
  }
};

/**
 * Update an agent by ID
 */
export const updateAgent: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await updateAgentService(id, req.body);
    if (!agent) {
      throw new NotFoundError(`Agent with id ${id} not found`);
    }
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete an agent by ID
 */
export const deleteAgent: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await deleteAgentService(id);
    if (!agent) {
      throw new NotFoundError(`Agent with id ${id} not found`);
    }
    res.status(StatusCodes.OK).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
