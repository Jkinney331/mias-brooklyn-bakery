import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// Routes
import { authRouter } from '@/routes/auth';
import { locationsRouter } from '@/routes/locations';
import { ordersRouter } from '@/routes/orders';
import { driversRouter } from '@/routes/drivers';
import { deliveryZonesRouter } from '@/routes/delivery-zones';
import { analyticsRouter } from '@/routes/analytics';
import { notificationsRouter } from '@/routes/notifications';

// Middleware
import { errorHandler, notFoundHandler } from '@/middleware/error';

// Services
import { SocketServer, socketServer as globalSocketServer } from '@/websocket/socket-server';
import { mockGenerator } from '@/services/mock-generator';
import { logger } from '@/utils/logger';

// Load environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Create Express app
const app = express();
const httpServer = createServer(app);

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: '1.0.0'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Mia\'s Brooklyn Bakery API',
    version: '1.0.0',
    description: 'RESTful API for bakery management system',
    endpoints: {
      auth: '/api/auth',
      locations: '/api/locations',
      orders: '/api/orders',
      drivers: '/api/drivers',
      deliveryZones: '/api/delivery-zones',
      analytics: '/api/analytics',
      notifications: '/api/notifications'
    },
    websocket: {
      url: '/socket.io/',
      description: 'Real-time updates for orders, drivers, and analytics'
    },
    demo: {
      enabled: process.env.DEMO_MODE === 'true',
      credentials: '/api/auth/demo-credentials'
    }
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/delivery-zones', deliveryZonesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize WebSocket server
const socketServerInstance = new SocketServer(httpServer);

// Make socket server globally available
(global as any).socketServer = socketServerInstance;

// Start server
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`, {
    environment: NODE_ENV,
    corsOrigin: CORS_ORIGIN,
    demoMode: process.env.DEMO_MODE === 'true'
  });

  // Start demo simulations if in demo mode
  if (process.env.DEMO_MODE === 'true') {
    setTimeout(() => {
      logger.info('🎭 Starting demo simulations...');
      
      // Generate PRD sample orders first
      logger.info('📦 Generating PRD sample orders...');
      mockGenerator.generatePRDSampleOrders();
      
      // Then start continuous simulations
      mockGenerator.startAllSimulations();
      socketServerInstance.startAnalyticsBroadcasts();
    }, 2000); // Wait 2 seconds for server to stabilize
  }
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('📴 Shutting down server gracefully...');
  
  // Stop simulations
  mockGenerator.stopAllSimulations();
  
  httpServer.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('❌ Forcing server shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

export { app, httpServer, socketServerInstance as socketServer };