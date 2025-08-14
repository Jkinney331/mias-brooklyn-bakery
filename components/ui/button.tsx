import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | 'primary' 
    | 'secondary' 
    | 'ghost' 
    | 'danger' 
    | 'success' 
    | 'warning'
    | 'brooklyn' 
    | 'ues' 
    | 'times-square'
    | 'outline'
    | 'soft';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading, 
    leftIcon,
    rightIcon,
    fullWidth,
    rounded,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'active:scale-95',
      {
        'w-full': fullWidth,
        'rounded-full': rounded,
        'rounded-lg': !rounded,
      }
    );
    
    const variants = {
      primary: 'bg-brooklyn-500 text-white hover:bg-brooklyn-600 active:bg-brooklyn-700 focus:ring-brooklyn-500 shadow-sm hover:shadow-md',
      secondary: 'bg-white text-brooklyn-600 border border-brooklyn-300 hover:bg-brooklyn-50 hover:border-brooklyn-400 active:bg-brooklyn-100 focus:ring-brooklyn-500 shadow-sm hover:shadow-md',
      ghost: 'text-gray-700 hover:bg-gray-100 hover:text-brooklyn-600 active:bg-gray-200 focus:ring-gray-500',
      danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus:ring-error-500 shadow-sm hover:shadow-md',
      success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700 focus:ring-success-500 shadow-sm hover:shadow-md',
      warning: 'bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 focus:ring-warning-500 shadow-sm hover:shadow-md',
      brooklyn: 'bg-brooklyn-500 text-white hover:bg-brooklyn-600 active:bg-brooklyn-700 focus:ring-brooklyn-500 shadow-location hover:shadow-xl',
      ues: 'bg-ues-500 text-white hover:bg-ues-600 active:bg-ues-700 focus:ring-ues-500 shadow-warm hover:shadow-xl',
      'times-square': 'bg-times-square-500 text-white hover:bg-times-square-600 active:bg-times-square-700 focus:ring-times-square-500 shadow-md hover:shadow-xl',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 focus:ring-gray-500',
      soft: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-500',
    };

    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const iconSizes = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    };

    const LoadingSpinner = ({ className }: { className?: string }) => (
      <svg
        className={cn('animate-spin', className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const hasLeftContent = loading || leftIcon;
    const hasRightContent = rightIcon;

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {hasLeftContent && (
          <span className={cn(
            'flex items-center',
            children && (hasLeftContent ? 'mr-2' : '')
          )}>
            {loading ? (
              <LoadingSpinner className={iconSizes[size]} />
            ) : (
              leftIcon && <span className={iconSizes[size]}>{leftIcon}</span>
            )}
          </span>
        )}
        
        {children && (
          <span className="flex-1">
            {children}
          </span>
        )}
        
        {hasRightContent && !loading && (
          <span className={cn(
            'flex items-center',
            children && 'ml-2'
          )}>
            <span className={iconSizes[size]}>{rightIcon}</span>
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };