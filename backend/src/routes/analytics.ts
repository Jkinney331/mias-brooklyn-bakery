import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/error';
import { ResponseUtil } from '@/utils/response';
import { dataStore } from '@/services/data-store';
import { AnalyticsData, LocationId, OrderStatus } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @route GET /api/analytics/dashboard
 * @desc Get dashboard analytics
 * @access Manager/Owner only
 */
router.get('/dashboard',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { period = 'today', locationId } = req.query;
    
    // Filter by user's location if they're a manager
    const targetLocationId = req.user?.role === 'manager' 
      ? req.user.locationId 
      : (locationId as any);

    const analytics = generateDashboardAnalytics(
      period as 'today' | 'week' | 'month',
      targetLocationId
    );

    ResponseUtil.success(res, analytics);
  })
);

/**
 * @route GET /api/analytics/orders
 * @desc Get order analytics
 * @access Manager/Owner only
 */
router.get('/orders',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { period = 'today', locationId, groupBy = 'hour' } = req.query;
    
    const targetLocationId = req.user?.role === 'manager' 
      ? req.user.locationId 
      : (locationId as any);

    const orderAnalytics = generateOrderAnalytics(
      period as string,
      targetLocationId,
      groupBy as string
    );

    ResponseUtil.success(res, orderAnalytics);
  })
);

/**
 * @route GET /api/analytics/revenue
 * @desc Get revenue analytics
 * @access Manager/Owner only
 */
router.get('/revenue',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { period = 'today', locationId } = req.query;
    
    const targetLocationId = req.user?.role === 'manager' 
      ? req.user.locationId 
      : (locationId as any);

    const revenueAnalytics = generateRevenueAnalytics(
      period as string,
      targetLocationId
    );

    ResponseUtil.success(res, revenueAnalytics);
  })
);

/**
 * @route GET /api/analytics/performance
 * @desc Get performance metrics
 * @access Manager/Owner only
 */
router.get('/performance',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { locationId } = req.query;
    
    const targetLocationId = req.user?.role === 'manager' 
      ? req.user.locationId 
      : (locationId as any);

    const performance = generatePerformanceAnalytics(targetLocationId);

    ResponseUtil.success(res, performance);
  })
);

/**
 * @route GET /api/analytics/items
 * @desc Get item analytics (top selling items)
 * @access Manager/Owner only
 */
router.get('/items',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { period = 'today', locationId, limit = 10 } = req.query;
    
    const targetLocationId = req.user?.role === 'manager' 
      ? req.user.locationId 
      : (locationId as any);

    const itemAnalytics = generateItemAnalytics(
      period as string,
      targetLocationId,
      parseInt(limit as string)
    );

    ResponseUtil.success(res, itemAnalytics);
  })
);

/**
 * @route GET /api/analytics/locations-comparison
 * @desc Compare performance across locations
 * @access Owner only
 */
router.get('/locations-comparison',
  authenticate,
  authorize(['owner']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { period = 'today' } = req.query;

    const comparison = generateLocationComparison(period as string);

    ResponseUtil.success(res, comparison);
  })
);

/**
 * @route GET /api/analytics/real-time
 * @desc Get real-time metrics
 * @access Manager/Owner only
 */
router.get('/real-time',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { locationId } = req.query;
    
    const targetLocationId = req.user?.role === 'manager' 
      ? req.user.locationId 
      : (locationId as any);

    const realTimeMetrics = generateRealTimeMetrics(targetLocationId);

    ResponseUtil.success(res, realTimeMetrics);
  })
);

// Analytics Generation Functions

