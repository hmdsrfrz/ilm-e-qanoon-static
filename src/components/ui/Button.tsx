// src/components/ui/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { RingSpinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
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
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-6 py-2.5 text-[12px]',
    lg: 'px-8 py-3.5 text-[14px]',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "relative flex items-center justify-center gap-2 border font-ui uppercase tracking-widest transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <RingSpinner className="absolute left-1/2 -translate-x-1/2" />}
      <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
        {icon && iconPosition === 'left' && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      </span>
    </button>
  );
});

Button.displayName = 'Button';
