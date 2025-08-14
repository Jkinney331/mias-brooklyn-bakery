'use client';

import { useState } from 'react';
import { User, Phone, Star, MapPin, Clock, Bike, Car, Zap, Plus } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DriversPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  const { drivers, orders, updateDriverStatus } = useAppStore();
  const { user, hasPermission } = useAuthStore();

  const canManageDrivers = hasPermission('drivers', 'write');

  const getFilteredDrivers = () => {
    if (selectedStatus === 'all') return drivers;
    return drivers.filter(driver => driver.status === selectedStatus);
  };

  const filteredDrivers = getFilteredDrivers();

  const getDriverOrders = (driverId: string) => {
    return orders.filter(order => order.assignedDriverId === driverId);
  };

  const getActiveDeliveries = (driverId: string) => {
    return orders.filter(order => 
      order.assignedDriverId === driverId && 
      order.status === 'out-for-delivery'
    );
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'bike':
        return <Bike className="h-4 w-4" />;
      case 'car':
        return <Car className="h-4 w-4" />;
      case 'scooter':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bike className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (driverId: string, newStatus: any) => {
    if (canManageDrivers) {
      updateDriverStatus(driverId, newStatus);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-bakery-brown">Drivers</h1>
            <p className="text-gray-600 mt-1">
              Manage delivery drivers and track their performance.
            </p>
          </div>
          {canManageDrivers && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.status === 'available').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Busy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.status === 'busy').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.status === 'offline').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-bakery p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'available', 'busy', 'offline'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedStatus === status
                    ? 'bg-brooklyn-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {status === 'all' ? 'All Drivers' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => {
            const activeDeliveries = getActiveDeliveries(driver.id);
            const totalOrders = getDriverOrders(driver.id);

            return (
              <div key={driver.id} className="bg-white rounded-xl shadow-bakery p-6">
                {/* Driver Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-brooklyn-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{driver.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    driver.status === 'available' ? 'success' :
                    driver.status === 'busy' ? 'warning' : 'default'
                  }>
                    {driver.status}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{driver.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{driver.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {getVehicleIcon(driver.vehicle.type)}
                    <span className="capitalize">
                      {driver.vehicle.type}
                      {driver.vehicle.licensePlate && ` • ${driver.vehicle.licensePlate}`}
                    </span>
                  </div>
                </div>

                {/* Current Location */}
                {driver.currentLocation && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {driver.currentLocation.lat.toFixed(4)}, {driver.currentLocation.lng.toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{activeDeliveries.length}</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{driver.totalDeliveries}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>

                {/* Current Assignments */}
                {activeDeliveries.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Current Deliveries:</p>
                    <div className="space-y-1">
                      {activeDeliveries.map((order) => (
                        <div key={order.id} className="text-xs bg-blue-50 p-2 rounded">
                          <span className="font-medium">#{order.id}</span>
                          <span className="text-gray-600 ml-2">{order.customerName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {canManageDrivers && (
                  <div className="flex space-x-2">
                    {driver.status === 'offline' && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleStatusChange(driver.id, 'available')}
                      >
                        Set Available
                      </Button>
                    )}
                    {driver.status === 'available' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleStatusChange(driver.id, 'offline')}
                      >
                        Set Offline
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-bakery p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Driver</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Total Deliveries</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Active Orders</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Vehicle</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-brooklyn-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {driver.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{driver.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        driver.status === 'available' ? 'success' :
                        driver.status === 'busy' ? 'warning' : 'default'
                      }>
                        {driver.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{driver.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{driver.totalDeliveries}</td>
                    <td className="py-3 px-4">{driver.assignedOrders.length}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {getVehicleIcon(driver.vehicle.type)}
                        <span className="capitalize">{driver.vehicle.type}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}