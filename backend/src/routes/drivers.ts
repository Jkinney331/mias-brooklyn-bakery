import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/error';
import { ResponseUtil } from '@/utils/response';
import { dataStore } from '@/services/data-store';
import { Driver } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @route GET /api/drivers
 * @desc Get all drivers
 * @access Owner/Manager only
 */
router.get('/',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { status, available } = req.query;
    
    let drivers = dataStore.getDrivers();

    // Filter by status
    if (status) {
      drivers = drivers.filter(driver => driver.status === status);
    }

    // Filter available drivers only
    if (available === 'true') {
      drivers = drivers.filter(driver => driver.status === 'available');
    }

    // Sort by status (available first) then by name
    drivers.sort((a, b) => {
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (b.status === 'available' && a.status !== 'available') return 1;
      return a.name.localeCompare(b.name);
    });

    ResponseUtil.success(res, drivers);
  })
);

/**
 * @route GET /api/drivers/:id
 * @desc Get driver by ID
 * @access Private (drivers can view their own profile)
 */
router.get('/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const driver = dataStore.getDriverById(id);

    if (!driver) {
      return ResponseUtil.notFound(res, 'Driver not found');
    }

    // Drivers can only view their own profile
    if (req.user?.role === 'driver') {
      const userDriver = dataStore.getDrivers().find(d => d.email === req.user?.email);
      if (!userDriver || userDriver.id !== id) {
        return ResponseUtil.forbidden(res, 'Can only view your own profile');
      }
    }

    ResponseUtil.success(res, driver);
  })
);

/**
 * @route PUT /api/drivers/:id/status
 * @desc Update driver status
 * @access Driver (own status) or Manager/Owner
 */
router.put('/:id/status',
  authenticate,
  validate(schemas.updateDriverStatus),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const driver = dataStore.getDriverById(id);
    if (!driver) {
      return ResponseUtil.notFound(res, 'Driver not found');
    }

    // Check permissions
    if (req.user?.role === 'driver') {
      const userDriver = dataStore.getDrivers().find(d => d.email === req.user?.email);
      if (!userDriver || userDriver.id !== id) {
        return ResponseUtil.forbidden(res, 'Can only update your own status');
      }
    }

    // Don't allow drivers to set themselves as busy - this should be automatic
    if (req.user?.role === 'driver' && status === 'busy') {
      return ResponseUtil.badRequest(res, 'Cannot manually set status to busy');
    }

    // If setting to offline, clear assigned orders
    let updates: Partial<Driver> = { status };
    if (status === 'offline') {
      updates.assignedOrders = [];
      
      // Update any assigned orders to remove driver assignment
      driver.assignedOrders.forEach(orderId => {
        dataStore.updateOrder(orderId, { assignedDriverId: undefined });
      });
    }

    const updatedDriver = dataStore.updateDriver(id, updates);
    if (!updatedDriver) {
      return ResponseUtil.internalError(res, 'Failed to update driver status');
    }

    logger.info('Driver status updated', {
      driverId: id,
      oldStatus: driver.status,
      newStatus: status,
      updatedBy: req.user?.id
    });

    ResponseUtil.success(res, updatedDriver, 'Driver status updated successfully');
  })
);

/**
 * @route PUT /api/drivers/:id/location
 * @desc Update driver location
 * @access Driver only (their own location)
 */
router.put('/:id/location',
  authenticate,
  validate(schemas.updateDriverLocation),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const driver = dataStore.getDriverById(id);
    if (!driver) {
      return ResponseUtil.notFound(res, 'Driver not found');
    }

    // Only drivers can update their own location
    if (req.user?.role === 'driver') {
      const userDriver = dataStore.getDrivers().find(d => d.email === req.user?.email);
      if (!userDriver || userDriver.id !== id) {
        return ResponseUtil.forbidden(res, 'Can only update your own location');
      }
    }

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return ResponseUtil.badRequest(res, 'Invalid coordinates');
    }

    const updatedDriver = dataStore.updateDriver(id, {
      currentLocation: { lat, lng }
    });

    if (!updatedDriver) {
      return ResponseUtil.internalError(res, 'Failed to update driver location');
    }

    logger.debug('Driver location updated', {
      driverId: id,
      location: { lat, lng }
    });

    ResponseUtil.success(res, updatedDriver, 'Location updated successfully');
  })
);

/**
 * @route POST /api/drivers/:id/assign-order
 * @desc Assign order to driver
 * @access Manager/Owner only
 */
