'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  BarChart3, 
  Bell,
  Globe,
  Palette,
  Key,
  UserPlus,
  Building,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth/mock-auth';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function AdminPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuthStore();
  const { locations, orders, drivers, notifications, addNotification } = useAppStore();

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'owner') {
    return null;
  }

  const allUsers = authService.getAllUsers();
  const totalRevenue = locations.reduce((sum, loc) => sum + loc.stats.todayRevenue, 0);
  const totalOrders = locations.reduce((sum, loc) => sum + loc.stats.todayOrders, 0);

  const systemStats = [
    { label: 'Total Users', value: allUsers.length, icon: Users },
    { label: 'Active Locations', value: locations.length, icon: Building },
    { label: 'Total Orders Today', value: totalOrders, icon: BarChart3 },
    { label: 'Revenue Today', value: formatCurrency(totalRevenue), icon: CreditCard },
  ];

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      items: [
        { name: 'All Users', count: allUsers.length, action: 'users' },
        { name: 'Managers', count: allUsers.filter(u => u.role === 'manager').length, action: 'managers' },
        { name: 'Kitchen Staff', count: allUsers.filter(u => u.role === 'kitchen').length, action: 'kitchen' },
        { name: 'Drivers', count: allUsers.filter(u => u.role === 'driver').length, action: 'drivers-admin' },
      ]
    },
    {
      title: 'Location Management',
      description: 'Configure locations, hours, and settings',
      icon: Building,
      items: [
        { name: 'Brooklyn', status: 'open', action: 'location-brooklyn' },
        { name: 'Upper East Side', status: 'open', action: 'location-ues' },
        { name: 'Times Square', status: 'busy', action: 'location-times-square' },
        { name: 'Location Settings', status: '', action: 'location-settings' },
      ]
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      items: [
        { name: 'General Settings', action: 'general' },
        { name: 'Notifications', action: 'notifications' },
        { name: 'Payment Settings', action: 'payments' },
        { name: 'API Settings', action: 'api' },
      ]
    },
    {
      title: 'Reports & Analytics',
      description: 'View detailed reports and analytics',
      icon: BarChart3,
      items: [
        { name: 'Sales Reports', action: 'sales-reports' },
        { name: 'Performance Analytics', action: 'analytics' },
        { name: 'Customer Insights', action: 'customers' },
        { name: 'Export Data', action: 'export' },
      ]
    }
  ];

  const handleAdminAction = (action: string) => {
    addNotification({
      type: 'system',
      priority: 'low',
      title: 'Admin Feature',
      message: `${action.replace('-', ' ')} panel will be available in the full version.`,
      read: false
    });
  };

  const recentActivities = [
    { user: 'Sarah Chen', action: 'Updated Brooklyn menu items', time: new Date(Date.now() - 30 * 60 * 1000) },
    { user: 'Michael Torres', action: 'Added new driver David Kim', time: new Date(Date.now() - 45 * 60 * 1000) },
    { user: 'Emma Wilson', action: 'Modified Times Square hours', time: new Date(Date.now() - 60 * 60 * 1000) },
    { user: 'System', action: 'Daily backup completed', time: new Date(Date.now() - 120 * 60 * 1000) },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-bakery-brown">Administration</h1>
            <p className="text-gray-600 mt-1">
              Manage system settings, users, and overall operations.
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="secondary">
              <Database className="h-4 w-4 mr-2" />
              Backup System
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-bakery p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-brooklyn-100 rounded-lg">
                    <Icon className="h-6 w-6 text-brooklyn-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-bakery p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={() => handleAdminAction(item.action)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        {item.count !== undefined && (
                          <Badge variant="default">{item.count}</Badge>
                        )}
                        {item.status && (
                          <Badge variant={
                            item.status === 'open' ? 'success' :
                            item.status === 'busy' ? 'warning' : 'default'
                          }>
                            {item.status}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <p className="text-xs text-gray-500">{formatDateTime(activity.time)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-bakery p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notification Service</span>
                <Badge variant="warning">Limited</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup Status</span>
                <Badge variant="success">Up to date</Badge>
              </div>
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
              onClick={() => handleAdminAction('system-settings')}
            >
              <Settings className="h-6 w-6 mb-2" />
              System Settings
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleAdminAction('user-management')}
            >
              <Users className="h-6 w-6 mb-2" />
              User Management
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleAdminAction('security')}
            >
              <Shield className="h-6 w-6 mb-2" />
              Security
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => handleAdminAction('reports')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Reports
            </Button>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl shadow-bakery p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Version Info</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>System Version: 1.0.0-beta</p>
                <p>Database Version: PostgreSQL 14</p>
                <p>API Version: v1.2.3</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Uptime: 99.9%</p>
                <p>Response Time: 120ms</p>
                <p>Active Sessions: 47</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Storage</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Database Size: 2.3 GB</p>
                <p>Image Storage: 890 MB</p>
                <p>Backup Size: 1.8 GB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}