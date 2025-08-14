import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 
    | 'default' 
    | 'success' 
    | 'warning' 
    | 'error' 
    | 'info'
    | 'primary'
    | 'secondary'
    | 'brooklyn'
    | 'ues'
    | 'times-square'
    | 'outline'
    | 'soft';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Badge({ 
  className, 
  variant = 'default', 
  size = 'sm',
  dot = false,
  pulse = false,
  removable = false,
  onRemove,
  leftIcon,
  rightIcon,
  children, 
  ...props 
}: BadgeProps) {
  const baseClasses = cn(
    'inline-flex items-center font-medium ring-1 ring-inset transition-all duration-200',
    {
      'animate-pulse-fast': pulse,
    }
  );

  const variants = {
    default: 'bg-gray-50 text-gray-700 ring-gray-200',
    success: 'bg-success-50 text-success-700 ring-success-200',
    warning: 'bg-warning-50 text-warning-700 ring-warning-200',
    error: 'bg-error-50 text-error-700 ring-error-200',
    info: 'bg-info-50 text-info-700 ring-info-200',
    primary: 'bg-brooklyn-50 text-brooklyn-700 ring-brooklyn-200',
    secondary: 'bg-gray-100 text-gray-700 ring-gray-300',
    brooklyn: 'bg-brooklyn-100 text-brooklyn-800 ring-brooklyn-300',
    ues: 'bg-ues-100 text-ues-800 ring-ues-300',
    'times-square': 'bg-times-square-100 text-times-square-800 ring-times-square-300',
    outline: 'bg-transparent text-gray-700 ring-gray-400',
    soft: 'bg-gray-100 text-gray-800 ring-gray-200',
  };

  const sizes = {
    xs: {
      badge: 'px-1.5 py-0.5 text-xs rounded-md',
      dot: 'w-1.5 h-1.5 rounded-full',
      icon: 'h-2.5 w-2.5',
      remove: 'h-3 w-3',
    },
    sm: {
      badge: 'px-2.5 py-0.5 text-xs rounded-full',
      dot: 'w-2 h-2 rounded-full',
      icon: 'h-3 w-3',
      remove: 'h-3.5 w-3.5',
    },
    md: {
      badge: 'px-3 py-1 text-sm rounded-full',
      dot: 'w-2.5 h-2.5 rounded-full',
      icon: 'h-4 w-4',
      remove: 'h-4 w-4',
    },
    lg: {
      badge: 'px-4 py-1.5 text-sm rounded-full',
      dot: 'w-3 h-3 rounded-full',
      icon: 'h-5 w-5',
      remove: 'h-5 w-5',
    },
  };

  const RemoveIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  if (dot) {
    return (
      <span
        className={cn(
          sizes[size].dot,
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }

  return (
    <span
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size].badge,
        className
      )}
      {...props}
    >
      {leftIcon && (
        <span className={cn('flex items-center', children && 'mr-1')}>
          <span className={sizes[size].icon}>{leftIcon}</span>
        </span>
      )}
      
      {children}
      
      {rightIcon && !removable && (
        <span className={cn('flex items-center', children && 'ml-1')}>
          <span className={sizes[size].icon}>{rightIcon}</span>
        </span>
      )}
      
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className={cn(
            'flex items-center hover:bg-black/10 rounded-full p-0.5 ml-1 transition-colors',
            'focus:outline-none focus:bg-black/20'
          )}
        >
          <RemoveIcon className={sizes[size].remove} />
        </button>
      )}
    </span>
  );
}