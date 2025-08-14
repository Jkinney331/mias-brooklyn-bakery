import { 
  Order, 
  LocationId, 
  Location,
  Driver 
} from '@/types';
import { dataStore } from './data-store';
import { logger } from '@/utils/logger';

interface RoutingScore {
  locationId: LocationId;
  score: number;
  factors: {
    distance: number;
    capacity: number;
    availability: number;
    driverAvailability: number;
  };
}

interface DeliveryBatch {
  id: string;
  driverId: string;
  orders: string[];
  estimatedTime: number;
  totalDistance: number;
  route: Array<{ orderId: string; address: string; sequence: number }>;
}

export class OrderRoutingService {
  // Coordinates for each location (mock data)
  private locationCoordinates: Record<LocationId, { lat: number; lng: number }> = {
    'brooklyn': { lat: 40.6962, lng: -73.9901 },
    'ues': { lat: 40.7614, lng: -73.9776 },
    'times-square': { lat: 40.7589, lng: -73.9851 }
  };

  // Zone coverage mapping
  private zoneCoverage: Record<string, LocationId[]> = {
    // Brooklyn neighborhoods
    'Cobble Hill': ['brooklyn'],
    'Carroll Gardens': ['brooklyn'],
    'Boerum Hill': ['brooklyn'],
    'Park Slope': ['brooklyn'],
    'Dumbo': ['brooklyn'],
    'Brooklyn Heights': ['brooklyn'],
    'Fort Greene': ['brooklyn'],
    'Prospect Heights': ['brooklyn'],
    
    // UES neighborhoods
    'Upper East Side': ['ues'],
    'Yorkville': ['ues'],
    'Lenox Hill': ['ues'],
    'East Harlem': ['ues'],
    'Roosevelt Island': ['ues'],
    'Midtown East': ['ues', 'times-square'], // Can be served by both
    
    // Times Square neighborhoods
    'Hell\'s Kitchen': ['times-square'],
    'Midtown West': ['times-square'],
    'Theater District': ['times-square'],
    'Chelsea': ['times-square'],
    'Hudson Yards': ['times-square'],
    'Columbus Circle': ['times-square', 'ues'] // Can be served by both
  };

  /**
   * Intelligently route an order to the best location
   */
  routeOrder(order: Order): LocationId {
    const locations = dataStore.getLocations();
    const scores: RoutingScore[] = [];

    // Calculate routing score for each location
    locations.forEach(location => {
      const score = this.calculateRoutingScore(order, location);
      scores.push(score);
    });

    // Sort by highest score
    scores.sort((a, b) => b.score - a.score);

    const bestLocation = scores[0];
    
    logger.info('Order routed', {
      orderId: order.id,
      selectedLocation: bestLocation.locationId,
      score: bestLocation.score,
      factors: bestLocation.factors
    });

    return bestLocation.locationId;
  }

  /**
   * Calculate routing score for a location
   */
  private calculateRoutingScore(order: Order, location: Location): RoutingScore {
    const factors = {
      distance: this.calculateDistanceScore(order, location),
      capacity: this.calculateCapacityScore(location),
      availability: this.calculateAvailabilityScore(location),
      driverAvailability: this.calculateDriverAvailabilityScore(location)
    };

    // Weighted scoring
    const weights = {
      distance: 0.4,       // 40% - Most important for delivery efficiency
      capacity: 0.25,      // 25% - Kitchen load matters
      availability: 0.2,   // 20% - Location status
      driverAvailability: 0.15 // 15% - Driver availability for deliveries
    };

    const score = 
      factors.distance * weights.distance +
      factors.capacity * weights.capacity +
      factors.availability * weights.availability +
      factors.driverAvailability * weights.driverAvailability;

    return {
      locationId: location.id,
      score,
      factors
    };
  }

