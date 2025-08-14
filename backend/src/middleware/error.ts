import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ResponseUtil } from '@/utils/response';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode = 500, isOperational = true): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
};

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  // Log the error
  logger.error('Request failed', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    statusCode: err.statusCode
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // In development, send detailed error info
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // In production, send generic error for non-operational errors
  if (!err.isOperational) {
    return ResponseUtil.internalError(res, 'Something went wrong');
  }

  return ResponseUtil.error(res, err.message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response) => {
  ResponseUtil.notFound(res, `Route ${req.method} ${req.path} not found`);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};