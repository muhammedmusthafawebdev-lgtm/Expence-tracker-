import { Category } from '@/types';

// Strict requirement: Do NOT show hardcoded predefined Shopping, Food, EMI, Travel, Parents, or other default categories in initial state.
// First-time users see the requested empty state to create categories that match how they manage money.
export const INITIAL_STUDENT_CATEGORIES: Category[] = [];

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Net Banking',
  'Debit Card',
  'Credit Card',
  'Other',
] as const;
