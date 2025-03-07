import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  // If the input is a date string without time, append T12:00:00 to avoid timezone issues
  const dateWithTime = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
  const date = new Date(dateWithTime);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
