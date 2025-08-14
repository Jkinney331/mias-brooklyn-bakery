'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Users, Phone, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTime, getStatusColor, cn } from '@/lib/utils';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.id as string;

  const { user, canAccessLocation } = useAuthStore();
  const { locations, orders, updateOrderStatus } = useAppStore();

  const location = locations.find(loc => loc.id === locationId);

  if (!location) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Location Not Found</h1>
            <p className="text-gray-600 mb-4">The location you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/locations')}>
              Back to Locations
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!canAccessLocation(locationId)) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-warning-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to view this location.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const locationOrders = orders.filter(order => order.locationId === locationId);
  const todayOrders = locationOrders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const activeOrders = locationOrders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );

  const handleUpdateStatus = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/locations')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-bakery-brown">{location.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <p className="text-gray-600">{location.address}</p>
              </div>
            </div>
          </div>
          <Badge 
            variant={location.status === 'open' ? 'success' : location.status === 'busy' ? 'warning' : 'error'}
            className="text-lg px-4 py-2"
          >
            {location.status.toUpperCase()}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Orders</p>
                <p className="text-3xl font-bold text-gray-900">{todayOrders.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(location.stats.todayRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-3xl font-bold text-gray-900">{activeOrders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kitchen Load</p>
                <Badge 
                  variant={
                    location.stats.kitchenLoad === 'high' ? 'error' :
                    location.stats.kitchenLoad === 'medium' ? 'warning' : 'success'
                  }
                  className="mt-1"
                >
                  {location.stats.kitchenLoad.toUpperCase()}
                </Badge>
              </div>
              <AlertTriangle className={cn(
                'h-8 w-8',
                location.stats.kitchenLoad === 'high' ? 'text-red-500' :
                location.stats.kitchenLoad === 'medium' ? 'text-yellow-500' : 'text-green-500'
              )} />
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Manager</p>
                  <p className="font-medium">{location.manager}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{location.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Hours</p>
                  <p className="font-medium">{location.hours.open} - {location.hours.close}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Average Prep Time</p>
                  <p className="font-medium">{location.stats.avgPrepTime} minutes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {activeOrders.slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No active orders</p>
              ) : (
                activeOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-500">{order.customerName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status}
                      </Badge>
                      <span className="font-medium">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {activeOrders.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => router.push('/orders')}
              >
                View All Orders ({activeOrders.length})
              </Button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => router.push('/orders')}>
            View All Orders
          </Button>
          <Button variant="secondary" onClick={() => router.push('/delivery')}>
            Track Deliveries
          </Button>
          {user?.role === 'owner' && (
            <Button variant="secondary" onClick={() => router.push('/admin')}>
              Manage Settings
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}