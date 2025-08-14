import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  Location, 
  Order, 
  Driver, 
  OrderItem, 
  DeliveryZone, 
  LocationId,
  OrderStatus,
  Notification
} from '@/types';

// Sample users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Mitchell',
    email: 'sarah@miasbakery.com',
    role: 'owner',
    avatar: '/images/avatar-sarah.jpg',
    permissions: [
      { resource: '*', actions: ['*'] }
    ]
  },
  {
    id: 'user-2',
    name: 'Mike Rodriguez',
    email: 'mike.brooklyn@miasbakery.com',
    role: 'manager',
    locationId: 'brooklyn',
    avatar: '/images/avatar-mike.jpg',
    permissions: [
      { resource: 'orders', actions: ['read', 'create', 'update'] },
      { resource: 'kitchen', actions: ['read', 'update'] },
      { resource: 'drivers', actions: ['read', 'assign'] }
    ]
  },
  {
    id: 'user-3',
    name: 'Emma Thompson',
    email: 'emma.ues@miasbakery.com',
    role: 'manager',
    locationId: 'ues',
    avatar: '/images/avatar-emma.jpg',
    permissions: [
      { resource: 'orders', actions: ['read', 'create', 'update'] },
      { resource: 'kitchen', actions: ['read', 'update'] },
      { resource: 'drivers', actions: ['read', 'assign'] }
    ]
  },
  {
    id: 'user-4',
    name: 'Carlos Santos',
    email: 'carlos@miasbakery.com',
    role: 'driver',
    avatar: '/images/avatar-carlos.jpg',
    permissions: [
      { resource: 'orders', actions: ['read', 'update'] },
      { resource: 'location', actions: ['update'] }
    ]
  },
  {
    id: 'user-5',
    name: 'Julia Kim',
    email: 'julia.kitchen@miasbakery.com',
    role: 'kitchen',
    locationId: 'brooklyn',
    avatar: '/images/avatar-julia.jpg',
    permissions: [
      { resource: 'orders', actions: ['read', 'update'] },
      { resource: 'kitchen', actions: ['read', 'update'] }
    ]
  }
];

// Sample locations
export const mockLocations: Location[] = [
  {
    id: 'brooklyn',
    name: 'Brooklyn Heights',
    address: '123 Montague Street, Brooklyn Heights, NY 11201',
    phone: '+1 (718) 555-0123',
    color: '#3B82F6',
    colorClass: 'text-blue-600 bg-blue-50',
    manager: 'Mike Rodriguez',
    status: 'open',
    hours: {
      open: '06:00',
      close: '20:00'
    },
    stats: {
      todayOrders: 45,
      todayRevenue: 1250.50,
      activeOrders: 8,
      avgPrepTime: 12,
      kitchenLoad: 'medium'
    }
  },
  {
    id: 'ues',
    name: 'Upper East Side',
    address: '789 Madison Avenue, New York, NY 10075',
    phone: '+1 (212) 555-0456',
    color: '#10B981',
    colorClass: 'text-emerald-600 bg-emerald-50',
    manager: 'Emma Thompson',
    status: 'open',
    hours: {
      open: '07:00',
      close: '19:00'
    },
    stats: {
      todayOrders: 32,
      todayRevenue: 890.25,
      activeOrders: 5,
      avgPrepTime: 10,
      kitchenLoad: 'low'
    }
  },
  {
    id: 'times-square',
    name: 'Times Square',
    address: '456 Broadway, New York, NY 10018',
    phone: '+1 (212) 555-0789',
    color: '#F59E0B',
    colorClass: 'text-amber-600 bg-amber-50',
    manager: 'David Chen',
    status: 'busy',
    hours: {
      open: '06:30',
      close: '21:00'
    },
    stats: {
      todayOrders: 67,
      todayRevenue: 1850.75,
      activeOrders: 12,
      avgPrepTime: 18,
      kitchenLoad: 'high'
    }
  }
];

// Sample menu items for generating orders
export const menuItems: OrderItem[] = [
  // Breads
  { id: 'item-1', name: 'Sourdough Loaf', quantity: 1, price: 6.50, category: 'breads' },
  { id: 'item-2', name: 'Whole Wheat Bread', quantity: 1, price: 5.50, category: 'breads' },
  { id: 'item-3', name: 'Baguette', quantity: 1, price: 4.00, category: 'breads' },
  { id: 'item-4', name: 'Focaccia', quantity: 1, price: 8.00, category: 'breads' },
  
  // Pastries
  { id: 'item-5', name: 'Croissant', quantity: 1, price: 3.50, category: 'pastries' },
  { id: 'item-6', name: 'Danish Pastry', quantity: 1, price: 4.00, category: 'pastries' },
  { id: 'item-7', name: 'Cinnamon Roll', quantity: 1, price: 4.50, category: 'pastries' },
  { id: 'item-8', name: 'Chocolate Croissant', quantity: 1, price: 4.00, category: 'pastries' },
  
  // Cakes
  { id: 'item-9', name: 'Chocolate Cake Slice', quantity: 1, price: 6.50, category: 'cakes' },
  { id: 'item-10', name: 'Red Velvet Cupcake', quantity: 1, price: 4.50, category: 'cakes' },
  { id: 'item-11', name: 'Cheesecake Slice', quantity: 1, price: 7.00, category: 'cakes' },
  
  // Beverages
  { id: 'item-12', name: 'Coffee', quantity: 1, price: 3.00, category: 'beverages' },
  { id: 'item-13', name: 'Cappuccino', quantity: 1, price: 4.50, category: 'beverages' },
  { id: 'item-14', name: 'Fresh Orange Juice', quantity: 1, price: 5.00, category: 'beverages' },
  
  // Sandwiches
  { id: 'item-15', name: 'Turkey & Brie Sandwich', quantity: 1, price: 9.50, category: 'sandwiches' },
  { id: 'item-16', name: 'Vegetarian Panini', quantity: 1, price: 8.50, category: 'sandwiches' },
  { id: 'item-17', name: 'Ham & Cheese Croissant', quantity: 1, price: 7.50, category: 'sandwiches' }
];

