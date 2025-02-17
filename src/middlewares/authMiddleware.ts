import { Request, Response, NextFunction } from 'express';

import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/appError';
import { JwtPayload } from '../types/jwt';

/**
 * Middleware to authenticate user via JWT
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token missing or invalid');
  }
  const token = authHeader.split(' ')[1];
  const decoded: JwtPayload | null = verifyAccessToken(token);
  if (!decoded) {
    throw new UnauthorizedError('Invalid or expired token');
  }
  req.user = decoded;
  next();
};
