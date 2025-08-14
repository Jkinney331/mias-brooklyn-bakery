import { create } from 'zustand';
import { Location, LocationId, Order, Driver, Notification } from '@/types';

// Mock data
const mockLocations: Location[] = [
  {
    id: 'brooklyn',
    name: 'Brooklyn Flagship',
    address: '156 Smith Street, Brooklyn, NY 11201',
    phone: '(718) 555-0123',
    color: '#5A9FA8',
    colorClass: 'brooklyn',
    manager: 'Sarah Chen',
    status: 'open',
    hours: { open: '6:00 AM', close: '8:00 PM' },
    stats: {
      todayOrders: 47,
      todayRevenue: 1247.85,
      activeOrders: 8,
      avgPrepTime: 12,
      kitchenLoad: 'medium',
    },
  },
  {
    id: 'ues',
    name: 'Upper East Side',
    address: '892 Lexington Avenue, New York, NY 10065',
    phone: '(212) 555-0456',
    color: '#D4A574',
    colorClass: 'ues',
    manager: 'Michael Torres',
    status: 'open',
    hours: { open: '7:00 AM', close: '7:00 PM' },
    stats: {
      todayOrders: 32,
      todayRevenue: 924.50,
      activeOrders: 5,
      avgPrepTime: 10,
      kitchenLoad: 'low',
    },
  },
  {
    id: 'times-square',
    name: 'Times Square Express',
    address: '1501 Broadway, New York, NY 10036',
    phone: '(212) 555-0789',
    color: '#8B7AA1',
    colorClass: 'times-square',
    manager: 'Emma Wilson',
    status: 'busy',
    hours: { open: '6:30 AM', close: '10:00 PM' },
    stats: {
      todayOrders: 73,
      todayRevenue: 2184.75,
      activeOrders: 15,
      avgPrepTime: 18,
      kitchenLoad: 'high',
    },
  },
];

const mockOrders: Order[] = [
  {
    id: 'ORD001',
    locationId: 'brooklyn',
    customerName: 'John Smith',
    customerPhone: '(555) 123-4567',
    customerEmail: 'john@example.com',
    type: 'pickup',
    status: 'preparing',
    items: [
      { id: '1', name: 'Sourdough Bread', quantity: 2, price: 8.50, category: 'breads' },
      { id: '2', name: 'Chocolate Croissant', quantity: 1, price: 4.25, category: 'pastries' }
    ],
    total: 21.25,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    estimatedReadyTime: new Date(Date.now() + 10 * 60 * 1000),
    paymentStatus: 'paid',
  },
  {
    id: 'ORD002',
    locationId: 'ues',
    customerName: 'Maria Garcia',
    customerPhone: '(555) 987-6543',
    type: 'delivery',
    status: 'out-for-delivery',
    items: [
      { id: '1', name: 'Birthday Cake (8")', quantity: 1, price: 45.00, category: 'cakes' }
    ],
    total: 45.00,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    deliveryAddress: '123 Park Avenue, New York, NY 10028',
    assignedDriverId: 'DRV001',
    paymentStatus: 'paid',
  },
];

const mockDrivers: Driver[] = [
  {
    id: 'DRV001',
    name: 'David Kim',
    phone: '(555) 111-2222',
    email: 'david@miasbrooklynbakery.com',
    status: 'busy',
    currentLocation: { lat: 40.7614, lng: -73.9776 },
    assignedOrders: ['ORD002'],
    rating: 4.8,
    totalDeliveries: 247,
    vehicle: { type: 'bike' },
  },
  {
    id: 'DRV002',
    name: 'Lisa Wong',
    phone: '(555) 333-4444',
    email: 'lisa@miasbrooklynbakery.com',
    status: 'available',
    currentLocation: { lat: 40.6982, lng: -73.9442 },
    assignedOrders: [],
    rating: 4.9,
    totalDeliveries: 189,
    vehicle: { type: 'scooter', licensePlate: 'NYC-123' },
  },
];

interface AppState {
  // Location state
  selectedLocationId: LocationId | null;
  locations: Location[];
  
  // Orders state
  orders: Order[];
  
  // Drivers state
  drivers: Driver[];
  
  // Notifications state
  notifications: Notification[];
  unreadCount: number;
  
  // UI state
  sidebarCollapsed: boolean;
  
  // Actions
  setSelectedLocation: (locationId: LocationId | null) => void;
  getLocationById: (locationId: LocationId) => Location | undefined;
  
  // Order actions
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrdersByLocation: (locationId: LocationId) => Order[];
  
  // Driver actions
  updateDriverStatus: (driverId: string, status: Driver['status']) => void;
  assignOrderToDriver: (orderId: string, driverId: string) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // UI actions
  toggleSidebar: () => void;
  
  // Real-time simulation
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedLocationId: null,
  locations: mockLocations,
  orders: mockOrders,
  drivers: mockDrivers,
  notifications: [],
  unreadCount: 0,
  sidebarCollapsed: false,

  // Location actions
  setSelectedLocation: (locationId) => set({ selectedLocationId: locationId }),
  
  getLocationById: (locationId) => {
    const { locations } = get();
    return locations.find(loc => loc.id === locationId);
  },

  // Order actions
  addOrder: (order) => set((state) => ({
    orders: [...state.orders, order],
  })),

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    ),
  })),

  getOrdersByLocation: (locationId) => {
    const { orders } = get();
    return orders.filter(order => order.locationId === locationId);
  },

  // Driver actions
  updateDriverStatus: (driverId, status) => set((state) => ({
    drivers: state.drivers.map(driver =>
      driver.id === driverId ? { ...driver, status } : driver
    ),
  })),

  assignOrderToDriver: (orderId, driverId) => set((state) => ({
    orders: state.orders.map(order =>
      order.id === orderId ? { ...order, assignedDriverId: driverId, status: 'out-for-delivery' } : order
    ),
    drivers: state.drivers.map(driver =>
      driver.id === driverId 
        ? { ...driver, assignedOrders: [...driver.assignedOrders, orderId], status: 'busy' }
        : driver
    ),
  })),

  // Notification actions
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date(),
      read: false,
    };
    
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),

  markNotificationAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  clearNotifications: () => set({
    notifications: [],
    unreadCount: 0,
  }),

  // UI actions
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed,
  })),

  // Real-time simulation
  startRealTimeUpdates: () => {
    // This would connect to WebSocket or polling in a real app
    const interval = setInterval(() => {
      // Simulate random order status updates
      const { orders, addNotification } = get();
      const activeOrders = orders.filter(o => ['preparing', 'ready'].includes(o.status));
      
      if (activeOrders.length > 0 && Math.random() > 0.7) {
        const randomOrder = activeOrders[Math.floor(Math.random() * activeOrders.length)];
        const newStatus = randomOrder.status === 'preparing' ? 'ready' : 'out-for-delivery';
        
        get().updateOrderStatus(randomOrder.id, newStatus);
        
        addNotification({
          type: 'order',
          priority: 'medium',
          title: 'Order Status Update',
          message: `Order ${randomOrder.id} is now ${newStatus.replace('-', ' ')}`,
          locationId: randomOrder.locationId,
          orderId: randomOrder.id,
        });
      }
    }, 30000); // Every 30 seconds

    // Store interval ID for cleanup
    (window as any).realTimeInterval = interval;
  },

  stopRealTimeUpdates: () => {
    if ((window as any).realTimeInterval) {
      clearInterval((window as any).realTimeInterval);
      delete (window as any).realTimeInterval;
    }
  },
}));