// Sample drivers
export const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'Carlos Santos',
    phone: '+1 (555) 0101',
    email: 'carlos@miasbakery.com',
    status: 'available',
    currentLocation: { lat: 40.6962, lng: -73.9901 },
    assignedOrders: [],
    rating: 4.8,
    totalDeliveries: 1250,
    vehicle: { type: 'bike', licensePlate: 'BK123' }
  },
  {
    id: 'driver-2',
    name: 'Maria Garcia',
    phone: '+1 (555) 0102',
    email: 'maria@miasbakery.com',
    status: 'busy',
    currentLocation: { lat: 40.7614, lng: -73.9776 },
    assignedOrders: ['order-2', 'order-5'],
    rating: 4.9,
    totalDeliveries: 890,
    vehicle: { type: 'scooter', licensePlate: 'SC456' }
  },
  {
    id: 'driver-3',
    name: 'James Wilson',
    phone: '+1 (555) 0103',
    email: 'james@miasbakery.com',
    status: 'available',
    currentLocation: { lat: 40.7589, lng: -73.9851 },
    assignedOrders: [],
    rating: 4.7,
    totalDeliveries: 650,
    vehicle: { type: 'car', licensePlate: 'NY789X' }
  }
];

// Sample delivery zones
export const mockDeliveryZones: DeliveryZone[] = [
  {
    id: 'zone-brooklyn-1',
    name: 'Brooklyn Heights & DUMBO',
    locationId: 'brooklyn',
    coordinates: [
      { lat: 40.6962, lng: -73.9901 },
      { lat: 40.7040, lng: -73.9901 },
      { lat: 40.7040, lng: -73.9830 },
      { lat: 40.6962, lng: -73.9830 }
    ],
    deliveryFee: 2.50,
    estimatedTime: 25,
    active: true
  },
  {
    id: 'zone-ues-1',
    name: 'Upper East Side Central',
    locationId: 'ues',
    coordinates: [
      { lat: 40.7614, lng: -73.9776 },
      { lat: 40.7714, lng: -73.9776 },
      { lat: 40.7714, lng: -73.9676 },
      { lat: 40.7614, lng: -73.9676 }
    ],
    deliveryFee: 3.00,
    estimatedTime: 30,
    active: true
  },
  {
    id: 'zone-ts-1',
    name: 'Midtown West',
    locationId: 'times-square',
    coordinates: [
      { lat: 40.7549, lng: -73.9897 },
      { lat: 40.7649, lng: -73.9897 },
      { lat: 40.7649, lng: -73.9797 },
      { lat: 40.7549, lng: -73.9797 }
    ],
    deliveryFee: 3.50,
    estimatedTime: 35,
    active: true
  }
];

// Customer names for order generation
export const customerNames = [
  'Alex Johnson', 'Emily Chen', 'Michael Brown', 'Sarah Davis', 'David Wilson',
  'Lisa Anderson', 'John Martinez', 'Jennifer Taylor', 'Robert Garcia', 'Michelle Lee',
  'Christopher White', 'Amanda Rodriguez', 'Daniel Thompson', 'Jessica Harris', 'Matthew Clark',
  'Ashley Lewis', 'Joshua Walker', 'Stephanie Young', 'Andrew Hall', 'Melissa King'
];

// Phone number generator
export const generatePhoneNumber = (): string => {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1 (${areaCode}) ${exchange}-${number}`;
};

// Address generator for deliveries
export const deliveryAddresses = [
  '123 Main St, Brooklyn, NY 11201',
  '456 Park Ave, New York, NY 10075',
  '789 Broadway, New York, NY 10018',
  '321 Oak St, Brooklyn, NY 11215',
  '654 Pine Ave, New York, NY 10065',
  '987 Elm St, New York, NY 10019',
  '147 Maple Dr, Brooklyn, NY 11231',
  '258 Cedar Ln, New York, NY 10021',
  '369 Birch St, New York, NY 10036',
  '741 Willow Ave, Brooklyn, NY 11217'
];