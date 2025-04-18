import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../utils/httpStatuses';
import {
  adminCreateApplication,
  listApplicationsAdmin,
  adminUpdateApplication,
  adminDeleteApplication,
  adminWithdrawApplication,
  AdminApplicationDto,
  AdminApplicationFilters,
  getApplicationById,
} from '../../services/applicationService';

/**
 * Admin: get one application by ID
 */
export const getApplicationByIdAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const app = await getApplicationById(req.params.id);
    res.status(StatusCodes.OK).json(app);
  } catch (err) {
    next(err);
  }
};

export const createApplicationAdmin = async (
  req: Request<{}, {}, AdminApplicationDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const app = await adminCreateApplication(req.body);
    res.status(StatusCodes.CREATED).json(app);
  } catch (err) {
    next(err);
  }
};

export const listApplicationsAdminController = async (
  req: Request<{}, {}, {}, AdminApplicationFilters>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters: AdminApplicationFilters = {
      page: parseInt(req.query.page as any) || 1,
      limit: parseInt(req.query.limit as any) || 10,
      status: req.query.status as any,
      stage: req.query.stage as any,
      studentId: req.query.studentId as string,
      agentId: req.query.agentId as string,
      companyId: req.query.companyId as string,
    };
    const result = await listApplicationsAdmin(filters);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateApplicationAdmin = async (
  req: Request<{ id: string }, {}, Partial<AdminApplicationDto>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updated = await adminUpdateApplication(req.params.id, req.body);
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteApplicationAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await adminDeleteApplication(req.params.id);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

export const withdrawApplicationAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const app = await adminWithdrawApplication(req.params.id);
    res.status(StatusCodes.OK).json(app);
  } catch (err) {
    next(err);
  }
};
