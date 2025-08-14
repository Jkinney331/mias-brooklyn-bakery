'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  MapPin, 
  ShoppingBag, 
  Truck, 
  Users, 
  Settings,
  ChevronLeft,
  Home,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: { resource: 'dashboard', action: 'read' }
  },
  {
    name: 'Master Dashboard',
    href: '/dashboard/master',
    icon: Home,
    permission: { resource: 'dashboard', action: 'read' },
    ownerOnly: true
  },
  {
    name: 'Locations',
    href: '/locations',
    icon: MapPin,
    permission: { resource: 'locations', action: 'read' }
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingBag,
    permission: { resource: 'orders', action: 'read' }
  },
  {
    name: 'Delivery',
    href: '/delivery',
    icon: Truck,
    permission: { resource: 'deliveries', action: 'read' }
  },
  {
    name: 'Delivery Ops',
    href: '/delivery/operations',
    icon: TrendingUp,
    permission: { resource: 'deliveries', action: 'read' },
    ownerOnly: true
  },
  {
    name: 'Drivers',
    href: '/drivers',
    icon: Users,
    permission: { resource: 'drivers', action: 'read' }
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Settings,
    permission: { resource: 'admin', action: 'read' }
  }
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasPermission } = useAuthStore();
  const { selectedLocationId, locations } = useAppStore();

  const selectedLocation = selectedLocationId 
    ? locations.find(loc => loc.id === selectedLocationId)
    : null;

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const filteredNavItems = navigationItems.filter(item => {
    if (item.permission.resource === 'admin' && user?.role !== 'owner') {
      return false;
    }
    if ('ownerOnly' in item && item.ownerOnly && user?.role !== 'owner') {
      return false;
    }
    return hasPermission(item.permission.resource, item.permission.action);
  });

  return (
    <aside className={cn(
      'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brooklyn-500 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Bakery Hub</h2>
                <p className="text-xs text-gray-500">Management</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className={cn(
              'h-4 w-4 text-gray-500 transition-transform',
              collapsed && 'rotate-180'
            )} />
          </button>
        </div>
      </div>

      {/* Location Info */}
      {selectedLocation && (
        <div className="p-4 border-b border-gray-200">
          {collapsed ? (
            <div 
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                `bg-${selectedLocation.colorClass}-100`
              )}
              title={selectedLocation.name}
            >
              <div className={cn('w-3 h-3 rounded-full', `bg-${selectedLocation.colorClass}-500`)}></div>
            </div>
          ) : (
            <div className={cn(
              'p-3 rounded-lg',
              `bg-${selectedLocation.colorClass}-50 border border-${selectedLocation.colorClass}-200`
            )}>
              <div className="flex items-center space-x-2">
                <div className={cn('w-3 h-3 rounded-full', `bg-${selectedLocation.colorClass}-500`)}></div>
                <span className="text-sm font-medium text-gray-900">{selectedLocation.name}</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Active Orders</span>
                  <span className="font-medium">{selectedLocation.stats.activeOrders}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Kitchen Load</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs font-medium',
                    selectedLocation.stats.kitchenLoad === 'high' && 'bg-red-100 text-red-800',
                    selectedLocation.stats.kitchenLoad === 'medium' && 'bg-yellow-100 text-yellow-800',
                    selectedLocation.stats.kitchenLoad === 'low' && 'bg-green-100 text-green-800'
                  )}>
                    {selectedLocation.stats.kitchenLoad}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-brooklyn-50 text-brooklyn-700 border-r-2 border-brooklyn-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Today's Summary
            </h3>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {selectedLocation ? selectedLocation.stats.todayOrders : locations.reduce((sum, loc) => sum + loc.stats.todayOrders, 0)} Orders
                </p>
                <p className="text-xs text-gray-500">
                  ${selectedLocation ? selectedLocation.stats.todayRevenue.toFixed(2) : locations.reduce((sum, loc) => sum + loc.stats.todayRevenue, 0).toFixed(2)} Revenue
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {selectedLocation ? selectedLocation.stats.avgPrepTime : Math.round(locations.reduce((sum, loc) => sum + loc.stats.avgPrepTime, 0) / locations.length)}min Avg
                </p>
                <p className="text-xs text-gray-500">Prep Time</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}