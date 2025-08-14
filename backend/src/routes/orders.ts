import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorize, AuthRequest } from '@/middleware/auth';
import { validate, validateQuery, schemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/error';
import { ResponseUtil } from '@/utils/response';
import { dataStore } from '@/services/data-store';
import { mockGenerator } from '@/services/mock-generator';
import { Order, OrderStatus, LocationId, PaginationQuery } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @route GET /api/orders
 * @desc Get orders with filtering and pagination
 * @access Private
 */
router.get('/',
  authenticate,
  validateQuery(schemas.pagination),
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      locationId,
      type,
      search
    } = req.query as any;

    let orders = dataStore.getOrders();

    // Filter by user permissions
    if (req.user?.role === 'kitchen' || req.user?.role === 'driver') {
      if (req.user.locationId) {
        orders = orders.filter(order => order.locationId === req.user!.locationId);
      }
    }

    // Apply filters
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    if (locationId) {
      orders = orders.filter(order => order.locationId === locationId);
    }

    if (type) {
      orders = orders.filter(order => order.type === type);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => 
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerPhone.includes(search) ||
        order.id.includes(search)
      );
    }

    // Sort orders
    orders.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Order];
      let bValue: any = b[sortBy as keyof Order];

      if (sortBy === 'createdAt' || sortBy === 'estimatedReadyTime') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    const response = {
      orders: paginatedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(orders.length / limit),
        totalOrders: orders.length,
        hasNext: endIndex < orders.length,
        hasPrev: startIndex > 0
      }
    };

    ResponseUtil.success(res, response);
  })
);

/**
 * @route GET /api/orders/:id
 * @desc Get order by ID
 * @access Private
 */
router.get('/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const order = dataStore.getOrderById(id);

    if (!order) {
      return ResponseUtil.notFound(res, 'Order not found');
    }

    // Check permissions
    if ((req.user?.role === 'kitchen' || req.user?.role === 'driver') && 
        req.user?.locationId !== order.locationId) {
      return ResponseUtil.forbidden(res, 'Access to this order not allowed');
    }

    ResponseUtil.success(res, order);
  })
);

/**
 * @route POST /api/orders
 * @desc Create new order
 * @access Private
 */
router.post('/',
  authenticate,
  validate(schemas.createOrder),
  asyncHandler(async (req: AuthRequest, res) => {
    const orderData = req.body;

    // Generate order items with IDs
    const items = orderData.items.map((item: any) => ({
      ...item,
      id: uuidv4()
    }));

    // Calculate total
    const itemTotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );

    // Add delivery fee if applicable
    let total = itemTotal;
    if (orderData.type === 'delivery') {
      const deliveryZones = dataStore.getDeliveryZonesByLocation(orderData.locationId);
      const deliveryFee = deliveryZones.length > 0 ? deliveryZones[0].deliveryFee : 3.00;
      total += deliveryFee;
    }

    // Create order
    const order: Order = {
      id: uuidv4(),
      locationId: orderData.locationId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      type: orderData.type,
      status: 'pending',
      items,
      total: Math.round(total * 100) / 100,
      createdAt: new Date(),
      specialInstructions: orderData.specialInstructions,
      deliveryAddress: orderData.deliveryAddress,
      paymentStatus: 'pending'
    };

    // Set estimated ready time
    const location = dataStore.getLocationById(orderData.locationId);
    const prepTime = location?.stats.avgPrepTime || 15;
    order.estimatedReadyTime = new Date(Date.now() + prepTime * 60000);

    const createdOrder = dataStore.createOrder(order);

    // Create notification
    mockGenerator.createOrderNotification(createdOrder);

    logger.info('Order created', { 
      orderId: order.id, 
      locationId: order.locationId,
      total: order.total,
      createdBy: req.user?.id
    });

    ResponseUtil.created(res, createdOrder, 'Order created successfully');
  })
);

/**
 * @route PUT /api/orders/:id/status
 * @desc Update order status
 * @access Private
 */
