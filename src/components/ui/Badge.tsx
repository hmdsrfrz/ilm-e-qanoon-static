// src/components/ui/Badge.tsx
import { cn } from '@/lib/cn';

export interface BadgeProps {
  variant?: 'online' | 'processing' | 'error' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    online: 'border-pk-green text-pk-green bg-pk-green/10',
    processing: 'border-pk-green text-pk-green bg-pk-green/10',
    error: 'border-pk-red text-pk-red bg-pk-red/10',
    default: 'border-pk-border text-pk-muted bg-pk-black',
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-2 py-0.5 border text-[10px] font-mono tracking-widest uppercase rounded-sm",
      variants[variant],
      className
    )}>
      {(variant === 'online' || variant === 'processing') && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full bg-pk-green",
          variant === 'online' ? "animate-pulse-dot" : "animate-pulse-dot"
        )} />
      )}
      {variant === 'error' && (
        <span className="w-1.5 h-1.5 rounded-full bg-pk-red" />
      )}
      {children}
    </div>
  );
}
