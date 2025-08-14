import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from '@/types';
import { dataStore } from '@/services/data-store';
import { logger } from '@/utils/logger';

export interface SocketUser extends User {
  socketId: string;
}

export class SocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set of room names

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('WebSocket server initialized');
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        const user = decoded.user as User;
        
        if (!user) {
          return next(new Error('Invalid token'));
        }

        // Attach user to socket
        (socket as any).user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication failed', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = (socket as any).user as User;
      const socketUser: SocketUser = { ...user, socketId: socket.id };
      
      // Store connected user
      this.connectedUsers.set(socket.id, socketUser);
      this.userRooms.set(user.id, new Set());
      
      logger.info('User connected', { 
        userId: user.id, 
        socketId: socket.id, 
        role: user.role,
        locationId: user.locationId 
      });

      // Join appropriate rooms based on user role
      this.joinUserRooms(socket, user);

      // Handle user-specific events
      this.setupUserEventHandlers(socket, user);

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket.id, user);
      });
    });
  }

  private joinUserRooms(socket: any, user: User) {
    const rooms = this.userRooms.get(user.id) || new Set();

    // Everyone joins global room
    socket.join('global');
    rooms.add('global');

    // Join location-specific room if user has a location
    if (user.locationId) {
      const locationRoom = `location:${user.locationId}`;
      socket.join(locationRoom);
      rooms.add(locationRoom);
    }

    // Join role-specific rooms
    socket.join(`role:${user.role}`);
    rooms.add(`role:${user.role}`);

    // Drivers join driver-specific room
    if (user.role === 'driver') {
      socket.join('drivers');
      rooms.add('drivers');
    }

    // Managers and owners join management room
    if (user.role === 'manager' || user.role === 'owner') {
      socket.join('management');
      rooms.add('management');
    }

    this.userRooms.set(user.id, rooms);
    
    logger.debug('User joined rooms', { 
      userId: user.id, 
      rooms: Array.from(rooms) 
    });
  }

  private setupUserEventHandlers(socket: any, user: User) {
    // Handle location updates (for drivers)
    socket.on('location-update', (data: { lat: number; lng: number }) => {
      if (user.role === 'driver') {
        // Find driver and update location
        const drivers = dataStore.getDrivers();
        const driver = drivers.find(d => d.email === user.email);
        
        if (driver) {
          dataStore.updateDriver(driver.id, { currentLocation: data });
          
          // Broadcast to management and other drivers
          this.broadcastToManagement('driver-location-update', {
            driverId: driver.id,
            location: data,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Handle order status updates
    socket.on('order-status-update', (data: { orderId: string; status: string }) => {
      const order = dataStore.getOrderById(data.orderId);
      if (order) {
        // Broadcast to location and management
        this.broadcastToLocation(order.locationId, 'order-updated', {
          orderId: data.orderId,
          status: data.status,
          order,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle kitchen status updates
    socket.on('kitchen-status-update', (data: { locationId: string; load: string }) => {
      if (user.role === 'kitchen' || user.role === 'manager') {
        this.broadcastToLocation(data.locationId, 'kitchen-status-changed', {
          locationId: data.locationId,
          load: data.load,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle driver status updates
    socket.on('driver-status-update', (data: { status: string }) => {
      if (user.role === 'driver') {
        const drivers = dataStore.getDrivers();
        const driver = drivers.find(d => d.email === user.email);
        
        if (driver) {
          dataStore.updateDriver(driver.id, { status: data.status as any });
          
          this.broadcastToManagement('driver-status-update', {
            driverId: driver.id,
            status: data.status,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Handle real-time analytics requests
    socket.on('subscribe-analytics', (data: { locationId?: string }) => {
      const analyticsRoom = data.locationId 
        ? `analytics:${data.locationId}` 
        : 'analytics:global';
      
      socket.join(analyticsRoom);
      
      // Send initial analytics data
      socket.emit('analytics-update', this.getAnalyticsData(data.locationId));
    });

    // Handle notification acknowledgment
    socket.on('notification-read', (data: { notificationId: string }) => {
      dataStore.markNotificationRead(data.notificationId);
      
      // Broadcast to user's other sessions
      socket.broadcast.to(`user:${user.id}`).emit('notification-read', data);
    });
  }

  private handleDisconnection(socketId: string, user: User) {
    this.connectedUsers.delete(socketId);
    this.userRooms.delete(user.id);
    
    logger.info('User disconnected', { 
      userId: user.id, 
      socketId,
      role: user.role 
    });
  }

  // Public methods for broadcasting events

  public broadcastOrderUpdate(order: any) {
    this.broadcastToLocation(order.locationId, 'order-updated', {
      orderId: order.id,
      order,
      timestamp: new Date().toISOString()
    });

    // Also broadcast to management
    this.broadcastToManagement('order-updated', {
      orderId: order.id,
      order,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastNewOrder(order: any) {
    this.broadcastToLocation(order.locationId, 'new-order', {
      order,
      timestamp: new Date().toISOString()
    });

    // Notify kitchen staff specifically
    this.io.to(`role:kitchen`).emit('kitchen-notification', {
      type: 'new-order',
      order,
      message: `New order #${order.id.slice(-6)} received`,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastDriverUpdate(driver: any) {
    this.broadcastToManagement('driver-updated', {
      driver,
      timestamp: new Date().toISOString()
    });

    // Broadcast to other drivers
    this.io.to('drivers').emit('driver-updated', {
      driver,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastLocationUpdate(location: any) {
    this.broadcastToLocation(location.id, 'location-updated', {
      location,
      timestamp: new Date().toISOString()
    });

    this.broadcastToManagement('location-updated', {
      location,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastNotification(notification: any) {
    // Broadcast to specific location if provided
    if (notification.locationId) {
      this.broadcastToLocation(notification.locationId, 'notification', {
        notification,
        timestamp: new Date().toISOString()
      });
    } else {
      // Broadcast globally
      this.io.to('global').emit('notification', {
        notification,
        timestamp: new Date().toISOString()
      });
    }
  }

  public broadcastAnalyticsUpdate(locationId?: string) {
    const analyticsRoom = locationId 
      ? `analytics:${locationId}` 
      : 'analytics:global';
    
    this.io.to(analyticsRoom).emit('analytics-update', 
      this.getAnalyticsData(locationId)
    );
  }

  // Helper methods

  private broadcastToLocation(locationId: string, event: string, data: any) {
    this.io.to(`location:${locationId}`).emit(event, data);
  }

  private broadcastToManagement(event: string, data: any) {
    this.io.to('management').emit(event, data);
  }

  private getAnalyticsData(locationId?: string) {
    const stats = dataStore.getOrderStats(locationId as any);
    const orders = locationId 
      ? dataStore.getOrdersByLocation(locationId as any)
      : dataStore.getOrders();

    const activeOrders = orders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status)
    );

    return {
      ...stats,
      activeOrders: activeOrders.length,
      timestamp: new Date().toISOString()
    };
  }

  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getConnectedUsersByRole(role: string): SocketUser[] {
    return Array.from(this.connectedUsers.values())
      .filter(user => user.role === role);
  }

  public getConnectedUsersByLocation(locationId: string): SocketUser[] {
    return Array.from(this.connectedUsers.values())
      .filter(user => user.locationId === locationId);
  }

  // Send direct message to specific user
  public sendToUser(userId: string, event: string, data: any) {
    const user = Array.from(this.connectedUsers.values())
      .find(user => user.id === userId);
    
    if (user) {
      this.io.to(user.socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Start periodic analytics broadcasts
  public startAnalyticsBroadcasts() {
    setInterval(() => {
      this.broadcastAnalyticsUpdate();
      
      // Broadcast location-specific analytics
      const locations = dataStore.getLocations();
      locations.forEach(location => {
        this.broadcastAnalyticsUpdate(location.id);
      });
    }, 10000); // Every 10 seconds

    logger.info('Started periodic analytics broadcasts');
  }
}

export let socketServer: SocketServer;