'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Clock, 
  AlertCircle,
  Activity,
  TrendingUp,
  Package,
  Users,
  Filter,
  Zap,
  Home,
  Target
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTime, cn } from '@/lib/utils';
import { LocationId } from '@/types';

interface DeliveryZoneData {
  id: string;
  name: string;
  locationId: LocationId;
  density: 'low' | 'medium' | 'high';
  activeDeliveries: number;
  avgDeliveryTime: number;
  coverage: string[];
  color: string;
  heatLevel: number; // 0-100
}

export default function DeliveryOperationsPage() {
  const [selectedLocation, setSelectedLocation] = useState<LocationId | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [mapView, setMapView] = useState<'zones' | 'drivers' | 'heat'>('zones');
  
  const { orders, drivers, locations } = useAppStore();
  const { user } = useAuthStore();

  // Mock delivery zone data
  const deliveryZones: DeliveryZoneData[] = [
    // Brooklyn zones
    {
      id: 'bk-primary',
      name: 'Brooklyn Primary',
      locationId: 'brooklyn',
      density: 'high',
      activeDeliveries: 8,
      avgDeliveryTime: 22,
      coverage: ['Cobble Hill', 'Carroll Gardens', 'Boerum Hill', 'Park Slope'],
      color: '#3B82F6',
      heatLevel: 85
    },
    {
      id: 'bk-extended',
      name: 'Brooklyn Extended',
      locationId: 'brooklyn',
      density: 'medium',
      activeDeliveries: 4,
      avgDeliveryTime: 28,
      coverage: ['Dumbo', 'Brooklyn Heights', 'Fort Greene', 'Prospect Heights'],
      color: '#60A5FA',
      heatLevel: 55
    },
    // UES zones
    {
      id: 'ues-primary',
      name: 'UES Primary',
      locationId: 'ues',
      density: 'high',
      activeDeliveries: 6,
      avgDeliveryTime: 20,
      coverage: ['Upper East Side', 'Yorkville', 'Lenox Hill'],
      color: '#10B981',
      heatLevel: 75
    },
    {
      id: 'ues-extended',
      name: 'UES Extended',
      locationId: 'ues',
      density: 'low',
      activeDeliveries: 2,
      avgDeliveryTime: 32,
      coverage: ['East Harlem', 'Roosevelt Island', 'Midtown East'],
      color: '#34D399',
      heatLevel: 35
    },
    // Times Square zones
    {
      id: 'ts-primary',
      name: 'Times Square Primary',
      locationId: 'times-square',
      density: 'high',
      activeDeliveries: 10,
      avgDeliveryTime: 18,
      coverage: ['Hell\'s Kitchen', 'Midtown West', 'Theater District'],
      color: '#F59E0B',
      heatLevel: 95
    },
    {
      id: 'ts-extended',
      name: 'Times Square Extended',
      locationId: 'times-square',
      density: 'medium',
      activeDeliveries: 5,
      avgDeliveryTime: 25,
      coverage: ['Chelsea', 'Hudson Yards', 'Columbus Circle'],
      color: '#FCD34D',
      heatLevel: 60
    }
  ];

  const getFilteredZones = () => {
    if (selectedLocation === 'all') return deliveryZones;
    return deliveryZones.filter(zone => zone.locationId === selectedLocation);
  };

  const filteredZones = getFilteredZones();

  // Get active deliveries by zone
  const getActiveDeliveriesByZone = (zoneId: string) => {
    const zone = deliveryZones.find(z => z.id === zoneId);
    if (!zone) return [];
    
    return orders.filter(order => 
      order.type === 'delivery' &&
      order.locationId === zone.locationId &&
      ['ready', 'out-for-delivery'].includes(order.status)
    );
  };

  // Calculate zone performance metrics
  const calculateZoneMetrics = () => {
    const totalDeliveries = filteredZones.reduce((sum, zone) => sum + zone.activeDeliveries, 0);
    const avgTime = filteredZones.reduce((sum, zone) => sum + zone.avgDeliveryTime, 0) / filteredZones.length;
    const highDensityZones = filteredZones.filter(zone => zone.density === 'high').length;
    
    return {
      totalDeliveries,
      avgTime: Math.round(avgTime),
      highDensityZones,
      totalZones: filteredZones.length
    };
  };

  const zoneMetrics = calculateZoneMetrics();

  // Get driver distribution
  const getDriverDistribution = () => {
    const distribution: Record<string, number> = {};
    
    drivers.forEach(driver => {
      if (driver.status === 'busy' && driver.assignedOrders.length > 0) {
        // Mock assignment to zones based on current orders
        const order = orders.find(o => driver.assignedOrders.includes(o.id));
        if (order) {
          const zone = deliveryZones.find(z => z.locationId === order.locationId);
          if (zone) {
            distribution[zone.id] = (distribution[zone.id] || 0) + 1;
          }
        }
      }
    });
    
    return distribution;
  };

  const driverDistribution = getDriverDistribution();

  // Get delivery performance by hour
  const getHourlyPerformance = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const performance = hours.map(hour => {
      const hourOrders = orders.filter(order => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === hour && order.type === 'delivery';
      });
      
      return {
        hour,
        orders: hourOrders.length,
        avgTime: 20 + Math.floor(Math.random() * 15) // Mock data
      };
    });
    
    return performance;
  };

  const getHeatMapColor = (heatLevel: number) => {
    if (heatLevel >= 80) return 'bg-red-500';
    if (heatLevel >= 60) return 'bg-orange-500';
    if (heatLevel >= 40) return 'bg-yellow-500';
    if (heatLevel >= 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-bakery p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-serif font-bold text-bakery-brown">
                Delivery Operations Center
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time delivery zone management and optimization
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as LocationId | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              
              {/* Map View Toggle */}
              <div className="flex space-x-2">
                {(['zones', 'drivers', 'heat'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setMapView(view)}
                    className={cn(
                      'px-3 py-2 rounded text-sm font-medium',
                      mapView === view
                        ? 'bg-brooklyn-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {view === 'zones' && <MapPin className="h-4 w-4 inline mr-1" />}
                    {view === 'drivers' && <Truck className="h-4 w-4 inline mr-1" />}
                    {view === 'heat' && <Activity className="h-4 w-4 inline mr-1" />}
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{zoneMetrics.totalDeliveries}</p>
                <p className="text-xs text-gray-500 mt-1">Across {zoneMetrics.totalZones} zones</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">{zoneMetrics.avgTime} min</p>
                <p className="text-xs text-green-600 mt-1">↓ 3 min vs last hour</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">High Density Zones</p>
                <p className="text-2xl font-bold text-gray-900">{zoneMetrics.highDensityZones}</p>
                <p className="text-xs text-gray-500 mt-1">Need more drivers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-bakery p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Drivers Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.status === 'busy').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {drivers.filter(d => d.status === 'available').length} available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-bakery p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {mapView === 'zones' && 'Delivery Zones'}
                  {mapView === 'drivers' && 'Driver Locations'}
                  {mapView === 'heat' && 'Delivery Heat Map'}
                </h3>
                <Badge variant="info">Live</Badge>
              </div>
              
              {/* Map Placeholder - In production, this would be a real map component */}
              <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
                {mapView === 'zones' && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {filteredZones.map((zone) => (
                        <div
                          key={zone.id}
                          className={cn(
                            'p-4 rounded-lg border-2 cursor-pointer transition-all',
                            selectedZone === zone.id ? 'border-brooklyn-500 shadow-lg' : 'border-gray-200'
                          )}
                          style={{ backgroundColor: `${zone.color}20` }}
                          onClick={() => setSelectedZone(zone.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{zone.name}</h4>
                            <Badge 
                              variant={
                                zone.density === 'high' ? 'error' :
                                zone.density === 'medium' ? 'warning' : 'success'
                              }
                              size="sm"
                            >
                              {zone.density}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs">
                            <p className="text-gray-600">
                              Active: <span className="font-semibold">{zone.activeDeliveries}</span>
                            </p>
                            <p className="text-gray-600">
                              Avg Time: <span className="font-semibold">{zone.avgDeliveryTime} min</span>
                            </p>
                            <p className="text-gray-600">
                              Drivers: <span className="font-semibold">{driverDistribution[zone.id] || 0}</span>
                            </p>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-gray-500">Coverage:</p>
                            <p className="text-xs font-medium">{zone.coverage.slice(0, 2).join(', ')}...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {mapView === 'heat' && (
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Density Heat Map</h4>
                      <div className="flex items-center space-x-2 text-xs">
                        <span>Low</span>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 bg-blue-500 rounded"></div>
                          <div className="w-6 h-6 bg-green-500 rounded"></div>
                          <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                          <div className="w-6 h-6 bg-orange-500 rounded"></div>
                          <div className="w-6 h-6 bg-red-500 rounded"></div>
                        </div>
                        <span>High</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {filteredZones.map((zone) => (
                        <div
                          key={zone.id}
                          className={cn(
                            'p-4 rounded-lg text-white',
                            getHeatMapColor(zone.heatLevel)
                          )}
                        >
                          <h5 className="font-medium text-sm">{zone.name}</h5>
                          <p className="text-xs opacity-90 mt-1">Heat: {zone.heatLevel}%</p>
                          <p className="text-xs opacity-90">{zone.activeDeliveries} active</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {mapView === 'drivers' && (
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Live Driver Positions</h4>
                    <div className="space-y-3">
                      {drivers.filter(d => d.status !== 'offline').map((driver) => (
                        <div key={driver.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              driver.status === 'busy' ? 'bg-yellow-100' : 'bg-green-100'
                            )}>
                              <Truck className={cn(
                                'h-4 w-4',
                                driver.status === 'busy' ? 'text-yellow-600' : 'text-green-600'
                              )} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{driver.name}</p>
                              <p className="text-xs text-gray-500">{driver.vehicle.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={driver.status === 'busy' ? 'warning' : 'success'} size="sm">
                              {driver.status}
                            </Badge>
                            {driver.assignedOrders.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {driver.assignedOrders.length} order(s)
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Map Legend */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">Click zones for details</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Navigation className="h-4 w-4 mr-2" />
                    Center Map
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Zone Details & Analytics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selected Zone Details */}
            {selectedZone && (
              <div className="bg-white rounded-xl shadow-bakery p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Details</h3>
                {(() => {
                  const zone = deliveryZones.find(z => z.id === selectedZone);
                  if (!zone) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Zone Name</p>
                        <p className="font-medium">{zone.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Coverage Areas</p>
                        <div className="mt-1">
                          {zone.coverage.map((area, idx) => (
                            <span key={idx} className="inline-block text-xs bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Performance</p>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Active Deliveries</span>
                            <span className="font-medium">{zone.activeDeliveries}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Avg Delivery Time</span>
                            <span className="font-medium">{zone.avgDeliveryTime} min</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Density Level</span>
                            <Badge variant={
                              zone.density === 'high' ? 'error' :
                              zone.density === 'medium' ? 'warning' : 'success'
                            } size="sm">
                              {zone.density}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full" size="sm">
                        <Truck className="h-4 w-4 mr-2" />
                        Assign More Drivers
                      </Button>
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* Zone Performance Ranking */}
            <div className="bg-white rounded-xl shadow-bakery p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Rankings</h3>
              <div className="space-y-3">
                {filteredZones
                  .sort((a, b) => b.activeDeliveries - a.activeDeliveries)
                  .slice(0, 5)
                  .map((zone, idx) => (
                    <div key={zone.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-100 text-gray-700' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-600'
                        )}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{zone.name.split(' ')[0]}</p>
                          <p className="text-xs text-gray-500">{zone.activeDeliveries} deliveries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{zone.avgDeliveryTime}m</p>
                        <p className="text-xs text-gray-500">avg time</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-bakery p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Optimize Driver Routes
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Adjust Zone Boundaries
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  View Delivery Issues
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}