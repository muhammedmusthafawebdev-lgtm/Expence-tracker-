/**
 * Supabase Database Schema TypeScript Definition
 *
 * All financial amounts stored as integer paise (1 INR = 100 paise) to prevent floating-point errors.
 * Strict typing across all public tables, inserts, updates, and JSON structures.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string; // auth.users.id
          name: string;
          email: string;
          currency: string;
          monthly_allowance_paise: number;
          student_type: string | null;
          institution: string | null;
          roll_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email: string;
          currency?: string;
          monthly_allowance_paise?: number;
          student_type?: string | null;
          institution?: string | null;
          roll_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>;
      };
      user_preferences: {
        Row: {
          user_id: string;
          theme: string;
          widgets: Json;
          widget_config: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: string;
          widgets?: Json;
          widget_config?: Json;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_preferences']['Row']>;
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'income' | 'expense' | 'both';
          icon: string;
          color: string;
          is_custom: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'income' | 'expense' | 'both';
          icon?: string;
          color?: string;
          is_custom?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense';
          amount_paise: number;
          category_id: string | null;
          date: string; // YYYY-MM-DD
          payment_method: string | null;
          description: string | null;
          is_recurring: boolean;
          debt_type: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'income' | 'expense';
          amount_paise: number;
          category_id?: string | null;
          date: string;
          payment_method?: string | null;
          description?: string | null;
          is_recurring?: boolean;
          debt_type?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Row']>;
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          limit_paise: number;
          period: 'monthly' | 'yearly';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          limit_paise: number;
          period: 'monthly' | 'yearly';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['budgets']['Row']>;
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target_amount_paise: number;
          current_amount_paise: number;
          target_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          target_amount_paise: number;
          current_amount_paise?: number;
          target_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['savings_goals']['Row']>;
      };
      savings_allocations: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          amount_paise: number;
          date: string;
          type: 'deposit' | 'withdrawal';
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          amount_paise: number;
          date: string;
          type: 'deposit' | 'withdrawal';
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['savings_allocations']['Row']>;
      };
      debts: {
        Row: {
          id: string;
          user_id: string;
          person_name: string;
          phone_number: string | null;
          principal_amount_paise: number;
          lent_date: string;
          expected_repayment_date: string | null;
          description: string | null;
          status: 'active' | 'partially_repaid' | 'overdue' | 'settled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          person_name: string;
          phone_number?: string | null;
          principal_amount_paise: number;
          lent_date: string;
          expected_repayment_date?: string | null;
          description?: string | null;
          status?: 'active' | 'partially_repaid' | 'overdue' | 'settled';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['debts']['Row']>;
      };
      debt_repayments: {
        Row: {
          id: string;
          debt_id: string;
          user_id: string;
          amount_paise: number;
          repayment_date: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          debt_id: string;
          user_id: string;
          amount_paise: number;
          repayment_date: string;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['debt_repayments']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
