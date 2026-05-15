// src/lib/formatDate.ts
import { format, isToday, isYesterday } from 'date-fns';

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  
  if (isToday(d)) {
    return `Today // ${format(d, 'HH:mm')}`;
  }
  
  if (isYesterday(d)) {
    return `Yesterday // ${format(d, 'HH:mm')}`;
  }
  
  return format(d, 'MMM dd // HH:mm');
}