  /**
   * Calculate distance-based score (0-100)
   */
  private calculateDistanceScore(order: Order, location: Location): number {
    if (order.type !== 'delivery' || !order.deliveryAddress) {
      // For pickup/dine-in, prefer the originally selected location
      return order.locationId === location.id ? 100 : 50;
    }

    // Check neighborhood coverage
    const neighborhood = this.extractNeighborhood(order.deliveryAddress);
    const coveredLocations = this.zoneCoverage[neighborhood] || [];
    
    if (coveredLocations.includes(location.id)) {
      // Primary coverage area
      return 100;
    } else if (this.isInExtendedCoverage(neighborhood, location.id)) {
      // Extended coverage area
      return 70;
    } else {
      // Calculate approximate distance (simplified)
      const distance = this.calculateApproximateDistance(
        order.deliveryAddress,
        location.address
      );
      
      if (distance < 2) return 90;
      if (distance < 4) return 70;
      if (distance < 6) return 50;
      if (distance < 8) return 30;
      return 10;
    }
  }

  /**
   * Calculate capacity-based score (0-100)
   */
  private calculateCapacityScore(location: Location): number {
    const stats = location.stats;
    
    // Lower kitchen load = higher score
    if (stats.kitchenLoad === 'low') return 100;
    if (stats.kitchenLoad === 'medium') return 60;
    if (stats.kitchenLoad === 'high') return 20;
    
    return 50;
  }

  /**
   * Calculate availability score (0-100)
   */
  private calculateAvailabilityScore(location: Location): number {
    if (location.status === 'open') return 100;
    if (location.status === 'busy') return 40;
    if (location.status === 'closed') return 0;
    
    return 50;
  }

  /**
   * Calculate driver availability score (0-100)
   */
  private calculateDriverAvailabilityScore(location: Location): number {
    const drivers = dataStore.getDrivers();
    const availableDrivers = drivers.filter(d => 
      d.status === 'available' &&
      this.isDriverNearLocation(d, location)
    ).length;
    
    if (availableDrivers >= 3) return 100;
    if (availableDrivers === 2) return 70;
    if (availableDrivers === 1) return 40;
    return 10;
  }

  /**
   * Extract neighborhood from address
   */
  private extractNeighborhood(address: string): string {
    // Simple extraction - in production, use geocoding API
    const neighborhoods = Object.keys(this.zoneCoverage);
    
    for (const neighborhood of neighborhoods) {
      if (address.toLowerCase().includes(neighborhood.toLowerCase())) {
        return neighborhood;
      }
    }
    
    // Default based on borough/area in address
    if (address.includes('Brooklyn')) return 'Brooklyn Heights';
    if (address.includes('Upper East') || address.includes('UES')) return 'Upper East Side';
    if (address.includes('Midtown') || address.includes('Times Square')) return 'Midtown West';
    
    return 'Unknown';
  }

  /**
   * Check if in extended coverage
   */
  private isInExtendedCoverage(neighborhood: string, locationId: LocationId): boolean {
    // Extended coverage logic
    const extendedCoverage: Record<LocationId, string[]> = {
      'brooklyn': ['Downtown Brooklyn', 'Williamsburg', 'Greenpoint'],
      'ues': ['Upper West Side', 'Central Park'],
      'times-square': ['Greenwich Village', 'SoHo', 'Tribeca']
    };
    
    return extendedCoverage[locationId]?.includes(neighborhood) || false;
  }

  /**
   * Calculate approximate distance between addresses
   */
  private calculateApproximateDistance(address1: string, address2: string): number {
    // Simplified distance calculation
    // In production, use Google Maps Distance Matrix API
    
    // Extract street numbers if available
    const num1 = parseInt(address1.match(/\d+/)?.[0] || '0');
    const num2 = parseInt(address2.match(/\d+/)?.[0] || '0');
    
    // Very rough approximation based on NYC grid
    const blockDiff = Math.abs(num1 - num2) / 100;
    
    // Add random factor for demo
    return blockDiff + Math.random() * 3;
  }

  /**
   * Check if driver is near location
   */
  private isDriverNearLocation(driver: Driver, location: Location): boolean {
    if (!driver.currentLocation) return false;
    
    const locationCoords = this.locationCoordinates[location.id];
    const distance = this.calculateHaversineDistance(
      driver.currentLocation.lat,
      driver.currentLocation.lng,
      locationCoords.lat,
      locationCoords.lng
    );
    
    // Consider driver "near" if within 3 miles
    return distance < 3;
  }

