'use client';

import { useState } from 'react';
import { MapPin, Clock, Phone, User, Navigation, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTime, cn } from '@/lib/utils';

export default function DeliveryPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  const { orders, drivers, locations, assignOrderToDriver, updateOrderStatus } = useAppStore();
  const { user } = useAuthStore();

  // Filter delivery orders based on user access
  const getDeliveryOrders = () => {
    let deliveryOrders = orders.filter(order => order.type === 'delivery');
    
    if (user?.role !== 'owner') {
      deliveryOrders = deliveryOrders.filter(order => 
        user?.locationId ? order.locationId === user.locationId : true
      );
    }

    if (selectedFilter !== 'all') {
      deliveryOrders = deliveryOrders.filter(order => order.status === selectedFilter);
    }

    return deliveryOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const deliveryOrders = getDeliveryOrders();
  const activeDeliveries = deliveryOrders.filter(order => 
    ['ready', 'out-for-delivery'].includes(order.status)
  );

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || locationId;
  };

  const getDriverName = (driverId: string) => {
    return drivers.find(driver => driver.id === driverId)?.name || 'Unassigned';
  };

  const getAvailableDrivers = () => {
    return drivers.filter(driver => driver.status === 'available');
  };

  const handleAssignDriver = (orderId: string, driverId: string) => {
    assignOrderToDriver(orderId, driverId);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-bakery-brown">Delivery Tracking</h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage all delivery orders in real-time.
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="ghost" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{activeDeliveries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveryOrders.filter(order => {
                    const today = new Date();
                    const orderDate = new Date(order.createdAt);
                    return orderDate.toDateString() === today.toDateString() && order.status === 'delivered';
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <User className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Available Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{getAvailableDrivers().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">24min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-bakery p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'ready', 'out-for-delivery', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedFilter(status)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedFilter === status
                    ? 'bg-brooklyn-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {status === 'all' ? 'All Orders' : status.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Orders */}
        <div className="space-y-4">
          {deliveryOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-bakery p-12 text-center">
              <Navigation className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery orders found</h3>
              <p className="text-gray-500">There are no delivery orders matching your filter criteria.</p>
            </div>
          ) : (
            deliveryOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-bakery p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">#{order.id}</h3>
                      <Badge variant={
                        order.status === 'delivered' ? 'success' :
                        order.status === 'out-for-delivery' ? 'info' :
                        order.status === 'ready' ? 'warning' : 'default'
                      }>
                        {order.status.replace('-', ' ')}
                      </Badge>
                      {user?.role === 'owner' && (
                        <span className={cn(
                          'text-xs px-2 py-1 rounded',
                          `bg-${locations.find(l => l.id === order.locationId)?.colorClass}-100`,
                          `text-${locations.find(l => l.id === order.locationId)?.colorClass}-800`
                        )}>
                          {getLocationName(order.locationId)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">{order.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">Ordered: {formatTime(order.createdAt)}</p>
                          {order.estimatedReadyTime && (
                            <p className="text-xs text-gray-500">
                              Est. Ready: {formatTime(order.estimatedReadyTime)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            Driver: {order.assignedDriverId ? getDriverName(order.assignedDriverId) : 'Not assigned'}
                          </p>
                          {order.assignedDriverId && (
                            <p className="text-xs text-gray-500">
                              Status: {drivers.find(d => d.id === order.assignedDriverId)?.status || 'unknown'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">
                        {order.items.length} item(s) • {formatCurrency(order.total)}
                      </p>
                      <div className="text-xs text-gray-500">
                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-gray-500">{order.paymentStatus}</p>
                    </div>

                    {/* Status-specific actions */}
                    <div className="flex flex-col space-y-2">
                      {order.status === 'ready' && !order.assignedDriverId && (
                        <div className="space-y-2">
                          <select
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            onChange={(e) => e.target.value && handleAssignDriver(order.id, e.target.value)}
                          >
                            <option value="">Assign Driver</option>
                            {getAvailableDrivers().map(driver => (
                              <option key={driver.id} value={driver.id}>
                                {driver.name} ({driver.vehicle.type})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {order.status === 'ready' && order.assignedDriverId && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'out-for-delivery')}
                        >
                          Start Delivery
                        </Button>
                      )}

                      {order.status === 'out-for-delivery' && (
                        <div className="space-y-2">
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                          >
                            Mark Delivered
                          </Button>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost">
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MapPin className="h-3 w-3 mr-1" />
                              Track
                            </Button>
                          </div>
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Delivered</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}