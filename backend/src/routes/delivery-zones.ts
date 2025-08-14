import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/error';
import { ResponseUtil } from '@/utils/response';
import { dataStore } from '@/services/data-store';
import { DeliveryZone, LocationId } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @route GET /api/delivery-zones
 * @desc Get all delivery zones
 * @access Private
 */
router.get('/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { locationId, active } = req.query;
    
    let zones = dataStore.getDeliveryZones();

    // Filter by location if provided
    if (locationId) {
      zones = dataStore.getDeliveryZonesByLocation(locationId as LocationId);
    }

    // Filter by active status if provided
    if (active !== undefined) {
      const isActive = active === 'true';
      zones = zones.filter(zone => zone.active === isActive);
    }

    // Filter based on user permissions
    if (req.user?.role === 'kitchen' || req.user?.role === 'driver') {
      if (req.user.locationId) {
        zones = zones.filter(zone => zone.locationId === req.user!.locationId);
      }
    }

    ResponseUtil.success(res, zones);
  })
);

/**
 * @route GET /api/delivery-zones/:id
 * @desc Get delivery zone by ID
 * @access Private
 */
router.get('/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const zone = dataStore.getDeliveryZoneById(id);

    if (!zone) {
      return ResponseUtil.notFound(res, 'Delivery zone not found');
    }

    // Check permissions
    if ((req.user?.role === 'kitchen' || req.user?.role === 'driver') && 
        req.user?.locationId !== zone.locationId) {
      return ResponseUtil.forbidden(res, 'Access to this delivery zone not allowed');
    }

    ResponseUtil.success(res, zone);
  })
);

/**
 * @route PUT /api/delivery-zones/:id
 * @desc Update delivery zone
 * @access Manager/Owner only
 */
router.put('/:id',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    const existingZone = dataStore.getDeliveryZoneById(id);
    if (!existingZone) {
      return ResponseUtil.notFound(res, 'Delivery zone not found');
    }

    // Managers can only update zones for their location
    if (req.user?.role === 'manager' && req.user?.locationId !== existingZone.locationId) {
      return ResponseUtil.forbidden(res, 'Can only update zones for your location');
    }

    // Validate updates
    const allowedUpdates: Partial<DeliveryZone> = {};
    
    if (updates.name) allowedUpdates.name = updates.name;
    if (updates.deliveryFee !== undefined) allowedUpdates.deliveryFee = updates.deliveryFee;
    if (updates.estimatedTime !== undefined) allowedUpdates.estimatedTime = updates.estimatedTime;
    if (updates.active !== undefined) allowedUpdates.active = updates.active;
    if (updates.coordinates) allowedUpdates.coordinates = updates.coordinates;

    const updatedZone = dataStore.updateDeliveryZone(id, allowedUpdates);
    if (!updatedZone) {
      return ResponseUtil.internalError(res, 'Failed to update delivery zone');
    }

    logger.info('Delivery zone updated', {
      zoneId: id,
      updatedBy: req.user?.id,
      updates: Object.keys(allowedUpdates)
    });

    ResponseUtil.success(res, updatedZone, 'Delivery zone updated successfully');
  })
);

/**
 * @route POST /api/delivery-zones/:id/toggle
 * @desc Toggle delivery zone active status
 * @access Manager/Owner only
 */
router.post('/:id/toggle',
  authenticate,
  authorize(['owner', 'manager']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    
    const zone = dataStore.getDeliveryZoneById(id);
    if (!zone) {
      return ResponseUtil.notFound(res, 'Delivery zone not found');
    }

    // Managers can only toggle zones for their location
    if (req.user?.role === 'manager' && req.user?.locationId !== zone.locationId) {
      return ResponseUtil.forbidden(res, 'Can only toggle zones for your location');
    }

    const updatedZone = dataStore.updateDeliveryZone(id, { 
      active: !zone.active 
    });

    if (!updatedZone) {
      return ResponseUtil.internalError(res, 'Failed to toggle delivery zone');
    }

    logger.info('Delivery zone toggled', {
      zoneId: id,
      newStatus: updatedZone.active,
      toggledBy: req.user?.id
    });

    ResponseUtil.success(res, updatedZone, 
      `Delivery zone ${updatedZone.active ? 'activated' : 'deactivated'}`);
  })
);

/**
 * @route POST /api/delivery-zones/calculate-route
 * @desc Calculate delivery route and estimate time
 * @access Private
 */
