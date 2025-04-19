import { Request, Response, NextFunction } from 'express';
import { createAdmin, updateAdmin } from '../../services/adminService';
import { StatusCodes } from '../../utils/httpStatuses';

export const createAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newAdmin = await createAdmin(req.body);
    res.status(StatusCodes.CREATED).json(newAdmin);
  } catch (err) {
    next(err);
  }
};

export const updateAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updated = await updateAdmin(req.params.id, req.body);
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};
