'use client';

import { useState } from 'react';
import { Search, Filter, Plus, Clock, MapPin, Phone, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTime, getStatusColor, cn } from '@/lib/utils';
import { Order } from '@/types';

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { user } = useAuthStore();
  const { 
    orders, 
    locations, 
    selectedLocationId, 
    updateOrderStatus,
    addNotification 
  } = useAppStore();

  // Filter orders based on user role and selected location
  const getFilteredOrders = () => {
    let filteredOrders = orders;

    // Filter by user's location access
    if (user?.role !== 'owner') {
      filteredOrders = filteredOrders.filter(order => 
        user?.locationId ? order.locationId === user.locationId : true
      );
    } else if (selectedLocationId) {
      filteredOrders = filteredOrders.filter(order => order.locationId === selectedLocationId);
    }

    // Apply search filter
    if (searchQuery) {
      filteredOrders = filteredOrders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.type === typeFilter);
    }

    return filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredOrders = getFilteredOrders();

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    
    addNotification({
      type: 'order',
      priority: 'medium',
      title: 'Order Status Updated',
      message: `Order ${orderId} status changed to ${newStatus.replace('-', ' ')}`,
      orderId,
    });
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || locationId;
  };

  const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-bakery-brown">Orders</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all orders across your locations.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-bakery p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer name, or phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brooklyn-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brooklyn-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brooklyn-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
                <option value="dine-in">Dine In</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {filteredOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length}
              </p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {filteredOrders.filter(o => ['ready', 'delivered'].includes(o.status)).length}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(filteredOrders.reduce((sum, order) => sum + order.total, 0))}
              </p>
              <p className="text-sm text-gray-500">Total Value</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-bakery p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-bakery p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">#{order.id}</h3>
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status.replace('-', ' ')}
                      </Badge>
                      <Badge variant="default">
                        {order.type}
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
                        <span className="text-gray-900">{order.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{order.customerPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{formatTime(order.createdAt)}</span>
                      </div>
                      {order.deliveryAddress && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 truncate">{order.deliveryAddress}</span>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                            {item.specialRequests && (
                              <span className="text-gray-400 ml-1">({item.specialRequests})</span>
                            )}
                          </span>
                          <span className="text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-gray-500">{order.paymentStatus}</p>
                    </div>

                    {/* Status Actions */}
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(order.id, 'confirmed')}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleStatusChange(order.id, 'cancelled')}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <Button size="sm" onClick={() => handleStatusChange(order.id, 'preparing')}>
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button size="sm" onClick={() => handleStatusChange(order.id, 'ready')}>
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && order.type === 'delivery' && (
                        <Button size="sm" onClick={() => handleStatusChange(order.id, 'out-for-delivery')}>
                          Send for Delivery
                        </Button>
                      )}
                      {order.status === 'out-for-delivery' && (
                        <Button size="sm" onClick={() => handleStatusChange(order.id, 'delivered')}>
                          Mark Delivered
                        </Button>
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