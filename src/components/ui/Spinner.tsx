// src/components/ui/Spinner.tsx
import { cn } from '@/lib/cn';

interface SpinnerProps {
  className?: string;
}

export function ThinkingDots({ className }: SpinnerProps) {
  return (
    <div className={cn("flex gap-[5px] items-center p-4 border-l-2 border-pk-green bg-pk-green-glow", className)}>
      <span className="w-[5px] h-[5px] rounded-full bg-pk-green animate-think [animation-delay:0s]" />
      <span className="w-[5px] h-[5px] rounded-full bg-pk-green animate-think [animation-delay:0.2s]" />
      <span className="w-[5px] h-[5px] rounded-full bg-pk-green animate-think [animation-delay:0.4s]" />
    </div>
  );
}

export function RingSpinner({ className }: SpinnerProps) {
  return (
    <div className={cn("w-4 h-4 border-2 border-pk-green border-t-transparent rounded-full animate-spin", className)} />
  );
}
