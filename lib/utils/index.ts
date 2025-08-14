import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

export function getLocationColorClass(locationId: string): string {
  switch (locationId) {
    case 'brooklyn':
      return 'brooklyn';
    case 'ues':
      return 'ues';
    case 'times-square':
      return 'times-square';
    default:
      return 'brooklyn';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'preparing':
      return 'warning';
    case 'confirmed':
    case 'ready':
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'out-for-delivery':
      return 'info';
    default:
      return 'info';
  }
}

export function calculateEstimatedTime(orderItems: any[], kitchenLoad: string): Date {
  const baseTime = orderItems.length * 5; // 5 minutes per item base
  const loadMultiplier = kitchenLoad === 'high' ? 1.5 : kitchenLoad === 'medium' ? 1.2 : 1;
  const totalMinutes = Math.ceil(baseTime * loadMultiplier);
  
  return new Date(Date.now() + totalMinutes * 60 * 1000);
}