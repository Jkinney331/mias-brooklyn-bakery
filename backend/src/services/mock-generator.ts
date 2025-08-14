import { v4 as uuidv4 } from 'uuid';
import { 
  Order, 
  OrderStatus, 
  OrderType, 
  LocationId,
  Notification,
  NotificationType,
  NotificationPriority
} from '@/types';
import { 
  menuItems, 
  customerNames, 
  generatePhoneNumber, 
  deliveryAddresses 
} from '@/mock-data/data';
import { dataStore } from './data-store';
import { logger } from '@/utils/logger';

export class MockGenerator {
  private isGenerating = false;
  private orderGenerationInterval: NodeJS.Timeout | null = null;
  private driverMovementInterval: NodeJS.Timeout | null = null;

  startOrderGeneration(intervalMs = 30000) {
    if (this.isGenerating) return;
    
    this.isGenerating = true;
    logger.info('Starting order generation', { intervalMs });

    // Generate initial orders
    this.generateRandomOrders(3);

    // Set up interval for continuous generation
    this.orderGenerationInterval = setInterval(() => {
      this.generateRandomOrders(Math.floor(Math.random() * 3) + 1);
    }, intervalMs);
  }

  stopOrderGeneration() {
    if (this.orderGenerationInterval) {
      clearInterval(this.orderGenerationInterval);
      this.orderGenerationInterval = null;
    }
    this.isGenerating = false;
    logger.info('Stopped order generation');
  }

  startDriverMovement(intervalMs = 5000) {
    logger.info('Starting driver movement simulation', { intervalMs });

    this.driverMovementInterval = setInterval(() => {
      this.simulateDriverMovement();
    }, intervalMs);
  }

  stopDriverMovement() {
    if (this.driverMovementInterval) {
      clearInterval(this.driverMovementInterval);
      this.driverMovementInterval = null;
    }
    logger.info('Stopped driver movement simulation');
  }

  generateRandomOrders(count: number): Order[] {
    const orders: Order[] = [];
    const locations: LocationId[] = ['brooklyn', 'ues', 'times-square'];
    const orderTypes: OrderType[] = ['pickup', 'delivery', 'dine-in'];
    const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing'];

    for (let i = 0; i < count; i++) {
      const locationId = locations[Math.floor(Math.random() * locations.length)];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
      
      // Generate 1-4 items per order
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const orderItems = [];
      let total = 0;

      for (let j = 0; j < itemCount; j++) {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const orderItem = {
          ...item,
          id: uuidv4(),
          quantity
        };
        orderItems.push(orderItem);
        total += item.price * quantity;
      }

      // Add delivery fee for delivery orders
      if (orderType === 'delivery') {
        total += 2.50 + Math.random() * 2; // Random delivery fee
      }

      const order: Order = {
        id: uuidv4(),
        locationId,
        customerName,
        customerPhone: generatePhoneNumber(),
        customerEmail: Math.random() > 0.3 ? `${customerName.toLowerCase().replace(/\s+/g, '.')}@email.com` : undefined,
        type: orderType,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        items: orderItems,
        total: Math.round(total * 100) / 100,
        createdAt: new Date(),
        paymentStatus: 'paid',
        deliveryAddress: orderType === 'delivery' 
          ? deliveryAddresses[Math.floor(Math.random() * deliveryAddresses.length)]
          : undefined,
        specialInstructions: Math.random() > 0.7 
          ? ['Extra napkins please', 'Ring doorbell twice', 'Leave at front desk', 'Call when arriving'][Math.floor(Math.random() * 4)]
          : undefined
      };

      // Set estimated ready time
      const estimatedMinutes = 10 + Math.floor(Math.random() * 20);
      order.estimatedReadyTime = new Date(Date.now() + estimatedMinutes * 60000);

      orders.push(dataStore.createOrder(order));
      
      // Create notification for new order
      this.createOrderNotification(order);
      
      logger.info('Generated random order', { orderId: order.id, locationId, type: orderType });
    }

    return orders;
  }

