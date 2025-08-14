# Mia's Brooklyn Bakery Backend

A complete Node.js/Express backend server for the Mia's Brooklyn Bakery management system with TypeScript, WebSocket support, and comprehensive API endpoints.

## Features

- **RESTful API** with comprehensive endpoints for all bakery operations
- **WebSocket Server** for real-time updates and notifications
- **Authentication & Authorization** with JWT tokens and role-based access
- **Mock Data Generation** for realistic demo experience
- **Real-time Analytics** with live metrics and performance tracking
- **TypeScript** for type safety and better development experience
- **Comprehensive Middleware** for security, validation, and error handling

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User authentication
- `POST /logout` - User logout  
- `GET /me` - Get current user
- `POST /refresh` - Refresh JWT token
- `GET /demo-credentials` - Get demo login credentials

### Locations (`/api/locations`)
- `GET /` - Get all locations
- `GET /:id` - Get location by ID
- `PUT /:id` - Update location
- `GET /:id/stats` - Get location statistics
- `POST /:id/status` - Update location status

### Orders (`/api/orders`)
- `GET /` - Get orders with filtering and pagination
- `POST /` - Create new order
- `GET /:id` - Get order by ID
- `PUT /:id/status` - Update order status
- `DELETE /:id` - Cancel/delete order
- `GET /location/:locationId` - Get orders for location
- `POST /bulk-update` - Bulk update multiple orders

### Drivers (`/api/drivers`)
- `GET /` - Get all drivers
- `GET /:id` - Get driver by ID
- `PUT /:id/status` - Update driver status
- `PUT /:id/location` - Update driver location
- `POST /:id/assign-order` - Assign order to driver
- `POST /:id/complete-order` - Mark order as completed
- `GET /:id/orders` - Get orders assigned to driver
- `GET /stats/performance` - Get driver performance stats

### Delivery Zones (`/api/delivery-zones`)
- `GET /` - Get all delivery zones
- `GET /:id` - Get delivery zone by ID
- `PUT /:id` - Update delivery zone
- `POST /:id/toggle` - Toggle zone active status
- `POST /calculate-route` - Calculate delivery route
- `GET /location/:locationId/coverage` - Get delivery coverage
- `POST /check-address` - Check if address is deliverable

### Analytics (`/api/analytics`)
- `GET /dashboard` - Get dashboard analytics
- `GET /orders` - Get order analytics
- `GET /revenue` - Get revenue analytics
- `GET /performance` - Get performance metrics
- `GET /items` - Get item analytics
- `GET /locations-comparison` - Compare location performance
- `GET /real-time` - Get real-time metrics

### Notifications (`/api/notifications`)
- `GET /` - Get notifications
- `PUT /:id/read` - Mark notification as read
- `DELETE /:id` - Delete notification
- `POST /mark-all-read` - Mark all notifications as read

## WebSocket Events

### Client → Server
- `location-update` - Driver location updates
- `order-status-update` - Order status changes
- `kitchen-status-update` - Kitchen load updates
- `driver-status-update` - Driver availability changes
- `subscribe-analytics` - Subscribe to analytics updates
- `notification-read` - Mark notification as read

### Server → Client
- `order-updated` - Order status changed
- `new-order` - New order received
- `driver-updated` - Driver status/location changed
- `location-updated` - Location status changed
- `notification` - New notification
- `analytics-update` - Real-time analytics data
- `kitchen-notification` - Kitchen-specific alerts
- `driver-location-update` - Driver location tracking

## Demo Mode Features

When `DEMO_MODE=true` is set, the server includes:

- **Automatic Order Generation** - New orders created every 30 seconds
- **Order Status Progression** - Orders automatically move through workflow
- **Driver Movement Simulation** - GPS coordinates update in real-time
- **Kitchen Load Simulation** - Dynamic kitchen capacity metrics
- **Demo Login Credentials** - Pre-configured user accounts for testing

### Demo User Accounts

| Email | Password | Role | Location |
|-------|----------|------|----------|
| sarah@miasbakery.com | password123 | Owner | All |
| mike.brooklyn@miasbakery.com | password123 | Manager | Brooklyn |
| emma.ues@miasbakery.com | password123 | Manager | Upper East Side |
| carlos@miasbakery.com | password123 | Driver | - |
| julia.kitchen@miasbakery.com | password123 | Kitchen | Brooklyn |

## Environment Variables

```bash
PORT=3001                    # Server port
NODE_ENV=development         # Environment mode
JWT_SECRET=your-secret-key   # JWT signing secret
CORS_ORIGIN=http://localhost:3000  # Frontend URL
SESSION_SECRET=session-key   # Session secret
DEMO_MODE=true              # Enable demo features
```

## Architecture

### Data Flow
1. **RESTful APIs** handle CRUD operations
2. **WebSocket connections** provide real-time updates
3. **In-memory data store** maintains application state
4. **Mock generators** simulate realistic business activity
5. **Analytics engine** processes metrics in real-time

### Security Features
- JWT-based authentication
- Role-based authorization
- Request rate limiting
- CORS protection
- Input validation
- Error handling
- Security headers

### Real-time Features
- Live order tracking
- Driver location streaming
- Kitchen status monitoring
- Instant notifications
- Analytics dashboards
- Cross-location synchronization

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run type-check` - Type checking without compilation

### Project Structure
```
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic services
│   ├── websocket/       # WebSocket server
│   ├── mock-data/       # Demo data and generators
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server entry point
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env
```

## Production Deployment

1. Set environment variables appropriately
2. Disable demo mode: `DEMO_MODE=false`
3. Use a proper database instead of in-memory storage
4. Set up reverse proxy (nginx)
5. Configure SSL certificates
6. Set up monitoring and logging
7. Use process manager (PM2)

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description"
}
```

## Performance Features

- Request compression
- Response caching headers
- Efficient data queries
- Connection pooling for WebSockets
- Optimized JSON serialization
- Memory usage monitoring

This backend provides a complete foundation for the Mia's Brooklyn Bakery management system with enterprise-grade features and demo-ready functionality.