function generateDashboardAnalytics(
  period: 'today' | 'week' | 'month', 
  locationId?: LocationId
): AnalyticsData {
  const orders = locationId 
    ? dataStore.getOrdersByLocation(locationId)
    : dataStore.getOrders();

  const filteredOrders = filterOrdersByPeriod(orders, period);
  const revenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = filteredOrders.length > 0 ? revenue / filteredOrders.length : 0;

  // Generate top items
  const itemCounts: Record<string, { count: number; revenue: number }> = {};
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { count: 0, revenue: 0 };
      }
      itemCounts[item.name].count += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });

  const topItems = Object.entries(itemCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate busy hours
  const hourCounts: Record<number, number> = {};
  filteredOrders.forEach(order => {
    const hour = order.createdAt.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const busyHours = Object.entries(hourCounts)
    .map(([hour, orders]) => ({ hour: parseInt(hour), orders }))
    .sort((a, b) => a.hour - b.hour);

  // Generate location performance
  const locations = dataStore.getLocations();
  const locationPerformance = locations.map(location => {
    const locationOrders = filterOrdersByPeriod(
      dataStore.getOrdersByLocation(location.id), 
      period
    );
    const locationRevenue = locationOrders.reduce((sum, order) => sum + order.total, 0);
    
    return {
      locationId: location.id,
      orders: locationOrders.length,
      revenue: locationRevenue
    };
  });

  return {
    period,
    revenue: Math.round(revenue * 100) / 100,
    orders: filteredOrders.length,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    topItems,
    busyHours,
    locationPerformance
  };
}

function generateOrderAnalytics(period: string, locationId?: LocationId, groupBy: string = 'hour') {
  const orders = locationId 
    ? dataStore.getOrdersByLocation(locationId)
    : dataStore.getOrders();

  const filteredOrders = filterOrdersByPeriod(orders, period);

  // Group orders by time period
  const groupedData: Record<string, number> = {};
  
  filteredOrders.forEach(order => {
    let key: string;
    
    if (groupBy === 'hour') {
      key = order.createdAt.getHours().toString();
    } else if (groupBy === 'day') {
      key = order.createdAt.toISOString().split('T')[0];
    } else {
      key = order.createdAt.toISOString().split('T')[0];
    }
    
    groupedData[key] = (groupedData[key] || 0) + 1;
  });

  // Status breakdown
  const statusBreakdown: Record<OrderStatus, number> = {
    'pending': 0,
    'confirmed': 0,
    'preparing': 0,
    'ready': 0,
    'out-for-delivery': 0,
    'delivered': 0,
    'cancelled': 0
  };

  filteredOrders.forEach(order => {
    statusBreakdown[order.status]++;
  });

  // Order type breakdown
  const typeBreakdown = {
    pickup: filteredOrders.filter(o => o.type === 'pickup').length,
    delivery: filteredOrders.filter(o => o.type === 'delivery').length,
    'dine-in': filteredOrders.filter(o => o.type === 'dine-in').length
  };

  return {
    period,
    totalOrders: filteredOrders.length,
    groupedData,
    statusBreakdown,
    typeBreakdown,
    completionRate: filteredOrders.length > 0 
      ? Math.round((statusBreakdown.delivered / filteredOrders.length) * 100) 
      : 0,
    cancellationRate: filteredOrders.length > 0 
      ? Math.round((statusBreakdown.cancelled / filteredOrders.length) * 100) 
      : 0
  };
}

function generateRevenueAnalytics(period: string, locationId?: LocationId) {
  const orders = locationId 
    ? dataStore.getOrdersByLocation(locationId)
    : dataStore.getOrders();

  const filteredOrders = filterOrdersByPeriod(orders, period);
  const deliveredOrders = filteredOrders.filter(order => order.status === 'delivered');

  const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

  // Revenue by hour/day
  const revenueByTime: Record<string, number> = {};
  deliveredOrders.forEach(order => {
    const key = period === 'today' 
      ? order.createdAt.getHours().toString()
      : order.createdAt.toISOString().split('T')[0];
    
    revenueByTime[key] = (revenueByTime[key] || 0) + order.total;
  });

  // Revenue by order type
  const revenueByType = {
    pickup: deliveredOrders.filter(o => o.type === 'pickup').reduce((sum, o) => sum + o.total, 0),
    delivery: deliveredOrders.filter(o => o.type === 'delivery').reduce((sum, o) => sum + o.total, 0),
    'dine-in': deliveredOrders.filter(o => o.type === 'dine-in').reduce((sum, o) => sum + o.total, 0)
  };

  return {
    period,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    deliveredOrders: deliveredOrders.length,
    revenueByTime,
    revenueByType,
    projectedRevenue: Math.round(totalRevenue * 1.1 * 100) / 100 // Simple projection
  };
}

function generatePerformanceAnalytics(locationId?: LocationId) {
  const orders = locationId 
    ? dataStore.getOrdersByLocation(locationId)
    : dataStore.getOrders();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(order => order.createdAt >= today);
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status)
  );

  // Calculate average prep times
  const prepTimes = todayOrders
    .filter(order => order.estimatedReadyTime && order.status === 'delivered')
    .map(order => {
      const orderTime = order.createdAt.getTime();
      const readyTime = order.estimatedReadyTime!.getTime();
      return Math.max(0, (readyTime - orderTime) / (1000 * 60)); // minutes
    });

  const avgPrepTime = prepTimes.length > 0 
    ? Math.round(prepTimes.reduce((sum, time) => sum + time, 0) / prepTimes.length)
    : 0;

  // Kitchen load calculation
  let kitchenLoad: 'low' | 'medium' | 'high' = 'low';
  if (activeOrders.length > 8) kitchenLoad = 'high';
  else if (activeOrders.length > 3) kitchenLoad = 'medium';

  return {
    todayOrders: todayOrders.length,
    activeOrders: activeOrders.length,
    avgPrepTime,
    kitchenLoad,
    onTimePerformance: Math.round(Math.random() * 20 + 80), // Mock metric
    customerSatisfaction: Math.round(Math.random() * 10 + 85), // Mock metric
    efficiency: Math.round((todayOrders.length / Math.max(activeOrders.length, 1)) * 10)
  };
}