  // Generate location-specific sample orders from PRD
  generatePRDSampleOrders(): void {
    // Brooklyn Location Orders
    const brooklynOrders: Partial<Order>[] = [
      {
        customerName: 'Sarah Chen',
        customerPhone: '+1 (718) 555-2345',
        customerEmail: 'sarah.chen@email.com',
        type: 'delivery',
        deliveryAddress: '245 Court St, Cobble Hill',
        items: [
          { id: uuidv4(), name: 'Chocolate Croissant', quantity: 2, price: 4.00, category: 'pastries' },
          { id: uuidv4(), name: 'Birthday Cake (Custom)', quantity: 1, price: 45.00, category: 'cakes' }
        ],
        specialInstructions: 'Birthday message: Happy 30th Birthday Emma!',
        estimatedReadyTime: new Date(Date.now() + 150 * 60000) // 2:30 PM
      },
      {
        customerName: 'Marcus Williams',
        customerPhone: '+1 (718) 555-3456',
        customerEmail: 'marcus.w@email.com',
        type: 'pickup',
        items: [
          { id: uuidv4(), name: 'Wedding Cake Tasting Box', quantity: 1, price: 35.00, category: 'cakes' },
          { id: uuidv4(), name: 'Assorted Pastries', quantity: 6, price: 3.50, category: 'pastries' }
        ],
        estimatedReadyTime: new Date(Date.now() + 180 * 60000) // 3:00 PM
      },
      {
        customerName: 'Emma Rodriguez',
        customerPhone: '+1 (718) 555-7890',
        customerEmail: 'emma.r@email.com',
        type: 'delivery',
        deliveryAddress: '789 5th Ave, Park Slope',
        items: [
          { id: uuidv4(), name: 'Mini Cupcakes (Catering)', quantity: 50, price: 2.00, category: 'cakes' }
        ],
        specialInstructions: 'Office party - please include plates and napkins',
        estimatedReadyTime: new Date(Date.now() + 300 * 60000) // 5:00 PM
      }
    ];

    // Upper East Side Orders
    const uesOrders: Partial<Order>[] = [
      {
        customerName: 'David Thompson',
        customerPhone: '+1 (212) 555-1200',
        customerEmail: 'david.t@email.com',
        type: 'delivery',
        deliveryAddress: '1200 Madison Ave, Apt 15B',
        items: [
          { id: uuidv4(), name: 'Custom Layer Cake', quantity: 1, price: 65.00, category: 'cakes' },
          { id: uuidv4(), name: 'Macarons', quantity: 12, price: 2.50, category: 'pastries' }
        ],
        specialInstructions: 'Doorman will accept delivery. Call upon arrival.',
        estimatedReadyTime: new Date(Date.now() + 60 * 60000) // 1:00 PM
      },
      {
        customerName: 'Jennifer Park',
        customerPhone: '+1 (212) 555-8500',
        customerEmail: 'jpark@email.com',
        type: 'delivery',
        deliveryAddress: '300 E 85th St',
        items: [
          { id: uuidv4(), name: 'Morning Pastry Box', quantity: 12, price: 3.50, category: 'pastries' },
          { id: uuidv4(), name: 'Sourdough Loaf', quantity: 2, price: 6.50, category: 'breads' }
        ],
        estimatedReadyTime: new Date(Date.now() + 30 * 60000) // 11:30 AM
      },
      {
        customerName: 'Robert Mitchell',
        customerPhone: '+1 (212) 555-1450',
        customerEmail: 'rmitchell@company.com',
        type: 'delivery',
        deliveryAddress: '1450 2nd Ave',
        items: [
          { id: uuidv4(), name: 'Office Catering (30 people)', quantity: 1, price: 250.00, category: 'sandwiches' }
        ],
        specialInstructions: 'Conference room on 12th floor. Include utensils and plates.',
        estimatedReadyTime: new Date(Date.now() + 45 * 60000) // 12:00 PM
      }
    ];

    // Times Square Orders
    const timesSquareOrders: Partial<Order>[] = [
      {
        customerName: 'Tech Startup Office',
        customerPhone: '+1 (212) 555-1633',
        customerEmail: 'orders@techstartup.com',
        type: 'delivery',
        deliveryAddress: '1633 Broadway, Floor 48',
        items: [
          { id: uuidv4(), name: 'Meeting Catering (25 people)', quantity: 1, price: 200.00, category: 'sandwiches' },
          { id: uuidv4(), name: 'Coffee', quantity: 25, price: 3.00, category: 'beverages' }
        ],
        specialInstructions: 'Deliver to reception. Meeting starts at 9:30 AM sharp.',
        estimatedReadyTime: new Date(Date.now() - 60 * 60000) // 9:00 AM (past)
      },
      {
        customerName: 'Broadway Theater',
        customerPhone: '+1 (212) 555-2350',
        customerEmail: 'events@broadwaytheater.com',
        type: 'delivery',
        deliveryAddress: '235 W 44th St',
        items: [
          { id: uuidv4(), name: 'Opening Night Cake', quantity: 1, price: 150.00, category: 'cakes' },
          { id: uuidv4(), name: 'Mini Desserts', quantity: 100, price: 3.00, category: 'cakes' }
        ],
        specialInstructions: 'Stage door entrance. Call production manager on arrival.',
        estimatedReadyTime: new Date(Date.now() + 360 * 60000) // 6:00 PM
      },
      {
        customerName: 'Hotel Concierge',
        customerPhone: '+1 (212) 555-1535',
        customerEmail: 'concierge@hotelbroadway.com',
        type: 'delivery',
        deliveryAddress: '1535 Broadway',
        items: [
          { id: uuidv4(), name: 'Guest Amenity Baskets', quantity: 10, price: 25.00, category: 'pastries' }
        ],
        specialInstructions: 'Deliver to concierge desk. Individual packaging required.',
        estimatedReadyTime: new Date(Date.now() + 240 * 60000) // 4:00 PM
      }
    ];

    // Process and create all sample orders
    const allSampleOrders = [
      ...brooklynOrders.map(o => ({ ...o, locationId: 'brooklyn' as LocationId })),
      ...uesOrders.map(o => ({ ...o, locationId: 'ues' as LocationId })),
      ...timesSquareOrders.map(o => ({ ...o, locationId: 'times-square' as LocationId }))
    ];

    allSampleOrders.forEach(orderData => {
      const total = orderData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
      const deliveryFee = orderData.type === 'delivery' ? 5.00 : 0;
      
      const order: Order = {
        id: uuidv4(),
        locationId: orderData.locationId!,
        customerName: orderData.customerName!,
        customerPhone: orderData.customerPhone!,
        customerEmail: orderData.customerEmail,
        type: orderData.type as OrderType,
        status: 'confirmed',
        items: orderData.items!,
        total: Math.round((total + deliveryFee) * 100) / 100,
        createdAt: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
        estimatedReadyTime: orderData.estimatedReadyTime,
        specialInstructions: orderData.specialInstructions,
        deliveryAddress: orderData.deliveryAddress,
        paymentStatus: 'paid'
      };

      dataStore.createOrder(order);
      this.createOrderNotification(order);
      
      logger.info('Generated PRD sample order', { 
        orderId: order.id, 
        locationId: order.locationId, 
        customerName: order.customerName 
      });
    });
  }

