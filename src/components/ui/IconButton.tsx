// src/components/ui/IconButton.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { RingSpinner } from './Spinner';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}, ref) => {
  const variants = {
    primary: 'border-pk-green text-pk-green hover:bg-pk-green-glow bg-transparent active:scale-[0.97]',
    ghost: 'border-pk-border text-pk-muted hover:border-pk-green hover:text-pk-green bg-transparent active:scale-[0.97]',
    danger: 'border-pk-red text-pk-red hover:bg-pk-red/10 bg-transparent active:scale-[0.97]',
  };

  const sizes = {
    sm: 'p-1.5 w-8 h-8',
    md: 'p-2.5 w-10 h-10',
    lg: 'p-3.5 w-12 h-12',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "relative flex items-center justify-center border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <RingSpinner /> : children}
    </button>
  );
});

IconButton.displayName = 'IconButton';
