import { Request, Response, NextFunction } from 'express';

import { AppError } from '../utils/appError';
import { StatusCodes } from '../utils/httpStatuses';

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
  }
  console.error('Unexpected error:', err);
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Something went wrong.',
  });
}
