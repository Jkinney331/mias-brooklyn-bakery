import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '@/utils/response';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      ResponseUtil.badRequest(res, errorMessage);
      return;
    }
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      ResponseUtil.badRequest(res, errorMessage);
      return;
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  createOrder: Joi.object({
    locationId: Joi.string().valid('brooklyn', 'ues', 'times-square').required(),
    customerName: Joi.string().min(2).required(),
    customerPhone: Joi.string().required(),
    customerEmail: Joi.string().email().optional(),
    type: Joi.string().valid('pickup', 'delivery', 'dine-in').required(),
    items: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required(),
      specialRequests: Joi.string().optional(),
      category: Joi.string().valid('breads', 'pastries', 'cakes', 'beverages', 'sandwiches').required()
    })).min(1).required(),
    specialInstructions: Joi.string().optional(),
    deliveryAddress: Joi.when('type', {
      is: 'delivery',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    })
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled').required(),
    estimatedReadyTime: Joi.date().optional(),
    assignedDriverId: Joi.string().optional()
  }),

  updateDriverLocation: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }),

  updateDriverStatus: Joi.object({
    status: Joi.string().valid('available', 'busy', 'offline').required()
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};