import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@/types';
import { ResponseUtil } from '@/utils/response';
import { logger } from '@/utils/logger';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    ResponseUtil.unauthorized(res, 'Access token required');
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded.user;
    next();
  } catch (error) {
    logger.error('Authentication failed', error);
    ResponseUtil.unauthorized(res, 'Invalid token');
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'User not authenticated');
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseUtil.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded.user;
  } catch (error) {
    // Ignore invalid tokens in optional auth
    logger.debug('Optional auth failed', error);
  }

  next();
};