router.put('/:id/status',
  authenticate,
  validate(schemas.updateOrderStatus),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status, estimatedReadyTime, assignedDriverId } = req.body;

    const order = dataStore.getOrderById(id);
    if (!order) {
      return ResponseUtil.notFound(res, 'Order not found');
    }

    // Check permissions
    if ((req.user?.role === 'kitchen' || req.user?.role === 'driver') && 
        req.user?.locationId !== order.locationId) {
      return ResponseUtil.forbidden(res, 'Cannot update orders from other locations');
    }

    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['out-for-delivery', 'delivered', 'cancelled'],
      'out-for-delivery': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    const allowedNextStatuses = validTransitions[order.status];
    if (!allowedNextStatuses.includes(status)) {
      return ResponseUtil.badRequest(res, 
        `Cannot change status from ${order.status} to ${status}`
      );
    }

    // Prepare updates
    const updates: Partial<Order> = { status };
    
    if (estimatedReadyTime) {
      updates.estimatedReadyTime = new Date(estimatedReadyTime);
    }

    if (assignedDriverId) {
      // Validate driver exists and is available
      const driver = dataStore.getDriverById(assignedDriverId);
      if (!driver) {
        return ResponseUtil.badRequest(res, 'Invalid driver ID');
      }
      updates.assignedDriverId = assignedDriverId;

      // Update driver status
      dataStore.updateDriver(assignedDriverId, {
        status: 'busy',
        assignedOrders: [...driver.assignedOrders, id]
      });
    }

    // Special handling for delivery status
    if (status === 'out-for-delivery' && !assignedDriverId && !order.assignedDriverId) {
      // Auto-assign available driver
      const availableDrivers = dataStore.getAvailableDrivers();
      if (availableDrivers.length > 0) {
        const driver = availableDrivers[0];
        updates.assignedDriverId = driver.id;
        dataStore.updateDriver(driver.id, {
          status: 'busy',
          assignedOrders: [...driver.assignedOrders, id]
        });
      }
    }

    // Update order
    const updatedOrder = dataStore.updateOrder(id, updates);
    if (!updatedOrder) {
      return ResponseUtil.internalError(res, 'Failed to update order');
    }

    // Create status update notification
    mockGenerator.createStatusUpdateNotification(updatedOrder);

    // Free up driver if order is completed
    if (status === 'delivered' || status === 'cancelled') {
      if (updatedOrder.assignedDriverId) {
        const driver = dataStore.getDriverById(updatedOrder.assignedDriverId);
        if (driver) {
          dataStore.updateDriver(driver.id, {
            status: 'available',
            assignedOrders: driver.assignedOrders.filter(orderId => orderId !== id)
          });
        }
      }
    }

    logger.info('Order status updated', {
      orderId: id,
      oldStatus: order.status,
      newStatus: status,
      updatedBy: req.user?.id
    });

    ResponseUtil.success(res, updatedOrder, 'Order status updated successfully');
  })
);

/**
 * @route DELETE /api/orders/:id
 * @desc Cancel/Delete order
 * @access Owner/Manager only
 */
router.delete('/:id',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const order = dataStore.getOrderById(id);

    if (!order) {
      return ResponseUtil.notFound(res, 'Order not found');
    }

    // Managers can only delete orders from their location
    if (req.user?.role === 'manager' && req.user?.locationId !== order.locationId) {
      return ResponseUtil.forbidden(res, 'Cannot delete orders from other locations');
    }

    // Don't allow deletion of delivered orders
    if (order.status === 'delivered') {
      return ResponseUtil.badRequest(res, 'Cannot delete delivered orders');
    }

    // Free up assigned driver
    if (order.assignedDriverId) {
      const driver = dataStore.getDriverById(order.assignedDriverId);
      if (driver) {
        dataStore.updateDriver(driver.id, {
          status: 'available',
          assignedOrders: driver.assignedOrders.filter(orderId => orderId !== id)
        });
      }
    }

    const deleted = dataStore.deleteOrder(id);
    if (!deleted) {
      return ResponseUtil.internalError(res, 'Failed to delete order');
    }

    logger.info('Order deleted', { orderId: id, deletedBy: req.user?.id });

    ResponseUtil.success(res, null, 'Order deleted successfully');
  })
);

/**
 * @route GET /api/orders/location/:locationId
 * @desc Get orders for specific location
 * @access Private
 */
router.get('/location/:locationId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { locationId } = req.params;
    const { status, limit = 50 } = req.query as any;

    // Check permissions
    if ((req.user?.role === 'kitchen' || req.user?.role === 'driver') && 
        req.user?.locationId !== locationId) {
      return ResponseUtil.forbidden(res, 'Access to this location not allowed');
    }

    let orders = dataStore.getOrdersByLocation(locationId as LocationId);

    // Filter by status if provided
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Limit results
    if (limit) {
      orders = orders.slice(0, parseInt(limit));
    }

    ResponseUtil.success(res, orders);
  })
);

/**
 * @route POST /api/orders/bulk-update
 * @desc Bulk update multiple orders
 * @access Manager/Owner only
 */
router.post('/bulk-update',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { orderIds, updates } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return ResponseUtil.badRequest(res, 'Order IDs are required');
    }

    if (!updates || typeof updates !== 'object') {
      return ResponseUtil.badRequest(res, 'Updates object is required');
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const orderId of orderIds) {
      try {
        const order = dataStore.getOrderById(orderId);
        if (!order) {
          results.push({ orderId, success: false, error: 'Order not found' });
          errorCount++;
          continue;
        }

        // Check permissions
        if (req.user?.role === 'manager' && req.user?.locationId !== order.locationId) {
          results.push({ orderId, success: false, error: 'Permission denied' });
          errorCount++;
          continue;
        }

        const updatedOrder = dataStore.updateOrder(orderId, updates);
        if (updatedOrder) {
          results.push({ orderId, success: true, order: updatedOrder });
          successCount++;
        } else {
          results.push({ orderId, success: false, error: 'Update failed' });
          errorCount++;
        }
      } catch (error) {
        results.push({ orderId, success: false, error: 'Update failed' });
        errorCount++;
      }
    }

    logger.info('Bulk order update completed', {
      totalOrders: orderIds.length,
      successCount,
      errorCount,
      updatedBy: req.user?.id
    });

    ResponseUtil.success(res, {
      results,
      summary: {
        total: orderIds.length,
        successful: successCount,
        failed: errorCount
      }
    }, 'Bulk update completed');
  })
);

export { router as ordersRouter };