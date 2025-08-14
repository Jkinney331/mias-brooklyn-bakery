'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Clock, Users, TrendingUp, Phone, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';

export default function LocationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { locations, orders, setSelectedLocation } = useAppStore();

  // Filter locations based on user role
  const getAccessibleLocations = () => {
    if (user?.role === 'owner') {
      return locations;
    }
    return locations.filter(loc => user?.locationId ? loc.id === user.locationId : false);
  };

  const accessibleLocations = getAccessibleLocations();

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId as any);
    router.push(`/locations/${locationId}`);
  };

  const getLocationOrders = (locationId: string) => {
    return orders.filter(order => order.locationId === locationId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'busy':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>;
      case 'closed':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-bakery-brown">Locations</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'owner' 
                ? 'Monitor and manage all bakery locations.' 
                : 'Your assigned location overview.'
              }
            </p>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleLocations.map((location) => {
            const locationOrders = getLocationOrders(location.id);
            const todayOrders = locationOrders.filter(order => {
              const today = new Date();
              const orderDate = new Date(order.createdAt);
              return orderDate.toDateString() === today.toDateString();
            });

            return (
              <div
                key={location.id}
                className={cn(
                  'bg-white rounded-xl shadow-bakery p-6 cursor-pointer transition-all duration-200 hover:shadow-location border-2',
                  `location-card-${location.colorClass}`,
                  `hover:border-${location.colorClass}-300`
                )}
                onClick={() => handleLocationSelect(location.id)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn('w-4 h-4 rounded-full', `bg-${location.colorClass}-500`)}></div>
                    <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(location.status)}
                    <Badge 
                      variant={
                        location.status === 'open' ? 'success' :
                        location.status === 'busy' ? 'warning' : 'error'
                      }
                    >
                      {location.status}
                    </Badge>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{location.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{location.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{location.hours.open} - {location.hours.close}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Manager: {location.manager}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{location.stats.todayOrders}</p>
                    <p className="text-xs text-gray-500">Today's Orders</p>
                  </div>
                  <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(location.stats.todayRevenue)}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{location.stats.activeOrders}</p>
                    <p className="text-xs text-gray-500">Active Orders</p>
                  </div>
                  <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{location.stats.avgPrepTime}m</p>
                    <p className="text-xs text-gray-500">Avg Prep Time</p>
                  </div>
                </div>

                {/* Kitchen Load Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kitchen Load</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      location.stats.kitchenLoad === 'high' ? 'error' :
                      location.stats.kitchenLoad === 'medium' ? 'warning' : 'success'
                    }>
                      {location.stats.kitchenLoad}
                    </Badge>
                    {location.stats.kitchenLoad === 'high' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/locations/${location.id}/orders`);
                      }}
                    >
                      View Orders
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/locations/${location.id}/kitchen`);
                      }}
                    >
                      Kitchen View
                    </Button>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className={cn(
                      'h-4 w-4',
                      todayOrders.length > location.stats.todayOrders * 0.8 ? 'text-green-500' : 'text-gray-400'
                    )} />
                    <span className="text-xs text-gray-500">
                      {todayOrders.length > location.stats.todayOrders * 0.8 
                        ? 'Performing well today' 
                        : 'Normal operations'
                      }
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats for Owner */}
        {user?.role === 'owner' && (
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {locations.reduce((sum, loc) => sum + loc.stats.todayOrders, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Orders Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(locations.reduce((sum, loc) => sum + loc.stats.todayRevenue, 0))}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {locations.reduce((sum, loc) => sum + loc.stats.activeOrders, 0)}
                </p>
                <p className="text-sm text-gray-500">Active Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(locations.reduce((sum, loc) => sum + loc.stats.avgPrepTime, 0) / locations.length)}m
                </p>
                <p className="text-sm text-gray-500">Avg Prep Time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}