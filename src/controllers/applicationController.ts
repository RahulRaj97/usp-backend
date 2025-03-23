import { Request, Response, NextFunction } from 'express';
import {
  createApplication,
  listApplications,
  getApplicationById,
} from '../services/applicationService';
import { StatusCodes } from '../utils/httpStatuses';
import { getAgentByUserId } from '../services/agentService';

export const createApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId, programmeIds, priorityMapping } = req.body;
    const user = req.user;
    if (!user) {
      throw new Error('User not found');
    }
    const agent = await getAgentByUserId(user.id);
    const app = await createApplication(
      `${agent._id}`,
      studentId,
      programmeIds,
      priorityMapping,
    );
    res.status(StatusCodes.CREATED).json(app);
  } catch (error) {
    next(error);
  }
};

export const listApplicationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      studentId: req.query.studentId as string,
      companyId: req.query.companyId as string,
    };
    const user = req.user;
    if (!user) throw new Error('User not found');
    const agent = await getAgentByUserId(user.id);
    const result = await listApplications(`${agent._id}`, filters);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getApplicationByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const application = await getApplicationById(req.params.id);
    res.status(StatusCodes.OK).json(application);
  } catch (error) {
    next(error);
  }
};
