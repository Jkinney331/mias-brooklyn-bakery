# Mia's Brooklyn Bakery - Management System

A comprehensive multi-location bakery management system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🏪 Multi-Location Management
- **Brooklyn Flagship** - Teal theme (#5A9FA8)
- **Upper East Side** - Gold theme (#D4A574)  
- **Times Square Express** - Purple theme (#8B7AA1)

### 👥 Role-Based Access Control
- **Owner/Admin**: Full system access across all locations
- **Store Manager**: Location-specific management capabilities
- **Kitchen Staff**: Order preparation and kitchen display
- **Delivery Driver**: Delivery tracking and order updates

### 📊 Core Functionality
- **Dashboard**: Real-time overview with location-specific stats
- **Order Management**: Complete order lifecycle tracking
- **Delivery Tracking**: Real-time delivery status and driver management
- **Driver Management**: Driver assignments and performance tracking
- **Location Management**: Individual location monitoring and control
- **Admin Panel**: System-wide configuration and user management

### 🔧 Technical Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom bakery-themed design system
- **Zustand** for state management
- **Mock Authentication** with role-based permissions
- **Responsive Design** optimized for desktop and mobile
- **Real-time Notifications** with toast system
- **Location-aware Routing** with dynamic pages

## Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mias
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Accounts

The system includes several demo accounts to showcase different user roles:

| Email | Role | Location | Access Level |
|-------|------|----------|-------------|
| mia@miasbrooklynbakery.com | Owner/Admin | All | Full system access |
| sarah@miasbrooklynbakery.com | Manager | Brooklyn | Location management |
| michael@miasbrooklynbakery.com | Manager | UES | Location management |
| emma@miasbrooklynbakery.com | Manager | Times Square | Location management |
| carlos@miasbrooklynbakery.com | Kitchen | Brooklyn | Kitchen operations |
| david@miasbrooklynbakery.com | Driver | - | Delivery operations |

**Note**: Use any password for demo accounts (e.g., "demo123")

## Project Structure

```
mias/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── locations/         # Location management
│   ├── orders/            # Order management  
│   ├── delivery/          # Delivery tracking
│   ├── drivers/           # Driver management
│   ├── admin/             # Admin panel
│   └── login/             # Authentication
├── components/            # Reusable React components
│   ├── ui/                # Basic UI components
│   ├── layout/            # Layout components
│   └── forms/             # Form components
├── stores/                # Zustand state management
├── lib/                   # Utility functions and auth
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Key Components

### Authentication System
- Mock authentication with role-based access control
- Persistent sessions using localStorage
- Permission-based route protection

### State Management
- **Auth Store**: User authentication and permissions
- **App Store**: Application data and real-time updates
- Zustand for lightweight, performant state management

### Design System
- Custom Tailwind configuration with bakery-themed colors
- Location-specific color schemes
- Responsive breakpoints and mobile-first design
- Consistent typography using Inter and Playfair Display

### Real-time Features
- Live order status updates
- Driver location tracking simulation
- Notification system with toast messages
- Auto-refreshing dashboard stats

## Routing Structure

- `/` - Home page (redirects to dashboard or login)
- `/login` - Authentication page
- `/dashboard` - Main dashboard with overview stats
- `/locations` - Location listing and management
- `/locations/[id]` - Individual location details
- `/orders` - Order management and tracking
- `/delivery` - Delivery tracking and assignment
- `/drivers` - Driver management and performance
- `/admin` - System administration (Owner only)

## Customization

### Adding New Locations
1. Update the `locations` array in `stores/app-store.ts`
2. Add color theme in `tailwind.config.js`
3. Update location-specific styling classes

### Extending User Roles
1. Add role to `UserRole` type in `types/index.ts`
2. Update permission system in `lib/auth/mock-auth.ts`
3. Add role-specific UI in components

### Custom Notifications
Use the notification system to add real-time updates:

```typescript
import { useAppStore } from '@/stores/app-store';

const { addNotification } = useAppStore();

addNotification({
  type: 'order',
  priority: 'medium',
  title: 'New Order',
  message: 'Order #123 has been placed',
  locationId: 'brooklyn'
});
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Code Standards
- TypeScript strict mode enabled
- ESLint with Next.js recommended rules
- Consistent component structure and naming
- Mobile-first responsive design approach

## Future Enhancements

- WebSocket integration for real-time updates
- Payment processing integration
- Advanced analytics and reporting
- Mobile app with React Native
- Kitchen display system
- Customer-facing ordering interface
- Inventory management system
- Staff scheduling and management

## License

This project is a demonstration prototype for Mia's Brooklyn Bakery management system.