import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'soft' | 'glass';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
  actions?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, padding = 'md', children, ...props }, ref) => {
    const baseClasses = cn(
      'rounded-2xl border transition-all duration-200 overflow-hidden',
      {
        'cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]': interactive,
      }
    );

    const variants = {
      default: 'bg-white border-gray-100 shadow-bakery hover:shadow-bakery-lg',
      elevated: 'bg-white border-gray-200 shadow-lg hover:shadow-xl',
      outlined: 'bg-white border-gray-300 shadow-sm hover:shadow-md',
      soft: 'bg-gray-50 border-gray-200 shadow-sm hover:shadow-md',
      glass: 'bg-white/80 border-white/20 backdrop-blur-sm shadow-md hover:shadow-lg',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          padding !== 'none' && paddings[padding],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, divider = true, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'px-6 py-4',
          divider && 'border-b border-gray-100 bg-gray-50/30',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('p-6', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, divider = true, actions = false, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'px-6 py-4',
          divider && 'border-t border-gray-100 bg-gray-50/30',
          actions && 'flex items-center justify-end space-x-3',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };

// Specialized Card Components
export interface StatCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: ReactNode;
  description?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  description,
  loading = false,
  className,
  ...props
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn('p-6', className)} {...props}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn('p-6 hover:scale-105 transition-transform duration-200', className)} 
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className={cn(
              'inline-flex items-center text-sm font-medium',
              {
                'text-success-600': change.type === 'positive',
                'text-error-600': change.type === 'negative',
                'text-gray-600': change.type === 'neutral',
              }
            )}>
              {change.type === 'positive' && (
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.94" />
                </svg>
              )}
              {change.type === 'negative' && (
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
                </svg>
              )}
              {change.value}
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <div className="p-3 bg-gray-100 rounded-lg">
              <div className="h-6 w-6 text-gray-600">
                {icon}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export interface OrderCardProps extends Omit<CardProps, 'children'> {
  orderId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
  timestamp: Date;
  location?: 'brooklyn' | 'ues' | 'times-square';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  estimatedTime?: string;
}

