'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Truck,
  BarChart3,
  Store,
  ArrowRight,
  ArrowUp,
  Package,
  Navigation,
  Activity
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { MainLayout } from '@/components/layout/main-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatTime, getStatusColor, cn } from '@/lib/utils';
import { LocationId } from '@/types';

type ViewMode = 'all' | LocationId;

export default function MasterDashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('today');
  
  const { user } = useAuthStore();
  const { 
    locations, 
    orders, 
    drivers, 
    notifications,
    addNotification 
  } = useAppStore();

  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Filter data based on view mode
  const getFilteredLocations = () => {
    if (viewMode === 'all') {
      return locations;
    }
    return locations.filter(loc => loc.id === viewMode);
  };

  const getFilteredOrders = () => {
    const filteredLocations = getFilteredLocations();
    const locationIds = filteredLocations.map(loc => loc.id);
    return orders.filter(order => locationIds.includes(order.locationId));
  };

  const filteredLocations = getFilteredLocations();
  const filteredOrders = getFilteredOrders();
  
  // Calculate metrics
  const calculateMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    });

    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0;
    const activeOrders = filteredOrders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status)
    );

    return {
      todayOrders: todayOrders.length,
      totalRevenue,
      avgOrderValue,
      activeOrders: activeOrders.length,
      deliveryOrders: todayOrders.filter(o => o.type === 'delivery').length,
      pickupOrders: todayOrders.filter(o => o.type === 'pickup').length,
      completedOrders: todayOrders.filter(o => o.status === 'delivered').length
    };
  };

  const metrics = calculateMetrics();

  // Get location-specific metrics
  const getLocationMetrics = (locationId: LocationId) => {
    const locationOrders = orders.filter(order => order.locationId === locationId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = locationOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    });

    const revenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const activeOrders = locationOrders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status)
    );

    return {
      orders: todayOrders.length,
      revenue,
      activeOrders: activeOrders.length,
      avgOrderValue: todayOrders.length > 0 ? revenue / todayOrders.length : 0
    };
  };

  // Get driver metrics
  const getDriverMetrics = () => {
    const available = drivers.filter(d => d.status === 'available').length;
    const busy = drivers.filter(d => d.status === 'busy').length;
    const offline = drivers.filter(d => d.status === 'offline').length;
    
    return { available, busy, offline, total: drivers.length };
  };

  const driverMetrics = getDriverMetrics();

  // Handle quick actions
  const handleQuickAction = (action: string, data?: any) => {
    switch (action) {
      case 'view-orders':
        window.location.href = '/orders';
        break;
      case 'view-deliveries':
        window.location.href = '/delivery';
        break;
      case 'view-analytics':
        window.location.href = '/analytics';
        break;
      case 'manage-inventory':
        addNotification({
          type: 'system',
          priority: 'low',
          title: 'Inventory Management',
          message: 'Inventory management feature coming soon.',
          read: false
        });
        break;
      default:
        break;
    }
  };

  const locationToggleData = [
    { id: 'all' as const, name: 'All Locations', icon: Store },
    { id: 'brooklyn' as const, name: 'Brooklyn', color: '#5A9FA8' },
    { id: 'ues' as const, name: 'Upper East Side', color: '#D4A574' },
    { id: 'times-square' as const, name: 'Times Square', color: '#8B7AA1' }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header with Location Toggle */}
        <div className="bg-white rounded-xl shadow-bakery p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-serif font-bold text-bakery-brown">
                Master Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Unified command center for all Mia's locations
              </p>
            </div>
            
            {/* Location Toggle Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {locationToggleData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setViewMode(item.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                    'border-2 min-w-[120px]',
                    viewMode === item.id
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  )}
                  style={{
                    backgroundColor: viewMode === item.id ? (item.color || '#5A9FA8') : undefined,
                    borderColor: viewMode === item.id ? (item.color || '#5A9FA8') : undefined
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </div>
                  {item.id !== 'all' && viewMode === item.id && (
                    <div className="text-xs mt-1 opacity-90">
                      {locations.find(l => l.id === item.id)?.address.split(',')[0]}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unified Metrics Bar */}
        <div className="bg-gradient-to-r from-brooklyn-600 to-brooklyn-500 rounded-xl p-6 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div>
              <p className="text-brooklyn-100 text-sm">Total Orders</p>
              <p className="text-3xl font-bold">{metrics.todayOrders}</p>
              <p className="text-brooklyn-100 text-xs mt-1">
                <ArrowUp className="h-3 w-3 inline" /> +15% vs yesterday
              </p>
            </div>
            <div>
              <p className="text-brooklyn-100 text-sm">Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
              <p className="text-brooklyn-100 text-xs mt-1">
                Avg: {formatCurrency(metrics.avgOrderValue)}
              </p>
            </div>
            <div>
              <p className="text-brooklyn-100 text-sm">Active Orders</p>
              <p className="text-3xl font-bold">{metrics.activeOrders}</p>
              <p className="text-brooklyn-100 text-xs mt-1">
                {metrics.deliveryOrders} delivery
              </p>
            </div>
            <div>
              <p className="text-brooklyn-100 text-sm">Completed</p>
              <p className="text-3xl font-bold">{metrics.completedOrders}</p>
              <p className="text-brooklyn-100 text-xs mt-1">
                98% on-time
              </p>
            </div>
            <div>
              <p className="text-brooklyn-100 text-sm">Satisfaction</p>
              <p className="text-3xl font-bold">4.8⭐</p>
              <p className="text-brooklyn-100 text-xs mt-1">
                +0.2 this week
              </p>
            </div>
            <div>
              <p className="text-brooklyn-100 text-sm">Drivers Active</p>
              <p className="text-3xl font-bold">{driverMetrics.available + driverMetrics.busy}</p>
              <p className="text-brooklyn-100 text-xs mt-1">
                {driverMetrics.available} available
              </p>
            </div>
            <div>
              <p className="text-brooklyn-100 text-sm">Avg Delivery</p>
              <p className="text-3xl font-bold">24min</p>
              <p className="text-brooklyn-100 text-xs mt-1">
                -3min vs last week
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Location Comparison Panel */}
          {viewMode === 'all' ? (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-bakery p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Location Performance Comparison</h3>
                  <div className="flex space-x-2">
                    {['today', 'week', 'month'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setSelectedTimeRange(range as any)}
                        className={cn(
                          'px-3 py-1 rounded text-sm',
                          selectedTimeRange === range
                            ? 'bg-brooklyn-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {locations.map((location) => {
                    const locationMetrics = getLocationMetrics(location.id);
                    return (
                      <div 
                        key={location.id}
                        className="border-2 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                        style={{ borderColor: location.color }}
                        onClick={() => setViewMode(location.id)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: location.color }}
                            />
                            <h4 className="font-medium text-gray-900">{location.name}</h4>
                          </div>
                          <Badge variant={
                            location.status === 'open' ? 'success' : 
                            location.status === 'busy' ? 'warning' : 'error'
                          }>
                            {location.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Orders</span>
                            <span className="font-semibold">{locationMetrics.orders}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Revenue</span>
                            <span className="font-semibold">{formatCurrency(locationMetrics.revenue)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Active</span>
                            <span className="font-semibold">{locationMetrics.activeOrders}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Avg Order</span>
                            <span className="font-semibold">{formatCurrency(locationMetrics.avgOrderValue)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Kitchen Load</span>
                            <Badge variant={
                              location.stats.kitchenLoad === 'high' ? 'error' :
                              location.stats.kitchenLoad === 'medium' ? 'warning' : 'success'
                            } size="sm">
                              {location.stats.kitchenLoad}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Manager</span>
                            <span className="font-medium">{location.manager}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-gray-500">Prep Time</span>
                            <span className="font-medium">{location.stats.avgPrepTime} min</span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          className="w-full mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewMode(location.id);
                          }}
                        >
                          View Details <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                
                {/* Cross-Location Insights */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Cross-Location Insights</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Best Performer</p>
                      <p className="font-semibold">Times Square</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Highest Avg Order</p>
                      <p className="font-semibold">Upper East Side</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fastest Delivery</p>
                      <p className="font-semibold">Brooklyn</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Transfer Needed</p>
                      <p className="font-semibold text-amber-600">2 items to UES</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Single Location Detail View */
            <>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-bakery p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {locations.find(l => l.id === viewMode)?.name} Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Today's Orders</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {getLocationMetrics(viewMode as LocationId).orders}
                          </p>
                        </div>
                        <ShoppingBag className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(getLocationMetrics(viewMode as LocationId).revenue)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Activity */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      {filteredOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              'w-2 h-2 rounded-full',
                              order.status === 'delivered' ? 'bg-green-500' :
                              order.status === 'preparing' ? 'bg-yellow-500' : 'bg-blue-500'
                            )} />
                            <div>
                              <p className="text-sm font-medium">Order #{order.id}</p>
                              <p className="text-xs text-gray-500">{order.customerName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                            <p className="text-xs text-gray-500">{formatTime(order.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-bakery p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Info</h3>
                  {locations.filter(l => l.id === viewMode).map((location) => (
                    <div key={location.id} className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{location.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{location.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Manager</p>
                        <p className="font-medium">{location.manager}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Hours</p>
                        <p className="font-medium">{location.hours.open} - {location.hours.close}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge variant={
                          location.status === 'open' ? 'success' :
                          location.status === 'busy' ? 'warning' : 'error'
                        }>
                          {location.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-xl shadow-bakery p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Command Center</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleQuickAction('view-orders')}
            >
              <ShoppingBag className="h-8 w-8 mb-2 text-brooklyn-600" />
              <span className="font-medium">Order Management</span>
              <span className="text-xs text-gray-500 mt-1">{metrics.activeOrders} active</span>
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleQuickAction('view-deliveries')}
            >
              <Truck className="h-8 w-8 mb-2 text-brooklyn-600" />
              <span className="font-medium">Delivery Center</span>
              <span className="text-xs text-gray-500 mt-1">{driverMetrics.busy} en route</span>
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleQuickAction('view-analytics')}
            >
              <BarChart3 className="h-8 w-8 mb-2 text-brooklyn-600" />
              <span className="font-medium">Analytics</span>
              <span className="text-xs text-gray-500 mt-1">Real-time data</span>
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleQuickAction('manage-inventory')}
            >
              <Package className="h-8 w-8 mb-2 text-brooklyn-600" />
              <span className="font-medium">Inventory</span>
              <span className="text-xs text-gray-500 mt-1">2 transfers pending</span>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}