router.post('/:id/assign-order',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { orderId } = req.body;

    if (!orderId) {
      return ResponseUtil.badRequest(res, 'Order ID is required');
    }

    const driver = dataStore.getDriverById(id);
    if (!driver) {
      return ResponseUtil.notFound(res, 'Driver not found');
    }

    const order = dataStore.getOrderById(orderId);
    if (!order) {
      return ResponseUtil.notFound(res, 'Order not found');
    }

    // Check if driver is available
    if (driver.status !== 'available') {
      return ResponseUtil.badRequest(res, 'Driver is not available');
    }

    // Check if order is ready for delivery
    if (order.status !== 'ready') {
      return ResponseUtil.badRequest(res, 'Order is not ready for delivery');
    }

    // Check if order is delivery type
    if (order.type !== 'delivery') {
      return ResponseUtil.badRequest(res, 'Order is not a delivery order');
    }

    // Assign order to driver
    const updatedDriver = dataStore.updateDriver(id, {
      status: 'busy',
      assignedOrders: [...driver.assignedOrders, orderId]
    });

    // Update order with driver assignment
    const updatedOrder = dataStore.updateOrder(orderId, {
      assignedDriverId: id,
      status: 'out-for-delivery'
    });

    if (!updatedDriver || !updatedOrder) {
      return ResponseUtil.internalError(res, 'Failed to assign order');
    }

    logger.info('Order assigned to driver', {
      driverId: id,
      orderId,
      assignedBy: req.user?.id
    });

    ResponseUtil.success(res, {
      driver: updatedDriver,
      order: updatedOrder
    }, 'Order assigned successfully');
  })
);

/**
 * @route POST /api/drivers/:id/complete-order
 * @desc Mark order as completed by driver
 * @access Driver only
 */
router.post('/:id/complete-order',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { orderId } = req.body;

    if (!orderId) {
      return ResponseUtil.badRequest(res, 'Order ID is required');
    }

    const driver = dataStore.getDriverById(id);
    if (!driver) {
      return ResponseUtil.notFound(res, 'Driver not found');
    }

    // Check if this is the driver's own request
    if (req.user?.role === 'driver') {
      const userDriver = dataStore.getDrivers().find(d => d.email === req.user?.email);
      if (!userDriver || userDriver.id !== id) {
        return ResponseUtil.forbidden(res, 'Can only complete your own orders');
      }
    }

    const order = dataStore.getOrderById(orderId);
    if (!order) {
      return ResponseUtil.notFound(res, 'Order not found');
    }

    // Check if order is assigned to this driver
    if (order.assignedDriverId !== id) {
      return ResponseUtil.badRequest(res, 'Order is not assigned to this driver');
    }

    // Check if order is out for delivery
    if (order.status !== 'out-for-delivery') {
      return ResponseUtil.badRequest(res, 'Order is not out for delivery');
    }

    // Complete the order
    const updatedOrder = dataStore.updateOrder(orderId, {
      status: 'delivered'
    });

    // Update driver (remove order from assigned orders, set available if no more orders)
    const remainingOrders = driver.assignedOrders.filter(oid => oid !== orderId);
    const newStatus = remainingOrders.length === 0 ? 'available' : 'busy';

    const updatedDriver = dataStore.updateDriver(id, {
      status: newStatus,
      assignedOrders: remainingOrders,
      totalDeliveries: driver.totalDeliveries + 1
    });

    if (!updatedOrder || !updatedDriver) {
      return ResponseUtil.internalError(res, 'Failed to complete order');
    }

    logger.info('Order completed by driver', {
      driverId: id,
      orderId,
      totalDeliveries: updatedDriver.totalDeliveries
    });

    ResponseUtil.success(res, {
      driver: updatedDriver,
      order: updatedOrder
    }, 'Order completed successfully');
  })
);

/**
 * @route GET /api/drivers/:id/orders
 * @desc Get orders assigned to driver
 * @access Driver (own orders) or Manager/Owner
 */
router.get('/:id/orders',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status } = req.query;

    const driver = dataStore.getDriverById(id);
    if (!driver) {
      return ResponseUtil.notFound(res, 'Driver not found');
    }

    // Check permissions
    if (req.user?.role === 'driver') {
      const userDriver = dataStore.getDrivers().find(d => d.email === req.user?.email);
      if (!userDriver || userDriver.id !== id) {
        return ResponseUtil.forbidden(res, 'Can only view your own orders');
      }
    }

    let orders = dataStore.getOrdersByDriver(id);

    // Filter by status if provided
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    ResponseUtil.success(res, orders);
  })
);

/**
 * @route GET /api/drivers/stats/performance
 * @desc Get driver performance statistics
 * @access Manager/Owner only
 */
router.get('/stats/performance',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const drivers = dataStore.getDrivers();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const driverStats = drivers.map(driver => {
      const driverOrders = dataStore.getOrdersByDriver(driver.id);
      const todayOrders = driverOrders.filter(order => order.createdAt >= today);
      const deliveredToday = todayOrders.filter(order => order.status === 'delivered');
      
      return {
        id: driver.id,
        name: driver.name,
        status: driver.status,
        rating: driver.rating,
        totalDeliveries: driver.totalDeliveries,
        todayDeliveries: deliveredToday.length,
        currentOrders: driver.assignedOrders.length,
        vehicle: driver.vehicle,
        averageRating: driver.rating
      };
    });

    // Sort by today's deliveries
    driverStats.sort((a, b) => b.todayDeliveries - a.todayDeliveries);

    const summary = {
      totalDrivers: drivers.length,
      availableDrivers: drivers.filter(d => d.status === 'available').length,
      busyDrivers: drivers.filter(d => d.status === 'busy').length,
      offlineDrivers: drivers.filter(d => d.status === 'offline').length,
      totalDeliveriesToday: driverStats.reduce((sum, d) => sum + d.todayDeliveries, 0),
      averageRating: drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length
    };

    ResponseUtil.success(res, {
      drivers: driverStats,
      summary
    });
  })
);

export { router as driversRouter };