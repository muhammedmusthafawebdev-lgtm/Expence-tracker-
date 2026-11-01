/**
 * Supabase Database Schema Definition
 * Prepared for clean future Supabase PostgreSQL integration.
 * All financial amounts stored as integer paise (1 INR = 100 paise) to prevent floating-point errors.
 */

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense';
          amount_paise: number;
          category_id: string;
          date: string; // YYYY-MM-DD
          payment_method: string | null;
          description: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Row']>;
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
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
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
        Insert: Omit<Database['public']['Tables']['budgets']['Row'], 'created_at'> & {
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
        Insert: Omit<Database['public']['Tables']['savings_goals']['Row'], 'created_at'> & {
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
        Insert: Omit<Database['public']['Tables']['savings_allocations']['Row'], 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['savings_allocations']['Row']>;
      };
      user_profiles: {
        Row: {
          id: string; // user_id
          name: string;
          email: string;
          currency: string;
          monthly_allowance_paise: number;
          student_type: string | null;
          institution: string | null;
          roll_number: string | null;
          updated_at: string;
        };
        Insert: Database['public']['Tables']['user_profiles']['Row'];
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>;
      };
    };
  };
}