  /**
   * Calculate Haversine distance between two points
   */
  private calculateHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Batch nearby deliveries for efficiency
   */
  batchDeliveries(locationId: LocationId): DeliveryBatch[] {
    const orders = dataStore.getOrdersByLocation(locationId)
      .filter(o => 
        o.type === 'delivery' && 
        o.status === 'ready' &&
        !o.assignedDriverId
      );
    
    if (orders.length === 0) return [];
    
    const batches: DeliveryBatch[] = [];
    const availableDrivers = dataStore.getAvailableDrivers();
    
    // Group orders by proximity (simplified)
    const orderGroups = this.groupOrdersByProximity(orders);
    
    orderGroups.forEach((group, index) => {
      if (availableDrivers[index]) {
        const batch: DeliveryBatch = {
          id: `batch-${Date.now()}-${index}`,
          driverId: availableDrivers[index].id,
          orders: group.map(o => o.id),
          estimatedTime: this.calculateBatchTime(group),
          totalDistance: this.calculateBatchDistance(group),
          route: this.optimizeRoute(group)
        };
        
        batches.push(batch);
      }
    });
    
    logger.info('Delivery batches created', {
      locationId,
      batchCount: batches.length,
      totalOrders: orders.length
    });
    
    return batches;
  }

  /**
   * Group orders by proximity
   */
  private groupOrdersByProximity(orders: Order[]): Order[][] {
    const maxBatchSize = 4;
    const groups: Order[][] = [];
    const processed = new Set<string>();
    
    orders.forEach(order => {
      if (processed.has(order.id)) return;
      
      const group = [order];
      processed.add(order.id);
      
      // Find nearby orders
      orders.forEach(otherOrder => {
        if (processed.has(otherOrder.id)) return;
        if (group.length >= maxBatchSize) return;
        
        if (this.areOrdersNearby(order, otherOrder)) {
          group.push(otherOrder);
          processed.add(otherOrder.id);
        }
      });
      
      groups.push(group);
    });
    
    return groups;
  }

  /**
   * Check if two orders are nearby
   */
  private areOrdersNearby(order1: Order, order2: Order): boolean {
    if (!order1.deliveryAddress || !order2.deliveryAddress) return false;
    
    // Check if same neighborhood
    const neighborhood1 = this.extractNeighborhood(order1.deliveryAddress);
    const neighborhood2 = this.extractNeighborhood(order2.deliveryAddress);
    
    return neighborhood1 === neighborhood2;
  }

  /**
   * Calculate estimated time for batch
   */
  private calculateBatchTime(orders: Order[]): number {
    // Base time + time per order
    const baseTime = 10; // minutes
    const timePerOrder = 5; // minutes
    const travelTime = orders.length * 3; // minutes between stops
    
    return baseTime + (orders.length * timePerOrder) + travelTime;
  }

  /**
   * Calculate total distance for batch
   */
  private calculateBatchDistance(orders: Order[]): number {
    // Simplified calculation
    return orders.length * 1.5; // miles per order average
  }

  /**
   * Optimize delivery route
   */
  private optimizeRoute(orders: Order[]): Array<{ orderId: string; address: string; sequence: number }> {
    // Simple route optimization - in production use routing API
    return orders.map((order, index) => ({
      orderId: order.id,
      address: order.deliveryAddress || '',
      sequence: index + 1
    }));
  }

  /**
   * Get recommended location for new order
   */
  recommendLocation(deliveryAddress: string): LocationId {
    const neighborhood = this.extractNeighborhood(deliveryAddress);
    const coveredLocations = this.zoneCoverage[neighborhood];
    
    if (coveredLocations && coveredLocations.length > 0) {
      // Return location with lowest load
      const locations = coveredLocations.map(id => dataStore.getLocationById(id)!);
      locations.sort((a, b) => {
        const loadA = a.stats.kitchenLoad === 'low' ? 0 : a.stats.kitchenLoad === 'medium' ? 1 : 2;
        const loadB = b.stats.kitchenLoad === 'low' ? 0 : b.stats.kitchenLoad === 'medium' ? 1 : 2;
        return loadA - loadB;
      });
      
      return locations[0].id;
    }
    
    // Default to Times Square (central location)
    return 'times-square';
  }
}

export const orderRoutingService = new OrderRoutingService();