  simulateOrderProgression(orderId: string): boolean {
    const order = dataStore.getOrderById(orderId);
    if (!order) return false;

    const statusProgression: Record<OrderStatus, OrderStatus[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing'],
      'preparing': ['ready'],
      'ready': ['out-for-delivery', 'delivered'], // delivered for pickup orders
      'out-for-delivery': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    const possibleNextStatuses = statusProgression[order.status];
    if (possibleNextStatuses.length === 0) return false;

    // Add some randomness to status progression
    if (Math.random() < 0.3) return false; // 30% chance to not progress

    let nextStatus: OrderStatus;
    
    if (order.status === 'ready' && order.type === 'pickup') {
      nextStatus = 'delivered'; // Skip delivery for pickup orders
    } else if (order.status === 'ready' && order.type === 'delivery') {
      nextStatus = 'out-for-delivery';
      // Assign a driver
      const availableDrivers = dataStore.getAvailableDrivers();
      if (availableDrivers.length > 0) {
        const driver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
        dataStore.updateOrder(orderId, { assignedDriverId: driver.id });
        dataStore.updateDriver(driver.id, { 
          status: 'busy',
          assignedOrders: [...driver.assignedOrders, orderId]
        });
      }
    } else {
      nextStatus = possibleNextStatuses[Math.floor(Math.random() * possibleNextStatuses.length)];
    }

    const updatedOrder = dataStore.updateOrder(orderId, { status: nextStatus });
    if (updatedOrder) {
      this.createStatusUpdateNotification(updatedOrder);
      logger.info('Order status updated', { orderId, oldStatus: order.status, newStatus: nextStatus });
    }

    return true;
  }

  simulateDriverMovement() {
    const drivers = dataStore.getDrivers();
    
    drivers.forEach(driver => {
      if (!driver.currentLocation) return;

      // Small random movement (simulate GPS updates)
      const latChange = (Math.random() - 0.5) * 0.002; // ~200m
      const lngChange = (Math.random() - 0.5) * 0.002;

      const newLocation = {
        lat: driver.currentLocation.lat + latChange,
        lng: driver.currentLocation.lng + lngChange
      };

      dataStore.updateDriver(driver.id, { currentLocation: newLocation });
    });
  }

  createOrderNotification(order: Order): void {
    const notification: Notification = {
      id: uuidv4(),
      type: 'order' as NotificationType,
      priority: 'medium' as NotificationPriority,
      title: 'New Order Received',
      message: `Order #${order.id.slice(-6)} from ${order.customerName} - $${order.total.toFixed(2)}`,
      locationId: order.locationId,
      orderId: order.id,
      createdAt: new Date(),
      read: false,
      actionUrl: `/orders/${order.id}`
    };

    dataStore.createNotification(notification);
  }

  createStatusUpdateNotification(order: Order): void {
    const statusMessages: Record<OrderStatus, string> = {
      'pending': 'Order is pending confirmation',
      'confirmed': 'Order has been confirmed',
      'preparing': 'Order is being prepared',
      'ready': 'Order is ready for pickup/delivery',
      'out-for-delivery': 'Order is out for delivery',
      'delivered': 'Order has been delivered',
      'cancelled': 'Order has been cancelled'
    };

    const notification: Notification = {
      id: uuidv4(),
      type: 'order' as NotificationType,
      priority: order.status === 'ready' ? 'high' as NotificationPriority : 'low' as NotificationPriority,
      title: `Order #${order.id.slice(-6)} Updated`,
      message: statusMessages[order.status],
      locationId: order.locationId,
      orderId: order.id,
      createdAt: new Date(),
      read: false,
      actionUrl: `/orders/${order.id}`
    };

    dataStore.createNotification(notification);
  }

  // Simulate kitchen load and prep times
  simulateKitchenMetrics() {
    const locations = dataStore.getLocations();
    
    locations.forEach(location => {
      const activeOrders = dataStore.getOrdersByLocation(location.id)
        .filter(order => ['confirmed', 'preparing'].includes(order.status)).length;

      let kitchenLoad: 'low' | 'medium' | 'high';
      let avgPrepTime: number;

      if (activeOrders <= 3) {
        kitchenLoad = 'low';
        avgPrepTime = 8 + Math.floor(Math.random() * 5);
      } else if (activeOrders <= 8) {
        kitchenLoad = 'medium';
        avgPrepTime = 12 + Math.floor(Math.random() * 8);
      } else {
        kitchenLoad = 'high';
        avgPrepTime = 18 + Math.floor(Math.random() * 12);
      }

      const stats = dataStore.getOrderStats(location.id);
      
      dataStore.updateLocation(location.id, {
        stats: {
          ...stats,
          todayRevenue: stats.totalRevenue,
          activeOrders,
          avgPrepTime,
          kitchenLoad
        }
      });
    });
  }

  // Start all simulations
  startAllSimulations() {
    this.startOrderGeneration(30000); // New order every 30 seconds
    this.startDriverMovement(5000);   // Driver movement every 5 seconds
    
    // Order progression every 10 seconds
    setInterval(() => {
      const orders = dataStore.getOrders();
      orders.forEach(order => {
        if (Math.random() < 0.1) { // 10% chance to progress each order
          this.simulateOrderProgression(order.id);
        }
      });
    }, 10000);

    // Kitchen metrics every 15 seconds
    setInterval(() => {
      this.simulateKitchenMetrics();
    }, 15000);

    logger.info('All simulations started');
  }

  // Stop all simulations
  stopAllSimulations() {
    this.stopOrderGeneration();
    this.stopDriverMovement();
    logger.info('All simulations stopped');
  }
}

export const mockGenerator = new MockGenerator();