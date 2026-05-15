// src/components/ui/Textarea.tsx
import { forwardRef, useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((
  {
    maxHeight = 160,
    className,
    onChange,
    ...props
  },
  externalRef
) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = internalRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [maxHeight]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [props.value, adjustTextareaHeight]);

  useImperativeHandle(externalRef, () => internalRef.current!, [internalRef.current]);

  return (
    <textarea
      ref={internalRef}
      className={cn(
        "w-full bg-pk-black/50 border border-pk-border p-4 text-pk-paper font-body text-sm focus:outline-none focus:border-pk-green placeholder:text-pk-muted resize-none scrollbar-thin scrollbar-thumb-pk-green scrollbar-track-transparent transition-colors",
        className
      )}
      onChange={(e) => {
        adjustTextareaHeight();
        if (onChange) {
          onChange(e);
        }
      }}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
