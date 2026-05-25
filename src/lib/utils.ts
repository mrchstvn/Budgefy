import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// ── cn() — CSS CLASS COMBINER ─────────────────────────────────
// This is THE most-used utility in the whole app.
//
// Problem: Tailwind classes can conflict.
// 'text-red-500 text-blue-500' — which color wins? Both are applied,
// but only one shows. The result is unpredictable.
//
// Solution: cn() intelligently merges classes.
// cn('text-red-500', isBlue && 'text-blue-500') → 'text-blue-500'
// (when isBlue is true, blue wins cleanly)
//
// Usage: <div className={cn('base-classes', condition && 'extra-class')}>
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
  // clsx: handles conditional classes (removes false/null/undefined)
  // twMerge: resolves Tailwind conflicts (keeps the last one)
}

// ── formatCurrency() ──────────────────────────────────────────
// Formats a number as a currency string.
// formatCurrency(1234.5, 'PHP') → '₱1,234.50'
// formatCurrency(1234.5, 'USD') → '$1,234.50'
export function formatCurrency(
  amount: number | string,
  currency: 'PHP' | 'USD' = 'PHP'
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  // typeof checks the data type of a value.
  // If amount is a string (from the database), convert to number first.
  // If it's already a number, use it directly.

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  // Intl.NumberFormat is a BUILT-IN browser/Node.js feature.
  // 'en-PH' = English language, Philippines locale.
  // style: 'currency' adds the ₱ or $ symbol automatically.
  // minimumFractionDigits: 2 always shows 2 decimal places.
}

// ── getCurrencySymbol() ───────────────────────────────────────
// Returns just the symbol: 'PHP' → '₱' | 'USD' → '$'
export function getCurrencySymbol(currency: 'PHP' | 'USD'): string {
  return currency === 'PHP' ? '₱' : '$';
  // Ternary operator: condition ? value_if_true : value_if_false
}

// ── formatDate() ─────────────────────────────────────────────
// formatDate(new Date()) → 'January 15, 2025'
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMMM d, yyyy');
  // format() is from date-fns.
  // 'MMMM' = full month name (January, February, ...)
  // 'd'    = day without leading zero (1, 2, ..., 31)
  // 'yyyy' = 4-digit year (2025)
}

// ── formatDateShort() ────────────────────────────────────────
// formatDateShort(date) → 'Jan 15, 2025'
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
  // 'MMM' = 3-letter month abbreviation (Jan, Feb, ...)
}

// ── formatRelativeTime() ─────────────────────────────────────
// Shows how long ago something happened.
// formatRelativeTime(date) → '3 hours ago', '2 days ago'
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
  // formatDistanceToNow: calculates time between d and now.
  // addSuffix: true adds 'ago' to the result.
}

// ── getMonthName() ────────────────────────────────────────────
// getMonthName(1) → 'January' | getMonthName(12) → 'December'
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1] ?? 'Unknown';
  // month - 1 because arrays are 0-indexed (January = index 0)
  // but month numbers are 1-indexed (January = 1).
  // ?? 'Unknown' = use 'Unknown' if month is out of range.
}

// ── calculatePercentage() ─────────────────────────────────────
// Calculates what percent 'part' is of 'total'.
// calculatePercentage(750, 1000) → 75 (75%)
// Used for budget progress bars.
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0; // Prevent division by zero
  return Math.min(Math.round((part / total) * 100), 100);
  // Math.round() removes decimal places: 73.6 → 74
  // Math.min(..., 100) caps at 100% — bar can't exceed 100%
}

// ── getCurrentMonthYear() ─────────────────────────────────────
// Returns: { month: 1, year: 2025 } for January 2025
// Used as the default filter for transactions and budgets pages.
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // getMonth() is 0-11, we want 1-12
    year: now.getFullYear(),   // getFullYear() is already 4-digit (2025)
  };
}
