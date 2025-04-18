import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/appError';

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== 'admin') {
    throw new UnauthorizedError('Admin access required');
  }
  next();
};
