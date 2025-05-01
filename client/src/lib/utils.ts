import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a readable format
 * @param dateString - Date string to format
 * @param formatStr - Format string to use (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const date = new Date(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format a number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'PHP')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'PHP'): string {
  try {
    // Use the default locale of the user's browser
    const formatter = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Truncate text with ellipsis if it exceeds maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate initials from a name
 * @param name - Full name 
 * @param maxInitials - Maximum number of initials to generate (default: 2)
 * @returns String with initials
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  let initials = '';
  
  for (let i = 0; i < Math.min(parts.length, maxInitials); i++) {
    if (parts[i][0]) {
      initials += parts[i][0].toUpperCase();
    }
  }
  
  return initials;
}

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}
