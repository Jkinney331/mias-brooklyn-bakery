'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, Menu, MapPin, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { 
    locations, 
    selectedLocationId, 
    setSelectedLocation, 
    notifications, 
    unreadCount,
    markNotificationAsRead 
  } = useAppStore();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const selectedLocation = selectedLocationId 
    ? locations.find(loc => loc.id === selectedLocationId)
    : null;

  const availableLocations = user?.role === 'owner' 
    ? locations 
    : locations.filter(loc => user?.locationId ? loc.id === user.locationId : true);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId as any);
    setShowLocationDropdown(false);
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    if (notification.actionUrl) {
      // Navigate to action URL
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-serif font-semibold text-bakery-brown">
            Mia's Brooklyn Bakery
          </h1>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Management System
          </span>
        </div>

        {/* Location Selector */}
        {availableLocations.length > 1 && (
          <div className="relative" ref={locationDropdownRef}>
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">
                {selectedLocation?.name || 'All Locations'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showLocationDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  {user?.role === 'owner' && (
                    <button
                      onClick={() => handleLocationSelect('')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span>All Locations</span>
                    </button>
                  )}
                  {availableLocations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationSelect(location.id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <div 
                        className={cn('w-3 h-3 rounded-full', `bg-${location.colorClass}-500`)}
                      ></div>
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-xs text-gray-500">{location.address}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer',
                        !notification.read && 'bg-blue-50'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        {notification.priority === 'high' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-brooklyn-500 text-white rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showUserDropdown && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}