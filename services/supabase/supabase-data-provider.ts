import {
  Transaction,
  Budget,
  SavingsGoal,
  Category,
  UserProfile,
} from '@/types';
import { IDataProvider, TransactionFilters } from '@/services/data-provider';
import { getSupabase } from './client';
import { Database } from './types';
import { INITIAL_STUDENT_CATEGORIES } from '@/constants/categories';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type BudgetRow = Database['public']['Tables']['budgets']['Row'];
type SavingsGoalRow = Database['public']['Tables']['savings_goals']['Row'];
type SavingsAllocRow = Database['public']['Tables']['savings_allocations']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];

export class SupabaseDataProvider implements IDataProvider {
  public readonly isBackendConnected = true;
  private _isSchemaReady: boolean = true;
  private _notifiedSchemaMissing: boolean = false;

  public get isSchemaReady(): boolean {
    return this._isSchemaReady;
  }

  private isSchemaCacheError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const err = error as { code?: string; message?: string };
    const code = err.code || '';
    const message = (err.message || '').toLowerCase();
    return (
      code === 'PGRST205' ||
      code === '42P01' ||
      message.includes('schema cache') ||
      message.includes('relation') && message.includes('does not exist')
    );
  }

  private handleSchemaCacheNotice(tableName: string) {
    this._isSchemaReady = false;
    if (!this._notifiedSchemaMissing) {
      this._notifiedSchemaMissing = true;
      if (typeof window !== 'undefined') {
        console.info(
          `[Supabase] Table "${tableName}" not found in schema cache (PGRST205). ` +
          `Falling back to local session store. Run "supabase/migrations/20261103000000_initial_schema.sql" ` +
          `in your Supabase SQL Editor to enable cloud persistence.`
        );
      }
    }
  }

  private async getUserId(): Promise<string> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase is not configured');
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('User is not authenticated');
    return user.id;
  }

  // =========================================================================
  // TRANSACTIONS
  // =========================================================================
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return [];

    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters?.minAmountPaise !== undefined) {
        query = query.gte('amount_paise', filters.minAmountPaise);
      }
      if (filters?.maxAmountPaise !== undefined) {
        query = query.lte('amount_paise', filters.maxAmountPaise);
      }

      const { data, error } = await query;
      if (error) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('transactions');
        } else {
          console.warn('Unable to load Supabase transactions:', error.message);
        }
        return [];
      }

      const rows = (data || []) as unknown as TransactionRow[];
      let items: Transaction[] = rows.map((row) => ({
        id: row.id,
        type: row.type,
        amountPaise: Number(row.amount_paise),
        categoryId: row.category_id || '',
        date: row.date,
        paymentMethod: (row.payment_method as Transaction['paymentMethod']) || undefined,
        description: row.description || '',
        isRecurring: row.is_recurring,
        debtType: (row.debt_type as Transaction['debtType']) || undefined,
        createdAt: row.created_at,
        deletedAt: row.deleted_at,
      }));

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (t) =>
            (t.description && t.description.toLowerCase().includes(q)) ||
            t.paymentMethod?.toLowerCase().includes(q)
        );
      }

      return items;
    } catch {
      return [];
    }
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>) {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) {
      return {
        success: false,
        persisted: false,
        warningMessage: 'Supabase database tables are not provisioned yet.',
      };
    }

    try {
      const userId = await this.getUserId();
      const insertPayload = {
        user_id: userId,
        type: data.type,
        amount_paise: Math.round(data.amountPaise),
        category_id: data.categoryId || null,
        date: data.date,
        payment_method: data.paymentMethod || null,
        description: data.description || null,
        is_recurring: data.isRecurring || false,
        debt_type: data.debtType || null,
      };

      const { data: inserted, error } = await supabase
        .from('transactions')
        .insert(insertPayload as any)
        .select()
        .single();

      if (error) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('transactions');
        }
        throw error;
      }

      const row = inserted as unknown as TransactionRow;

      const newTx: Transaction = {
        id: row.id,
        type: row.type,
        amountPaise: Number(row.amount_paise),
        categoryId: row.category_id || '',
        date: row.date,
        paymentMethod: (row.payment_method as Transaction['paymentMethod']) || undefined,
        description: row.description || '',
        isRecurring: row.is_recurring,
        debtType: (row.debt_type as Transaction['debtType']) || undefined,
        createdAt: row.created_at,
        deletedAt: row.deleted_at,
      };

      return {
        success: true,
        persisted: true,
        item: newTx,
        warningMessage: '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save transaction';
      return {
        success: false,
        persisted: false,
        warningMessage: msg,
      };
    }
  }

  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) {
      return {
        success: false,
        persisted: false,
        warningMessage: 'Supabase database tables are not provisioned yet.',
      };
    }

    try {
      const updatePayload: Record<string, unknown> = {};
      if (data.type !== undefined) updatePayload.type = data.type;
      if (data.amountPaise !== undefined) updatePayload.amount_paise = Math.round(data.amountPaise);
      if (data.categoryId !== undefined) updatePayload.category_id = data.categoryId || null;
      if (data.date !== undefined) updatePayload.date = data.date;
      if (data.paymentMethod !== undefined) updatePayload.payment_method = data.paymentMethod || null;
      if (data.description !== undefined) updatePayload.description = data.description || null;
      if (data.isRecurring !== undefined) updatePayload.is_recurring = data.isRecurring;
      if (data.debtType !== undefined) updatePayload.debt_type = data.debtType || null;

      const { data: updated, error } = await supabase
        .from('transactions')
        .update(updatePayload as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('transactions');
        }
        throw error;
      }

      const row = updated as unknown as TransactionRow;
      const tx: Transaction = {
        id: row.id,
        type: row.type,
        amountPaise: Number(row.amount_paise),
        categoryId: row.category_id || '',
        date: row.date,
        paymentMethod: (row.payment_method as Transaction['paymentMethod']) || undefined,
        description: row.description || '',
        isRecurring: row.is_recurring,
        debtType: (row.debt_type as Transaction['debtType']) || undefined,
        createdAt: row.created_at,
        deletedAt: row.deleted_at,
      };

      return {
        success: true,
        persisted: true,
        item: tx,
        warningMessage: '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update transaction';
      return {
        success: false,
        persisted: false,
        warningMessage: msg,
      };
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return false;
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  async restoreTransaction(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return false;
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ deleted_at: null })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  async permanentlyDeleteTransaction(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return false;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  async emptyTrash(): Promise<number> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return 0;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .not('deleted_at', 'is', null)
        .select('id');
      if (error) return 0;
      return (data || []).length;
    } catch {
      return 0;
    }
  }

  async getRecentlyDeleted(): Promise<Transaction[]> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return [];
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('transactions');
        }
        return [];
      }

      const rows = (data || []) as unknown as TransactionRow[];
      return rows.map((row) => ({
        id: row.id,
        type: row.type,
        amountPaise: Number(row.amount_paise),
        categoryId: row.category_id || '',
        date: row.date,
        paymentMethod: (row.payment_method as Transaction['paymentMethod']) || undefined,
        description: row.description || '',
        isRecurring: row.is_recurring,
        debtType: (row.debt_type as Transaction['debtType']) || undefined,
        createdAt: row.created_at,
        deletedAt: row.deleted_at,
      }));
    } catch {
      return [];
    }
  }

  // =========================================================================
  // BUDGETS
  // =========================================================================
  async getBudgets(): Promise<Budget[]> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return [];

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('budgets');
        } else {
          console.warn('Unable to load Supabase budgets:', error.message);
        }
        return [];
      }

      const rows = (data || []) as unknown as BudgetRow[];
      return rows.map((row) => ({
        id: row.id,
        categoryId: row.category_id,
        limitPaise: Number(row.limit_paise),
        period: row.period,
        createdAt: row.created_at,
      }));
    } catch {
      return [];
    }
  }

  async createBudget(data: Omit<Budget, 'id' | 'createdAt'>) {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) {
      return {
        success: false,
        persisted: false,
        warningMessage: 'Supabase database tables are not provisioned yet.',
      };
    }

    try {
      const userId = await this.getUserId();
      const { data: upserted, error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: userId,
            category_id: data.categoryId,
            limit_paise: Math.round(data.limitPaise),
            period: data.period,
          },
          { onConflict: 'user_id,category_id,period' }
        )
        .select()
        .single();

      if (error) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('budgets');
        }
        throw error;
      }

      const row = upserted as unknown as BudgetRow;

      const budget: Budget = {
        id: row.id,
        categoryId: row.category_id,
        limitPaise: Number(row.limit_paise),
        period: row.period,
        createdAt: row.created_at,
      };

      return {
        success: true,
        persisted: true,
        item: budget,
        warningMessage: '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save budget';
      return {
        success: false,
        persisted: false,
        warningMessage: msg,
      };
    }
  }

  async deleteBudget(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return false;
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // SAVINGS
  // =========================================================================
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return [];

    try {
      const { data: goals, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (goalsError) {
        if (this.isSchemaCacheError(goalsError)) {
          this.handleSchemaCacheNotice('savings_goals');
        }
        return [];
      }

      const { data: allocations, error: allocError } = await supabase
        .from('savings_allocations')
        .select('*')
        .order('date', { ascending: false });

      if (allocError && this.isSchemaCacheError(allocError)) {
        this.handleSchemaCacheNotice('savings_allocations');
      }

      const allocRows = (allocError ? [] : allocations || []) as unknown as SavingsAllocRow[];
      const goalRows = (goals || []) as unknown as SavingsGoalRow[];

      return goalRows.map((goal) => {
        const goalAllocs = allocRows
          .filter((a) => a.goal_id === goal.id)
          .map((a) => ({
            id: a.id,
            amountPaise: Number(a.amount_paise),
            date: a.date,
            type: a.type,
            note: a.note || undefined,
          }));

        return {
          id: goal.id,
          title: goal.title,
          targetAmountPaise: Number(goal.target_amount_paise),
          currentAmountPaise: Number(goal.current_amount_paise),
          targetDate: goal.target_date,
          notes: goal.notes || undefined,
          createdAt: goal.created_at,
          allocations: goalAllocs,
        };
      });
    } catch {
      return [];
    }
  }

  async createSavingsGoal(
    data: Omit<SavingsGoal, 'id' | 'createdAt' | 'allocations' | 'currentAmountPaise'>
  ) {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) {
      return {
        success: false,
        persisted: false,
        warningMessage: 'Supabase database tables are not provisioned yet.',
      };
    }

    try {
      const userId = await this.getUserId();
      const { data: inserted, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: userId,
          title: data.title,
          target_amount_paise: Math.round(data.targetAmountPaise),
          current_amount_paise: 0,
          target_date: data.targetDate,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('savings_goals');
        }
        throw error;
      }

      const row = inserted as unknown as SavingsGoalRow;

      const newGoal: SavingsGoal = {
        id: row.id,
        title: row.title,
        targetAmountPaise: Number(row.target_amount_paise),
        currentAmountPaise: 0,
        targetDate: row.target_date,
        notes: row.notes || undefined,
        createdAt: row.created_at,
        allocations: [],
      };

      return {
        success: true,
        persisted: true,
        item: newGoal,
        warningMessage: '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create savings goal';
      return {
        success: false,
        persisted: false,
        warningMessage: msg,
      };
    }
  }

  async addSavingsAllocation(
    goalId: string,
    amountPaise: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ) {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) {
      return {
        success: false,
        persisted: false,
        warningMessage: 'Supabase database tables are not provisioned yet.',
      };
    }

    try {
      const userId = await this.getUserId();
      const { data: goal, error: goalErr } = await supabase
        .from('savings_goals')
        .select('current_amount_paise')
        .eq('id', goalId)
        .single();

      if (goalErr || !goal) throw new Error('Goal not found');

      const current = Number(goal.current_amount_paise);
      const roundedAmount = Math.round(amountPaise);
      const newCurrent =
        type === 'deposit'
          ? current + roundedAmount
          : Math.max(0, current - roundedAmount);

      const { error: allocErr } = await supabase.from('savings_allocations').insert({
        user_id: userId,
        goal_id: goalId,
        amount_paise: roundedAmount,
        date: new Date().toISOString().split('T')[0],
        type,
        note: note || null,
      });
      if (allocErr) throw allocErr;

      const { error: updateErr } = await supabase
        .from('savings_goals')
        .update({ current_amount_paise: newCurrent })
        .eq('id', goalId);
      if (updateErr) throw updateErr;

      return {
        success: true,
        persisted: true,
        warningMessage: '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record allocation';
      return {
        success: false,
        persisted: false,
        warningMessage: msg,
      };
    }
  }

  async deleteSavingsGoal(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return false;
    try {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // CATEGORIES
  // =========================================================================
  async getCategories(): Promise<Category[]> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return [...INITIAL_STUDENT_CATEGORIES];

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('categories');
        }
        return [...INITIAL_STUDENT_CATEGORIES];
      }

      if (!data || data.length === 0) {
        return [...INITIAL_STUDENT_CATEGORIES];
      }

      const rows = data as unknown as CategoryRow[];
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        icon: row.icon,
        color: row.color,
        isCustom: row.is_custom,
      }));
    } catch {
      return [...INITIAL_STUDENT_CATEGORIES];
    }
  }

  async addCustomCategory(data: Omit<Category, 'id' | 'isCustom'>): Promise<Category> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client is not configured.');

    const userId = await this.getUserId();
    const trimmedName = data.name.trim();

    const { data: inserted, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: trimmedName,
        type: data.type,
        icon: data.icon || 'Tag',
        color: data.color || '#64748B',
        is_custom: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`A ${data.type} category named "${trimmedName}" already exists.`);
      }
      throw new Error(error.message);
    }

    const row = inserted as unknown as CategoryRow;
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      icon: row.icon,
      color: row.color,
      isCustom: row.is_custom,
    };
  }

  async updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client is not configured.');

    const updatePayload: Record<string, unknown> = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.icon !== undefined) updatePayload.icon = data.icon;
    if (data.color !== undefined) updatePayload.color = data.color;

    const { data: updated, error } = await supabase
      .from('categories')
      .update(updatePayload as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`A category with this name and type already exists.`);
      }
      throw new Error(error.message);
    }

    const row = updated as unknown as CategoryRow;
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      icon: row.icon,
      color: row.color,
      isCustom: row.is_custom,
    };
  }

  async deleteCategory(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // USER PROFILE
  // =========================================================================
  async getUserProfile(): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      name: '',
      email: '',
      studentType: 'College Undergraduate',
      institution: '',
      rollNumber: '',
      monthlyAllowancePaise: 0,
      currency: 'INR',
    };

    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return defaultProfile;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return defaultProfile;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('user_profiles');
        }
        return {
          ...defaultProfile,
          email: user.email || '',
          name: (user.user_metadata?.full_name || user.user_metadata?.name || '') as string,
        };
      }

      const row = data as unknown as UserProfileRow;
      return {
        name: row.name || '',
        email: row.email || user.email || '',
        studentType: row.student_type || 'College Undergraduate',
        institution: row.institution || '',
        rollNumber: row.roll_number || '',
        monthlyAllowancePaise: Number(row.monthly_allowance_paise || 0),
        currency: (row.currency as 'INR') || 'INR',
      };
    } catch {
      return defaultProfile;
    }
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase is not configured');

    const userId = await this.getUserId();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.studentType !== undefined) updatePayload.student_type = data.studentType;
    if (data.institution !== undefined) updatePayload.institution = data.institution;
    if (data.rollNumber !== undefined) updatePayload.roll_number = data.rollNumber;
    if (data.monthlyAllowancePaise !== undefined) {
      updatePayload.monthly_allowance_paise = Math.round(data.monthlyAllowancePaise);
    }
    if (data.currency !== undefined) updatePayload.currency = data.currency;

    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update(updatePayload as any)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const row = updated as unknown as UserProfileRow;
    return {
      name: row.name || '',
      email: row.email,
      studentType: row.student_type || '',
      institution: row.institution || '',
      rollNumber: row.roll_number || '',
      monthlyAllowancePaise: Number(row.monthly_allowance_paise || 0),
      currency: (row.currency as 'INR') || 'INR',
    };
  }
}