export function OrderCard({
  orderId,
  customerName,
  items,
  total,
  status,
  timestamp,
  location,
  priority = 'normal',
  estimatedTime,
  className,
  ...props
}: OrderCardProps) {
  const statusConfig = {
    pending: { 
      label: 'Pending', 
      variant: 'default' as const,
      color: 'border-l-gray-400',
      animation: ''
    },
    confirmed: { 
      label: 'Confirmed', 
      variant: 'info' as const,
      color: 'border-l-info-400',
      animation: 'animate-order-pulse'
    },
    preparing: { 
      label: 'Preparing', 
      variant: 'warning' as const,
      color: 'border-l-warning-400',
      animation: 'animate-pulse-fast'
    },
    ready: { 
      label: 'Ready', 
      variant: 'success' as const,
      color: 'border-l-success-400',
      animation: 'animate-bounce-gentle'
    },
    'out-for-delivery': { 
      label: 'Out for Delivery', 
      variant: 'primary' as const,
      color: 'border-l-brooklyn-400',
      animation: 'animate-delivery-move'
    },
    delivered: { 
      label: 'Delivered', 
      variant: 'success' as const,
      color: 'border-l-success-500',
      animation: ''
    },
    cancelled: { 
      label: 'Cancelled', 
      variant: 'error' as const,
      color: 'border-l-error-500',
      animation: ''
    },
  };

  const priorityConfig = {
    low: { color: 'text-gray-500', bg: 'bg-gray-100' },
    normal: { color: 'text-blue-600', bg: 'bg-blue-100' },
    high: { color: 'text-warning-600', bg: 'bg-warning-100' },
    urgent: { color: 'text-error-600', bg: 'bg-error-100' },
  };

  const locationConfig = {
    brooklyn: { name: 'Brooklyn', color: 'text-brooklyn-600', bg: 'bg-brooklyn-100' },
    ues: { name: 'Upper East Side', color: 'text-ues-600', bg: 'bg-ues-100' },
    'times-square': { name: 'Times Square', color: 'text-times-square-600', bg: 'bg-times-square-100' },
  };

  const currentStatus = statusConfig[status];
  const currentPriority = priorityConfig[priority];
  const currentLocation = location ? locationConfig[location] : null;

  return (
    <Card 
      className={cn(
        'border-l-4 transition-all duration-300 hover:shadow-xl',
        currentStatus.color,
        currentStatus.animation,
        className
      )} 
      interactive
      padding="none"
      {...props}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900">#{orderId}</h3>
              {priority !== 'normal' && (
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  currentPriority.color,
                  currentPriority.bg
                )}>
                  {priority.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{customerName}</p>
            <p className="text-xs text-gray-500">
              {timestamp.toLocaleTimeString()} • {timestamp.toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span 
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full ring-1 ring-inset',
                  `bg-${currentStatus.variant === 'default' ? 'gray' : currentStatus.variant}-50`,
                  `text-${currentStatus.variant === 'default' ? 'gray' : currentStatus.variant}-700`,
                  `ring-${currentStatus.variant === 'default' ? 'gray' : currentStatus.variant}-200`
                )}
              >
                {currentStatus.label}
              </span>
            </div>
            {currentLocation && (
              <div className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-md',
                currentLocation.color,
                currentLocation.bg
              )}>
                {currentLocation.name}
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-4">
          {items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">${item.price.toFixed(2)}</span>
            </div>
          ))}
          {items.length > 3 && (
            <div className="text-xs text-gray-500">
              +{items.length - 3} more items
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-lg font-bold text-gray-900">
            ${total.toFixed(2)}
          </div>
          {estimatedTime && (
            <div className="text-sm text-gray-600">
              ETA: {estimatedTime}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export interface LocationCardProps extends Omit<CardProps, 'children'> {
  name: string;
  address: string;
  phone: string;
  hours: string;
  location: 'brooklyn' | 'ues' | 'times-square';
  status: 'open' | 'closed' | 'busy';
  metrics?: {
    ordersToday: number;
    revenue: number;
    avgWaitTime: string;
  };
  image?: string;
}

export function LocationCard({
  name,
  address,
  phone,
  hours,
  location,
  status,
  metrics,
  image,
  className,
  ...props
}: LocationCardProps) {
  const locationStyles = {
    brooklyn: 'bg-gradient-to-br from-brooklyn-50 to-brooklyn-100 border-brooklyn-200 shadow-location',
    ues: 'bg-gradient-to-br from-ues-50 to-ues-100 border-ues-200 shadow-warm',
    'times-square': 'bg-gradient-to-br from-times-square-50 to-times-square-100 border-times-square-200',
  };

  const statusConfig = {
    open: { label: 'Open', variant: 'success' as const, dot: 'bg-success-500' },
    closed: { label: 'Closed', variant: 'error' as const, dot: 'bg-error-500' },
    busy: { label: 'Busy', variant: 'warning' as const, dot: 'bg-warning-500' },
  };

  const currentStatus = statusConfig[status];

  return (
    <Card
      className={cn(
        locationStyles[location],
        'hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
        className
      )}
      interactive
      padding="none"
      {...props}
    >
      {image && (
        <div className="h-48 bg-gray-200 rounded-t-2xl overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-semibold text-gray-900 mb-1">{name}</h3>
            <p className="text-sm text-gray-600 mb-2">{address}</p>
            <p className="text-sm text-gray-600">{phone}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={cn('w-2 h-2 rounded-full', currentStatus.dot)}></div>
            <span className="text-sm font-medium text-gray-700">{currentStatus.label}</span>
          </div>
        </div>

        {/* Hours */}
        <div className="mb-4 p-3 bg-white/50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Hours:</span> {hours}
          </p>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{metrics.ordersToday}</p>
              <p className="text-xs text-gray-600">Orders Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">${metrics.revenue.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{metrics.avgWaitTime}</p>
              <p className="text-xs text-gray-600">Avg Wait</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}