router.post('/calculate-route',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { fromLocation, toAddress, locationId } = req.body;

    if (!fromLocation || !toAddress || !locationId) {
      return ResponseUtil.badRequest(res, 
        'From location, to address, and location ID are required');
    }

    // Get delivery zones for the location
    const zones = dataStore.getDeliveryZonesByLocation(locationId);
    
    // Simple mock route calculation
    // In a real app, this would integrate with Google Maps/similar service
    const route = calculateMockRoute(fromLocation, toAddress, zones);

    ResponseUtil.success(res, route, 'Route calculated successfully');
  })
);

/**
 * @route GET /api/delivery-zones/location/:locationId/coverage
 * @desc Get delivery coverage for a location
 * @access Private
 */
router.get('/location/:locationId/coverage',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { locationId } = req.params;

    // Check permissions
    if ((req.user?.role === 'kitchen' || req.user?.role === 'driver') && 
        req.user?.locationId !== locationId) {
      return ResponseUtil.forbidden(res, 'Access to this location not allowed');
    }

    const zones = dataStore.getDeliveryZonesByLocation(locationId as LocationId);
    const activeZones = zones.filter(zone => zone.active);

    // Calculate coverage statistics
    const coverage = {
      totalZones: zones.length,
      activeZones: activeZones.length,
      minDeliveryFee: activeZones.length > 0 ? Math.min(...activeZones.map(z => z.deliveryFee)) : 0,
      maxDeliveryFee: activeZones.length > 0 ? Math.max(...activeZones.map(z => z.deliveryFee)) : 0,
      avgEstimatedTime: activeZones.length > 0 ? 
        Math.round(activeZones.reduce((sum, z) => sum + z.estimatedTime, 0) / activeZones.length) : 0,
      zones: activeZones.map(zone => ({
        id: zone.id,
        name: zone.name,
        deliveryFee: zone.deliveryFee,
        estimatedTime: zone.estimatedTime
      }))
    };

    ResponseUtil.success(res, coverage);
  })
);

/**
 * @route POST /api/delivery-zones/check-address
 * @desc Check if an address is within delivery zones
 * @access Public (for order placement)
 */
router.post('/check-address',
  asyncHandler(async (req, res) => {
    const { address, locationId, coordinates } = req.body;

    if (!address || !locationId) {
      return ResponseUtil.badRequest(res, 'Address and location ID are required');
    }

    const zones = dataStore.getDeliveryZonesByLocation(locationId as LocationId)
      .filter(zone => zone.active);

    // Mock address checking - in real app would use geocoding service
    const deliveryOptions = checkAddressInZones(address, coordinates, zones);

    if (deliveryOptions.length === 0) {
      return ResponseUtil.success(res, {
        available: false,
        message: 'Delivery not available to this address',
        alternatives: getNearbyAlternatives(locationId, coordinates)
      });
    }

    // Return the best option (cheapest and fastest)
    const bestOption = deliveryOptions.reduce((best, current) => {
      if (current.deliveryFee < best.deliveryFee) return current;
      if (current.deliveryFee === best.deliveryFee && current.estimatedTime < best.estimatedTime) {
        return current;
      }
      return best;
    });

    ResponseUtil.success(res, {
      available: true,
      deliveryFee: bestOption.deliveryFee,
      estimatedTime: bestOption.estimatedTime,
      zone: bestOption.zone,
      allOptions: deliveryOptions
    });
  })
);

// Helper functions (in a real app, these would be in separate service modules)

function calculateMockRoute(fromLocation: any, toAddress: string, zones: DeliveryZone[]) {
  // Mock route calculation
  const distance = Math.random() * 5 + 1; // 1-6 km
  const estimatedTime = Math.round(distance * 4 + Math.random() * 10); // Rough estimate
  
  // Find applicable zone
  const applicableZone = zones.find(zone => zone.active);
  
  return {
    distance: Math.round(distance * 100) / 100,
    estimatedTime,
    deliveryFee: applicableZone?.deliveryFee || 3.50,
    route: [
      fromLocation,
      { lat: fromLocation.lat + 0.01, lng: fromLocation.lng + 0.01 },
      { lat: fromLocation.lat + 0.02, lng: fromLocation.lng + 0.015 }
    ]
  };
}

function checkAddressInZones(address: string, coordinates: any, zones: DeliveryZone[]) {
  // Mock zone checking - in real app would use proper geolocation
  // For demo, assume most addresses are in first zone
  const options = [];
  
  if (zones.length > 0) {
    const zone = zones[0];
    options.push({
      zone: zone.name,
      deliveryFee: zone.deliveryFee,
      estimatedTime: zone.estimatedTime + Math.floor(Math.random() * 10)
    });
  }
  
  return options;
}

function getNearbyAlternatives(locationId: string, coordinates: any) {
  // Mock alternatives - suggest nearby areas
  return [
    'Try a different address in the same area',
    'Check if pickup is available',
    'Consider our other locations'
  ];
}

export { router as deliveryZonesRouter };