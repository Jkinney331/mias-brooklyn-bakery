import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validate, schemas } from '@/middleware/validation';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/error';
import { ResponseUtil } from '@/utils/response';
import { dataStore } from '@/services/data-store';
import { AuthResponse } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();

// Demo credentials for testing
const DEMO_CREDENTIALS = {
  'sarah@miasbakery.com': 'password123',
  'mike.brooklyn@miasbakery.com': 'password123',
  'emma.ues@miasbakery.com': 'password123',
  'carlos@miasbakery.com': 'password123',
  'julia.kitchen@miasbakery.com': 'password123'
};

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return JWT token
 * @access Public
 */
router.post('/login', 
  validate(schemas.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    logger.info('Login attempt', { email });

    // Find user
    const user = dataStore.getUserByEmail(email);
    if (!user) {
      logger.warn('Login failed - user not found', { email });
      return ResponseUtil.unauthorized(res, 'Invalid credentials');
    }

    // Verify password (demo mode - use simple comparison)
    const isValidPassword = process.env.DEMO_MODE === 'true' 
      ? DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS] === password
      : await bcrypt.compare(password, password); // In real app, compare with hashed password

    if (!isValidPassword) {
      logger.warn('Login failed - invalid password', { email });
      return ResponseUtil.unauthorized(res, 'Invalid credentials');
    }

    // Generate JWT token
    const tokenPayload = { user };
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    const authResponse: AuthResponse = {
      user,
      token,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    };

    logger.info('Login successful', { userId: user.id, role: user.role });
    
    ResponseUtil.success(res, authResponse, 'Login successful');
  })
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (in demo mode, just confirm logout)
 * @access Private
 */
router.post('/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    logger.info('User logged out', { userId: req.user?.id });
    ResponseUtil.success(res, null, 'Logout successful');
  })
);

/**
 * @route GET /api/auth/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, 'User not found');
    }

    // Get fresh user data from store
    const currentUser = dataStore.getUserById(req.user.id);
    if (!currentUser) {
      return ResponseUtil.unauthorized(res, 'User not found');
    }

    ResponseUtil.success(res, currentUser);
  })
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Private
 */
router.post('/refresh',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, 'User not found');
    }

    // Get fresh user data
    const currentUser = dataStore.getUserById(req.user.id);
    if (!currentUser) {
      return ResponseUtil.unauthorized(res, 'User not found');
    }

    // Generate new token
    const tokenPayload = { user: currentUser };
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    const authResponse: AuthResponse = {
      user: currentUser,
      token,
      expiresIn: 24 * 60 * 60
    };

    logger.info('Token refreshed', { userId: currentUser.id });
    
    ResponseUtil.success(res, authResponse, 'Token refreshed');
  })
);

/**
 * @route GET /api/auth/demo-credentials
 * @desc Get demo credentials for testing (demo mode only)
 * @access Public
 */
router.get('/demo-credentials',
  asyncHandler(async (req, res) => {
    if (process.env.DEMO_MODE !== 'true') {
      return ResponseUtil.notFound(res);
    }

    const credentials = Object.keys(DEMO_CREDENTIALS).map(email => {
      const user = dataStore.getUserByEmail(email);
      return {
        email,
        password: DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS],
        role: user?.role,
        name: user?.name
      };
    });

    ResponseUtil.success(res, credentials, 'Demo credentials');
  })
);

export { router as authRouter };