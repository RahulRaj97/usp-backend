// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';

import { AppError } from '../utils/appError';
import { StatusCodes, ReasonPhrases } from '../utils/httpStatuses';

export function globalErrorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  // 1) If it's one of our AppError, respond as defined
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // 2) Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      statusCode: StatusCodes.BAD_REQUEST,
      message: messages.join('. '),
    });
  }

  // 3) Mongoose cast errors (invalid ObjectId, etc.)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      statusCode: StatusCodes.BAD_REQUEST,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // 4) Mongo duplicate‑key errors
  if (err instanceof MongoServerError && err.code === 11000) {
    // extract the key and value
    const [field] = Object.keys(err.keyPattern || {});
    const value = (err as any).keyValue[field];
    return res.status(StatusCodes.FORBIDDEN).json({
      status: 'error',
      statusCode: StatusCodes.FORBIDDEN,
      message: `${field} "${value}" already exists.`,
    });
  }

  // 5) Anything else → 500
  console.error('Unexpected error:', err);
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    // optionally expose err.message in development:
    ...(process.env.NODE_ENV !== 'production' && { debug: err.message }),
  });
}
