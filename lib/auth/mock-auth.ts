import { User, UserRole, Permission } from '@/types';

// Mock user database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Mia Rodriguez',
    email: 'mia@miasbrooklynbakery.com',
    role: 'owner',
    avatar: '/images/avatars/mia.jpg',
    permissions: [
      { resource: 'all', actions: ['read', 'write', 'delete', 'admin'] }
    ]
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@miasbrooklynbakery.com',
    role: 'manager',
    locationId: 'brooklyn',
    avatar: '/images/avatars/sarah.jpg',
    permissions: [
      { resource: 'orders', actions: ['read', 'write'] },
      { resource: 'kitchen', actions: ['read', 'write'] },
      { resource: 'staff', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ]
  },
  {
    id: '3',
    name: 'Michael Torres',
    email: 'michael@miasbrooklynbakery.com',
    role: 'manager',
    locationId: 'ues',
    avatar: '/images/avatars/michael.jpg',
    permissions: [
      { resource: 'orders', actions: ['read', 'write'] },
      { resource: 'kitchen', actions: ['read', 'write'] },
      { resource: 'staff', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ]
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma@miasbrooklynbakery.com',
    role: 'manager',
    locationId: 'times-square',
    avatar: '/images/avatars/emma.jpg',
    permissions: [
      { resource: 'orders', actions: ['read', 'write'] },
      { resource: 'kitchen', actions: ['read', 'write'] },
      { resource: 'staff', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ]
  },
  {
    id: '5',
    name: 'Carlos Martinez',
    email: 'carlos@miasbrooklynbakery.com',
    role: 'kitchen',
    locationId: 'brooklyn',
    avatar: '/images/avatars/carlos.jpg',
    permissions: [
      { resource: 'orders', actions: ['read', 'write'] },
      { resource: 'kitchen', actions: ['read', 'write'] }
    ]
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'david@miasbrooklynbakery.com',
    role: 'driver',
    avatar: '/images/avatars/david.jpg',
    permissions: [
      { resource: 'deliveries', actions: ['read', 'write'] },
      { resource: 'orders', actions: ['read'] }
    ]
  }
];

export class MockAuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, accept any password for existing users
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    this.currentUser = user;
    const token = this.generateMockToken(user);

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
      localStorage.setItem('current-user', JSON.stringify(user));
    }

    return { user, token };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('current-user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      const userStr = localStorage.getItem('current-user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUser = user;
          return user;
        } catch (error) {
          // Clear invalid data
          localStorage.removeItem('auth-token');
          localStorage.removeItem('current-user');
        }
      }
    }

    return null;
  }

  hasPermission(user: User, resource: string, action: string): boolean {
    if (user.role === 'owner') {
      return true; // Owner has all permissions
    }

    return user.permissions.some(permission => 
      (permission.resource === resource || permission.resource === 'all') &&
      permission.actions.includes(action)
    );
  }

  canAccessLocation(user: User, locationId: string): boolean {
    if (user.role === 'owner') {
      return true; // Owner can access all locations
    }

    if (!user.locationId) {
      return false; // User must be assigned to a location
    }

    return user.locationId === locationId;
  }

  private generateMockToken(user: User): string {
    // This is a mock token - in a real app, this would be a JWT or similar
    return btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
  }

  // Demo helper methods
  getAllUsers(): User[] {
    return mockUsers;
  }

  getUsersByRole(role: UserRole): User[] {
    return mockUsers.filter(user => user.role === role);
  }

  getUsersByLocation(locationId: string): User[] {
    return mockUsers.filter(user => user.locationId === locationId);
  }
}

export const authService = new MockAuthService();