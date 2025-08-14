'use client';

import { useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Truck
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { MainLayout } from '@/components/layout/main-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatTime, getStatusColor, cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { 
    locations, 
    orders, 
    drivers, 
    selectedLocationId,
    setSelectedLocation,
    addNotification 
  } = useAppStore();

  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Filter data based on selected location or user role
  const getFilteredLocations = () => {
    if (user?.role === 'owner') {
      return selectedLocationId ? locations.filter(loc => loc.id === selectedLocationId) : locations;
    }
    return locations.filter(loc => loc.id === user?.locationId);
  };

  const getFilteredOrders = () => {
    const locationIds = getFilteredLocations().map(loc => loc.id);
    return orders.filter(order => locationIds.includes(order.locationId));
  };

  const filteredLocations = getFilteredLocations();
  const filteredOrders = getFilteredOrders();
  
  const todayOrders = filteredOrders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0;
  const activeOrders = filteredOrders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status)
  );

  const recentOrders = filteredOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const availableDrivers = drivers.filter(driver => driver.status === 'available').length;
  const busyDrivers = drivers.filter(driver => driver.status === 'busy').length;

  const handleQuickAction = (action: string, data?: any) => {
    switch (action) {
      case 'view-orders':
        window.location.href = '/orders';
        break;
      case 'view-deliveries':
        window.location.href = '/delivery';
        break;
      case 'view-location':
        window.location.href = `/locations/${data.locationId}`;
        break;
      default:
        addNotification({
          type: 'system',
          priority: 'low',
          title: 'Feature Coming Soon',
          message: `${action} feature will be available in the next update.`,
          read: false
        });
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-bakery-brown">
              Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening at {filteredLocations.length === 1 ? filteredLocations[0].name : 'your locations'} today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => handleQuickAction('view-orders')}>
              View All Orders
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-900">{todayOrders.length}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Avg order: {formatCurrency(avgOrderValue)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">
                {activeOrders.filter(o => o.status === 'preparing').length} preparing
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{availableDrivers + busyDrivers}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{availableDrivers} available</span>
              <span className="text-gray-500 ml-1">• {busyDrivers} busy</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Status */}
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {filteredLocations.length === 1 ? 'Location Status' : 'Locations Overview'}
            </h3>
            <div className="space-y-4">
              {filteredLocations.map((location) => (
                <div 
                  key={location.id}
                  className={cn(
                    'p-4 rounded-lg border-2 cursor-pointer transition-all',
                    `location-card-${location.colorClass}`
                  )}
                  onClick={() => handleQuickAction('view-location', { locationId: location.id })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn('w-3 h-3 rounded-full', `bg-${location.colorClass}-500`)}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{location.name}</h4>
                        <p className="text-sm text-gray-500">{location.manager}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={location.status === 'open' ? 'success' : location.status === 'busy' ? 'warning' : 'error'}>
                        {location.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{location.stats.activeOrders} active</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Today's Orders</span>
                      <p className="font-medium">{location.stats.todayOrders}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue</span>
                      <p className="font-medium">{formatCurrency(location.stats.todayRevenue)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Kitchen Load</span>
                    <Badge variant={
                      location.stats.kitchenLoad === 'high' ? 'error' :
                      location.stats.kitchenLoad === 'medium' ? 'warning' : 'success'
                    }>
                      {location.stats.kitchenLoad}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleQuickAction('view-orders')}
              >
                View all
              </Button>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent orders</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        getStatusColor(order.status) === 'success' && 'bg-green-500',
                        getStatusColor(order.status) === 'warning' && 'bg-yellow-500',
                        getStatusColor(order.status) === 'error' && 'bg-red-500',
                        getStatusColor(order.status) === 'info' && 'bg-blue-500'
                      )}></div>
                      <div>
                        <p className="font-medium text-gray-900">#{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-bakery p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleQuickAction('new-order')}
            >
              <ShoppingBag className="h-8 w-8 mb-2" />
              New Order
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleQuickAction('view-deliveries')}
            >
              <Truck className="h-8 w-8 mb-2" />
              Track Deliveries
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleQuickAction('kitchen-display')}
            >
              <Clock className="h-8 w-8 mb-2" />
              Kitchen Display
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleQuickAction('reports')}
            >
              <TrendingUp className="h-8 w-8 mb-2" />
              View Reports
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}