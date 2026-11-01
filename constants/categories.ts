import { Category } from '@/types';

export const INITIAL_STUDENT_CATEGORIES: Category[] = [
  // ==========================================
  // EXPENSE CATEGORIES
  // ==========================================

  // 1. Shopping
  {
    id: 'cat_clothes',
    name: 'Clothes & Fashion',
    type: 'expense',
    icon: 'Shirt',
    color: '#EC4899', // Pink
    studentGroup: 'college',
    groupName: 'Shopping',
  },
  {
    id: 'cat_electronics',
    name: 'Electronics',
    type: 'expense',
    icon: 'Laptop',
    color: '#8B5CF6', // Purple
    studentGroup: 'college',
    groupName: 'Shopping',
  },
  {
    id: 'cat_personal_care',
    name: 'Personal Care',
    type: 'expense',
    icon: 'Sparkles',
    color: '#F43F5E', // Rose
    studentGroup: 'college',
    groupName: 'Shopping',
  },
  {
    id: 'cat_accessories',
    name: 'Accessories',
    type: 'expense',
    icon: 'Watch',
    color: '#D946EF', // Fuchsia
    studentGroup: 'college',
    groupName: 'Shopping',
  },

  // 2. EMI & Loans
  {
    id: 'cat_loan_emi',
    name: 'Loan EMI',
    type: 'expense',
    icon: 'Landmark',
    color: '#DC2626', // Red
    studentGroup: 'college',
    groupName: 'EMI & Loans',
  },
  {
    id: 'cat_cc_emi',
    name: 'Credit Card EMI',
    type: 'expense',
    icon: 'CreditCard',
    color: '#E11D48', // Crimson
    studentGroup: 'college',
    groupName: 'EMI & Loans',
  },
  {
    id: 'cat_interest_charges',
    name: 'Interest & Charges',
    type: 'expense',
    icon: 'Percent',
    color: '#B91C1C', // Dark Red
    studentGroup: 'college',
    groupName: 'EMI & Loans',
  },

  // 3. Travel & Tours
  {
    id: 'cat_travel_tickets',
    name: 'Travel Tickets',
    type: 'expense',
    icon: 'Plane',
    color: '#0284C7', // Sky Blue
    studentGroup: 'college',
    groupName: 'Travel & Tours',
  },
  {
    id: 'cat_hotels',
    name: 'Hotels & Accommodation',
    type: 'expense',
    icon: 'Hotel',
    color: '#0D9488', // Teal
    studentGroup: 'college',
    groupName: 'Travel & Tours',
  },
  {
    id: 'cat_vacation',
    name: 'Vacation & Trips',
    type: 'expense',
    icon: 'Palmtree',
    color: '#14B8A6', // Aqua
    studentGroup: 'college',
    groupName: 'Travel & Tours',
  },

  // 4. Parents & Family
  {
    id: 'cat_parents_expenses',
    name: 'Parents’ Expenses',
    type: 'expense',
    icon: 'Heart',
    color: '#E11D48', // Rose
    studentGroup: 'college',
    groupName: 'Parents & Family',
  },
  {
    id: 'cat_family_support',
    name: 'Family Support',
    type: 'expense',
    icon: 'Users',
    color: '#DB2777', // Deep Pink
    studentGroup: 'college',
    groupName: 'Parents & Family',
  },
  {
    id: 'cat_family_gifts',
    name: 'Gifts for Family',
    type: 'expense',
    icon: 'Gift',
    color: '#C026D3', // Magenta
    studentGroup: 'college',
    groupName: 'Parents & Family',
  },

  // 5. Education & Fees
  {
    id: 'cat_tuition',
    name: 'College Fees',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#2563EB', // Blue
    studentGroup: 'college',
    groupName: 'Education & Fees',
  },
  {
    id: 'cat_coaching',
    name: 'Tuition & Coaching',
    type: 'expense',
    icon: 'Target',
    color: '#3B82F6', // Cobalt
    studentGroup: 'exam',
    groupName: 'Education & Fees',
  },
  {
    id: 'cat_exam_fees',
    name: 'Exam Fees',
    type: 'expense',
    icon: 'FileText',
    color: '#6366F1', // Indigo
    studentGroup: 'exam',
    groupName: 'Education & Fees',
  },
  {
    id: 'cat_books',
    name: 'Books & Stationery',
    type: 'expense',
    icon: 'BookOpen',
    color: '#10B981', // Emerald
    studentGroup: 'college',
    groupName: 'Education & Fees',
  },
  {
    id: 'cat_printing',
    name: 'Printing & Lab Manuals',
    type: 'expense',
    icon: 'Printer',
    color: '#8B5CF6', // Purple
    studentGroup: 'college',
    groupName: 'Education & Fees',
  },

  // 6. Mobile & Recharge
  {
    id: 'cat_mobile_recharge',
    name: 'Mobile Recharge',
    type: 'expense',
    icon: 'Smartphone',
    color: '#0EA5E9', // Sky
    studentGroup: 'college',
    groupName: 'Mobile & Recharge',
  },
  {
    id: 'cat_tech',
    name: 'Internet & Data Plans',
    type: 'expense',
    icon: 'Wifi',
    color: '#38BDF8', // Cyan
    studentGroup: 'college',
    groupName: 'Mobile & Recharge',
  },

  // 7. Food & Dining
  {
    id: 'cat_mess',
    name: 'Mess & Canteen',
    type: 'expense',
    icon: 'Utensils',
    color: '#F59E0B', // Amber
    studentGroup: 'college',
    groupName: 'Food & Dining',
  },
  {
    id: 'cat_restaurants',
    name: 'Restaurants',
    type: 'expense',
    icon: 'Store',
    color: '#D97706', // Orange
    studentGroup: 'college',
    groupName: 'Food & Dining',
  },
  {
    id: 'cat_social',
    name: 'Snacks & Beverages',
    type: 'expense',
    icon: 'Coffee',
    color: '#F97316', // Tangerine
    studentGroup: 'college',
    groupName: 'Food & Dining',
  },
  {
    id: 'cat_groceries',
    name: 'Groceries',
    type: 'expense',
    icon: 'ShoppingBasket',
    color: '#84CC16', // Lime Green
    studentGroup: 'college',
    groupName: 'Food & Dining',
  },

  // 8. Accommodation
  {
    id: 'cat_hostel',
    name: 'Hostel & PG Rent',
    type: 'expense',
    icon: 'Home',
    color: '#6366F1', // Indigo
    studentGroup: 'hostel',
    groupName: 'Accommodation',
  },
  {
    id: 'cat_house_rent',
    name: 'House Rent',
    type: 'expense',
    icon: 'Building',
    color: '#4F46E5', // Deep Indigo
    studentGroup: 'college',
    groupName: 'Accommodation',
  },

  // 9. Transportation
  {
    id: 'cat_transit',
    name: 'Metro & Bus Pass',
    type: 'expense',
    icon: 'Bus',
    color: '#06B6D4', // Cyan
    studentGroup: 'college',
    groupName: 'Transportation',
  },
  {
    id: 'cat_auto_taxi',
    name: 'Auto & Taxi',
    type: 'expense',
    icon: 'Car',
    color: '#0891B2', // Teal
    studentGroup: 'college',
    groupName: 'Transportation',
  },
  {
    id: 'cat_fuel',
    name: 'Fuel',
    type: 'expense',
    icon: 'Fuel',
    color: '#EAB308', // Yellow
    studentGroup: 'college',
    groupName: 'Transportation',
  },
  {
    id: 'cat_other_transport',
    name: 'Other Transport',
    type: 'expense',
    icon: 'Navigation',
    color: '#64748B', // Slate
    studentGroup: 'college',
    groupName: 'Transportation',
  },

  // 10. Bills & Utilities
  {
    id: 'cat_electricity',
    name: 'Electricity',
    type: 'expense',
    icon: 'Zap',
    color: '#F59E0B', // Amber
    studentGroup: 'college',
    groupName: 'Bills & Utilities',
  },
  {
    id: 'cat_water',
    name: 'Water',
    type: 'expense',
    icon: 'Droplets',
    color: '#0284C7', // Sky
    studentGroup: 'college',
    groupName: 'Bills & Utilities',
  },
  {
    id: 'cat_utilities_internet',
    name: 'Internet',
    type: 'expense',
    icon: 'Wifi',
    color: '#2563EB', // Blue
    studentGroup: 'college',
    groupName: 'Bills & Utilities',
  },
  {
    id: 'cat_subscriptions',
    name: 'Subscriptions',
    type: 'expense',
    icon: 'Tv',
    color: '#9333EA', // Purple
    studentGroup: 'college',
    groupName: 'Bills & Utilities',
  },

  // 11. Health & Medical
  {
    id: 'cat_medicines',
    name: 'Medicines',
    type: 'expense',
    icon: 'Pill',
    color: '#10B981', // Emerald
    studentGroup: 'college',
    groupName: 'Health & Medical',
  },
  {
    id: 'cat_doctor_hospital',
    name: 'Doctor & Hospital',
    type: 'expense',
    icon: 'Stethoscope',
    color: '#059669', // Deep Emerald
    studentGroup: 'college',
    groupName: 'Health & Medical',
  },
  {
    id: 'cat_health_insurance',
    name: 'Health Insurance',
    type: 'expense',
    icon: 'ShieldCheck',
    color: '#047857', // Forest Green
    studentGroup: 'college',
    groupName: 'Health & Medical',
  },

  // 12. Entertainment
  {
    id: 'cat_movies',
    name: 'Movies',
    type: 'expense',
    icon: 'Film',
    color: '#F43F5E', // Rose
    studentGroup: 'college',
    groupName: 'Entertainment',
  },
  {
    id: 'cat_games',
    name: 'Games',
    type: 'expense',
    icon: 'Gamepad2',
    color: '#8B5CF6', // Violet
    studentGroup: 'college',
    groupName: 'Entertainment',
  },
  {
    id: 'cat_events_outings',
    name: 'Events & Outings',
    type: 'expense',
    icon: 'Ticket',
    color: '#EC4899', // Pink
    studentGroup: 'college',
    groupName: 'Entertainment',
  },

  // 13. Other Expenses
  {
    id: 'cat_misc_expense',
    name: 'Miscellaneous',
    type: 'expense',
    icon: 'Tag',
    color: '#64748B', // Slate
    studentGroup: 'college',
    groupName: 'Other Expenses',
  },

  // ==========================================
  // INCOME CATEGORIES
  // ==========================================
  {
    id: 'cat_salary',
    name: 'Salary',
    type: 'income',
    icon: 'Banknote',
    color: '#16A34A', // Green
    studentGroup: 'college',
    groupName: 'Income',
  },
  {
    id: 'cat_freelance',
    name: 'Freelance / Business',
    type: 'income',
    icon: 'Briefcase',
    color: '#2563EB', // Blue
    studentGroup: 'college',
    groupName: 'Income',
  },
  {
    id: 'cat_scholarship',
    name: 'Scholarship',
    type: 'income',
    icon: 'Award',
    color: '#059669', // Emerald
    studentGroup: 'college',
    groupName: 'Income',
  },
  {
    id: 'cat_pocket_money',
    name: 'Pocket Money',
    type: 'income',
    icon: 'Wallet',
    color: '#10B981', // Teal
    studentGroup: 'college',
    groupName: 'Income',
  },
  {
    id: 'cat_gift_received',
    name: 'Gift Received',
    type: 'income',
    icon: 'Gift',
    color: '#7C3AED', // Purple
    studentGroup: 'college',
    groupName: 'Income',
  },
  {
    id: 'cat_refund',
    name: 'Refund',
    type: 'income',
    icon: 'RotateCcw',
    color: '#0D9488', // Teal
    studentGroup: 'college',
    groupName: 'Income',
  },
  {
    id: 'cat_investments',
    name: 'Investment Returns',
    type: 'income',
    icon: 'TrendingUp',
    color: '#059669', // Green
    studentGroup: 'college',
    groupName: 'Income',
  },
  {
    id: 'cat_misc_income',
    name: 'Other Income',
    type: 'income',
    icon: 'CircleDollarSign',
    color: '#6366F1', // Indigo
    studentGroup: 'college',
    groupName: 'Income',
  },
];

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Net Banking',
  'Debit Card',
  'Credit Card',
  'Other',
] as const;