function generateItemAnalytics(period: string, locationId?: LocationId, limit: number = 10) {
  const orders = locationId 
    ? dataStore.getOrdersByLocation(locationId)
    : dataStore.getOrders();

  const filteredOrders = filterOrdersByPeriod(orders, period);
  
  const itemStats: Record<string, {
    name: string;
    quantity: number;
    revenue: number;
    orders: number;
    category: string;
  }> = {};

  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemStats[item.name]) {
        itemStats[item.name] = {
          name: item.name,
          quantity: 0,
          revenue: 0,
          orders: 0,
          category: item.category
        };
      }
      
      itemStats[item.name].quantity += item.quantity;
      itemStats[item.name].revenue += item.price * item.quantity;
      itemStats[item.name].orders++;
    });
  });

  const topItems = Object.values(itemStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);

  // Category breakdown
  const categoryStats: Record<string, number> = {};
  topItems.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + item.quantity;
  });

  return {
    period,
    topItems,
    categoryBreakdown: categoryStats,
    totalItemsSold: Object.values(itemStats).reduce((sum, item) => sum + item.quantity, 0),
    totalItemRevenue: Object.values(itemStats).reduce((sum, item) => sum + item.revenue, 0)
  };
}

function generateLocationComparison(period: string) {
  const locations = dataStore.getLocations();
  
  const comparison = locations.map(location => {
    const orders = filterOrdersByPeriod(
      dataStore.getOrdersByLocation(location.id), 
      period
    );
    
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;
    
    return {
      locationId: location.id,
      locationName: location.name,
      orders: orders.length,
      revenue: Math.round(revenue * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      status: location.status,
      kitchenLoad: location.stats.kitchenLoad
    };
  });

  return {
    period,
    locations: comparison,
    topPerformer: comparison.reduce((top, current) => 
      current.revenue > top.revenue ? current : top
    ),
    totalRevenue: comparison.reduce((sum, loc) => sum + loc.revenue, 0),
    totalOrders: comparison.reduce((sum, loc) => sum + loc.orders, 0)
  };
}

function generateRealTimeMetrics(locationId?: LocationId) {
  const orders = locationId 
    ? dataStore.getOrdersByLocation(locationId)
    : dataStore.getOrders();

  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentOrders = orders.filter(order => order.createdAt >= lastHour);
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status)
  );

  return {
    timestamp: now.toISOString(),
    activeOrders: activeOrders.length,
    ordersLastHour: recentOrders.length,
    avgWaitTime: Math.round(Math.random() * 10 + 5), // Mock metric
    kitchenCapacity: Math.round((activeOrders.length / 15) * 100), // Assuming max 15 orders
    currentRevenue: recentOrders.reduce((sum, order) => sum + order.total, 0),
    busyDrivers: dataStore.getDrivers().filter(d => d.status === 'busy').length,
    availableDrivers: dataStore.getDrivers().filter(d => d.status === 'available').length
  };
}

function filterOrdersByPeriod(orders: any[], period: string) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
  }

  return orders.filter(order => order.createdAt >= startDate);
}

export { router as analyticsRouter };