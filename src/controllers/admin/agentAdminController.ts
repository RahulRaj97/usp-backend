import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../utils/httpStatuses';
import {
  listAgentsAdmin,
  adminCreateAgent,
  getAgentById,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
  AdminAgentFilters,
} from '../../services/agentService';
import { AgentLevel } from 'models/agentModel';

export const listAgentsAdminController = async (
  req: Request<{}, {}, {}, AdminAgentFilters>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = req.query;
    const filters: AdminAgentFilters = {
      role: q.role as AgentLevel,
      companyId: q.companyId,
      search: q.search,
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
    };
    const result = await listAgentsAdmin(filters);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAgentByIdAdminController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await getAgentById(req.params.id);
    res.status(StatusCodes.OK).json(agent);
  } catch (err) {
    next(err);
  }
};

export const createAgentAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await adminCreateAgent(req.body);
    res.status(StatusCodes.CREATED).json(agent);
  } catch (err) {
    next(err);
  }
};

export const updateAgentAdminController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updated = await updateAgent(req.params.id, req.body);
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteAgentAdminController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteAgent(req.params.id);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

export const toggleAgentStatusAdminController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await toggleAgentStatus(req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};
