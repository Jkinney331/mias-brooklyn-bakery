import { 
  User, 
  Location, 
  Order, 
  Driver, 
  DeliveryZone, 
  Notification,
  LocationId 
} from '@/types';
import { 
  mockUsers, 
  mockLocations, 
  mockDrivers, 
  mockDeliveryZones 
} from '@/mock-data/data';

/**
 * In-memory data store for demo purposes
 * In a real application, this would be replaced with a proper database
 */
class DataStore {
  private users: Map<string, User> = new Map();
  private locations: Map<LocationId, Location> = new Map();
  private orders: Map<string, Order> = new Map();
  private drivers: Map<string, Driver> = new Map();
  private deliveryZones: Map<string, DeliveryZone> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize users
    mockUsers.forEach(user => this.users.set(user.id, user));
    
    // Initialize locations
    mockLocations.forEach(location => this.locations.set(location.id, location));
    
    // Initialize drivers
    mockDrivers.forEach(driver => this.drivers.set(driver.id, driver));
    
    // Initialize delivery zones
    mockDeliveryZones.forEach(zone => this.deliveryZones.set(zone.id, zone));
  }

  // User operations
  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  // Location operations
  getLocations(): Location[] {
    return Array.from(this.locations.values());
  }

  getLocationById(id: LocationId): Location | undefined {
    return this.locations.get(id);
  }

  updateLocation(id: LocationId, updates: Partial<Location>): Location | undefined {
    const location = this.locations.get(id);
    if (location) {
      const updatedLocation = { ...location, ...updates };
      this.locations.set(id, updatedLocation);
      return updatedLocation;
    }
    return undefined;
  }

  // Order operations
  getOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getOrdersByLocation(locationId: LocationId): Order[] {
    return Array.from(this.orders.values()).filter(order => order.locationId === locationId);
  }

  getOrdersByStatus(status: string): Order[] {
    return Array.from(this.orders.values()).filter(order => order.status === status);
  }

  getOrdersByDriver(driverId: string): Order[] {
    return Array.from(this.orders.values()).filter(order => order.assignedDriverId === driverId);
  }

  createOrder(order: Order): Order {
    this.orders.set(order.id, order);
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const order = this.orders.get(id);
    if (order) {
      const updatedOrder = { ...order, ...updates };
      this.orders.set(id, updatedOrder);
      return updatedOrder;
    }
    return undefined;
  }

  deleteOrder(id: string): boolean {
    return this.orders.delete(id);
  }

  // Driver operations
  getDrivers(): Driver[] {
    return Array.from(this.drivers.values());
  }

  getDriverById(id: string): Driver | undefined {
    return this.drivers.get(id);
  }

  getAvailableDrivers(): Driver[] {
    return Array.from(this.drivers.values()).filter(driver => driver.status === 'available');
  }

  updateDriver(id: string, updates: Partial<Driver>): Driver | undefined {
    const driver = this.drivers.get(id);
    if (driver) {
      const updatedDriver = { ...driver, ...updates };
      this.drivers.set(id, updatedDriver);
      return updatedDriver;
    }
    return undefined;
  }

  // Delivery zone operations
  getDeliveryZones(): DeliveryZone[] {
    return Array.from(this.deliveryZones.values());
  }

  getDeliveryZonesByLocation(locationId: LocationId): DeliveryZone[] {
    return Array.from(this.deliveryZones.values()).filter(zone => zone.locationId === locationId);
  }

  getDeliveryZoneById(id: string): DeliveryZone | undefined {
    return this.deliveryZones.get(id);
  }

  updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): DeliveryZone | undefined {
    const zone = this.deliveryZones.get(id);
    if (zone) {
      const updatedZone = { ...zone, ...updates };
      this.deliveryZones.set(id, updatedZone);
      return updatedZone;
    }
    return undefined;
  }

  // Notification operations
  getNotifications(): Notification[] {
    return Array.from(this.notifications.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getNotificationsByLocation(locationId: LocationId): Notification[] {
    return Array.from(this.notifications.values())
      .filter(notification => notification.locationId === locationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  createNotification(notification: Notification): Notification {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  markNotificationRead(id: string): Notification | undefined {
    const notification = this.notifications.get(id);
    if (notification) {
      const updatedNotification = { ...notification, read: true };
      this.notifications.set(id, updatedNotification);
      return updatedNotification;
    }
    return undefined;
  }

  deleteNotification(id: string): boolean {
    return this.notifications.delete(id);
  }

  // Analytics operations
  getOrderStats(locationId?: LocationId) {
    const orders = locationId 
      ? this.getOrdersByLocation(locationId)
      : this.getOrders();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(order => 
      order.createdAt >= today
    );

    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const activeOrders = orders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status)
    ).length;

    return {
      todayOrders: todayOrders.length,
      totalRevenue,
      activeOrders,
      avgOrderValue: todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0
    };
  }

  // Clear all data (for testing)
  reset() {
    this.orders.clear();
    this.notifications.clear();
    this.initializeData();
  }
}

export const dataStore = new DataStore();