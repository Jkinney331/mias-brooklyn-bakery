import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/error';
import { ResponseUtil } from '@/utils/response';
import { dataStore } from '@/services/data-store';
import { LocationId, Location } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @route GET /api/locations
 * @desc Get all locations
 * @access Private
 */
router.get('/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const locations = dataStore.getLocations();
    
    // If user is not owner/manager, filter to their location only
    if (req.user?.role === 'kitchen' || req.user?.role === 'driver') {
      const userLocations = locations.filter(location => 
        req.user?.locationId ? location.id === req.user.locationId : false
      );
      return ResponseUtil.success(res, userLocations);
    }
    
    ResponseUtil.success(res, locations);
  })
);

/**
 * @route GET /api/locations/:id
 * @desc Get location by ID
 * @access Private
 */
router.get('/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const location = dataStore.getLocationById(id as LocationId);
    
    if (!location) {
      return ResponseUtil.notFound(res, 'Location not found');
    }

    // Check if user has access to this location
    if ((req.user?.role === 'kitchen' || req.user?.role === 'driver') && 
        req.user?.locationId !== location.id) {
      return ResponseUtil.forbidden(res, 'Access to this location not allowed');
    }
    
    ResponseUtil.success(res, location);
  })
);

/**
 * @route PUT /api/locations/:id
 * @desc Update location
 * @access Owner/Manager only
 */
router.put('/:id',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate location exists
    const existingLocation = dataStore.getLocationById(id as LocationId);
    if (!existingLocation) {
      return ResponseUtil.notFound(res, 'Location not found');
    }

    // Managers can only update their own location
    if (req.user?.role === 'manager' && req.user?.locationId !== id) {
      return ResponseUtil.forbidden(res, 'Can only update your assigned location');
    }

    // Prevent updating critical fields
    const allowedUpdates = {
      name: updates.name,
      address: updates.address,
      phone: updates.phone,
      status: updates.status,
      hours: updates.hours,
      manager: updates.manager
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key as keyof typeof allowedUpdates] === undefined) {
        delete allowedUpdates[key as keyof typeof allowedUpdates];
      }
    });

    const updatedLocation = dataStore.updateLocation(id as LocationId, allowedUpdates);
    
    if (!updatedLocation) {
      return ResponseUtil.internalError(res, 'Failed to update location');
    }

    logger.info('Location updated', { 
      locationId: id, 
      updatedBy: req.user?.id,
      updates: Object.keys(allowedUpdates)
    });
    
    ResponseUtil.success(res, updatedLocation, 'Location updated successfully');
  })
);

/**
 * @route GET /api/locations/:id/stats
 * @desc Get location statistics
 * @access Private
 */
router.get('/:id/stats',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const location = dataStore.getLocationById(id as LocationId);
    
    if (!location) {
      return ResponseUtil.notFound(res, 'Location not found');
    }

    // Check access permissions
    if ((req.user?.role === 'kitchen' || req.user?.role === 'driver') && 
        req.user?.locationId !== location.id) {
      return ResponseUtil.forbidden(res, 'Access to this location not allowed');
    }

    // Get fresh stats
    const stats = dataStore.getOrderStats(id as LocationId);
    const orders = dataStore.getOrdersByLocation(id as LocationId);
    
    // Calculate additional metrics
    const activeOrders = orders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status)
    );

    const completedToday = orders.filter(order => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return order.createdAt >= today && order.status === 'delivered';
    });

    // Calculate average prep time from completed orders
    const prepTimes = completedToday
      .filter(order => order.estimatedReadyTime)
      .map(order => {
        const orderTime = order.createdAt.getTime();
        const readyTime = order.estimatedReadyTime!.getTime();
        return Math.max(0, (readyTime - orderTime) / (1000 * 60)); // minutes
      });

    const avgPrepTime = prepTimes.length > 0 
      ? Math.round(prepTimes.reduce((sum, time) => sum + time, 0) / prepTimes.length)
      : location.stats.avgPrepTime;

    // Determine kitchen load
    let kitchenLoad: 'low' | 'medium' | 'high' = 'low';
    if (activeOrders.length > 8) kitchenLoad = 'high';
    else if (activeOrders.length > 3) kitchenLoad = 'medium';

    const locationStats = {
      todayOrders: stats.todayOrders,
      todayRevenue: stats.totalRevenue,
      activeOrders: activeOrders.length,
      avgPrepTime,
      kitchenLoad,
      completedOrders: completedToday.length,
      avgOrderValue: stats.avgOrderValue,
      peakHour: calculatePeakHour(orders),
      statusBreakdown: getStatusBreakdown(activeOrders)
    };

    ResponseUtil.success(res, locationStats);
  })
);

/**
 * @route POST /api/locations/:id/status
 * @desc Update location status
 * @access Manager/Owner only
 */
router.post('/:id/status',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['open', 'closed', 'busy'].includes(status)) {
      return ResponseUtil.badRequest(res, 'Invalid status. Must be: open, closed, or busy');
    }

    const location = dataStore.getLocationById(id as LocationId);
    if (!location) {
      return ResponseUtil.notFound(res, 'Location not found');
    }

    // Managers can only update their own location
    if (req.user?.role === 'manager' && req.user?.locationId !== id) {
      return ResponseUtil.forbidden(res, 'Can only update your assigned location');
    }

    const updatedLocation = dataStore.updateLocation(id as LocationId, { status });
    
    logger.info('Location status updated', { 
      locationId: id, 
      newStatus: status, 
      updatedBy: req.user?.id 
    });
    
    ResponseUtil.success(res, updatedLocation, `Location status updated to ${status}`);
  })
);

// Helper methods (would normally be in a service class)
function calculatePeakHour(orders: any[]): number {
  const hourCounts: Record<number, number> = {};
  
  orders.forEach((order: any) => {
    const hour = order.createdAt.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  let peakHour = 12; // Default to noon
  let maxCount = 0;
  
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour);
    }
  });
  
  return peakHour;
}

function getStatusBreakdown(orders: any[]) {
  const breakdown: Record<string, number> = {};
  
  orders.forEach((order: any) => {
    breakdown[order.status] = (breakdown[order.status] || 0) + 1;
  });
  
  return breakdown;
}

export { router as locationsRouter };