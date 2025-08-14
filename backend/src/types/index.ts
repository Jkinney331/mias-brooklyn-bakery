// User and Authentication Types
export type UserRole = 'owner' | 'manager' | 'kitchen' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locationId?: string;
  avatar?: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

// Location Types
export type LocationId = 'brooklyn' | 'ues' | 'times-square';

export interface Location {
  id: LocationId;
  name: string;
  address: string;
  phone: string;
  color: string;
  colorClass: string;
  manager: string;
  status: 'open' | 'closed' | 'busy';
  hours: {
    open: string;
    close: string;
  };
  stats: LocationStats;
}

export interface LocationStats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  avgPrepTime: number;
  kitchenLoad: 'low' | 'medium' | 'high';
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type OrderType = 'pickup' | 'delivery' | 'dine-in';

export interface Order {
  id: string;
  locationId: LocationId;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: Date;
  estimatedReadyTime?: Date;
  specialInstructions?: string;
  deliveryAddress?: string;
  assignedDriverId?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialRequests?: string;
  category: 'breads' | 'pastries' | 'cakes' | 'beverages' | 'sandwiches';
}

// Driver Types
export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  assignedOrders: string[];
  rating: number;
  totalDeliveries: number;
  vehicle: {
    type: 'bike' | 'car' | 'scooter';
    licensePlate?: string;
  };
}

// Notification Types
export type NotificationType = 'order' | 'delivery' | 'system' | 'alert';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  locationId?: LocationId;
  orderId?: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeLocations: number;
  avgOrderValue: number;
  topSellingItem: string;
  busyLocation: LocationId;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface OrderForm {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  type: OrderType;
  items: Omit<OrderItem, 'id'>[];
  specialInstructions?: string;
  deliveryAddress?: string;
}

// Additional Backend Types
export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DeliveryZone {
  id: string;
  name: string;
  coordinates: Array<{ lat: number; lng: number }>;
  locationId: LocationId;
  deliveryFee: number;
  estimatedTime: number; // in minutes
  active: boolean;
}

export interface AnalyticsData {
  period: 'today' | 'week' | 'month';
  revenue: number;
  orders: number;
  avgOrderValue: number;
  topItems: Array<{ name: string; count: number; revenue: number }>;
  busyHours: Array<{ hour: number; orders: number }>;
  locationPerformance: Array<{ locationId: LocationId; orders: number; revenue: number }>;
}