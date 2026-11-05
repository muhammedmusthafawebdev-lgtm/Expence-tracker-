import {
  Transaction,
  Budget,
  SavingsGoal,
  Category,
  UserProfile,
  Debt,
  DebtRepayment,
  DebtStatus,
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
type DebtRow = Database['public']['Tables']['debts']['Row'];
type DebtRepaymentRow = Database['public']['Tables']['debt_repayments']['Row'];

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

  // =========================================================================
  // DEBTS & REPAYMENTS (ASSET RECEIVABLES)
  // Strictly independent from ordinary expense/income analytics
  // =========================================================================
  async getDebts(): Promise<Debt[]> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return [];

    try {
      const userId = await this.getUserId();
      const { data: debtRows, error: debtsErr } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('lent_date', { ascending: false });

      if (debtsErr) {
        if (this.isSchemaCacheError(debtsErr)) {
          this.handleSchemaCacheNotice('debts');
        } else {
          console.warn('Unable to load Supabase debts:', debtsErr.message);
        }
        return [];
      }

      const { data: repRows, error: repErr } = await supabase
        .from('debt_repayments')
        .select('*')
        .eq('user_id', userId)
        .order('repayment_date', { ascending: false });

      if (repErr && this.isSchemaCacheError(repErr)) {
        this.handleSchemaCacheNotice('debt_repayments');
      }

      const debtsList = (debtRows || []) as unknown as DebtRow[];
      const repaymentsList = (repRows || []) as unknown as DebtRepaymentRow[];
      const todayStr = new Date().toISOString().split('T')[0];

      return debtsList.map((d) => {
        const debtRepayments: DebtRepayment[] = repaymentsList
          .filter((r) => r.debt_id === d.id)
          .map((r) => ({
            id: r.id,
            debtId: r.debt_id,
            amountPaise: Number(r.amount_paise),
            repaymentDate: r.repayment_date,
            note: r.note || undefined,
            createdAt: r.created_at,
          }));

        const principalPaise = Number(d.principal_amount_paise);
        const totalRepaidPaise = debtRepayments.reduce((sum, r) => sum + r.amountPaise, 0);
        const outstandingBalancePaise = Math.max(0, principalPaise - totalRepaidPaise);

        let dynamicStatus: DebtStatus = d.status;
        if (outstandingBalancePaise === 0) {
          dynamicStatus = 'settled';
        } else if (d.expected_repayment_date && d.expected_repayment_date < todayStr) {
          dynamicStatus = 'overdue';
        } else if (totalRepaidPaise > 0) {
          dynamicStatus = 'partially_repaid';
        } else {
          dynamicStatus = 'active';
        }

        return {
          id: d.id,
          personName: d.person_name,
          phoneNumber: d.phone_number || undefined,
          principalAmountPaise: principalPaise,
          lentDate: d.lent_date,
          expectedRepaymentDate: d.expected_repayment_date || undefined,
          description: d.description || undefined,
          status: dynamicStatus,
          repayments: debtRepayments,
          totalRepaidPaise,
          outstandingBalancePaise,
          outstandingPaise: outstandingBalancePaise,
          phone: d.phone_number || undefined,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        };
      });
    } catch {
      return [];
    }
  }

  async createDebt(data: {
    personName: string;
    phoneNumber?: string;
    principalAmountPaise: number;
    lentDate: string;
    expectedRepaymentDate?: string;
    description?: string;
  }) {
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
      const principal = Math.round(data.principalAmountPaise);
      if (principal <= 0) {
        return {
          success: false,
          persisted: false,
          warningMessage: 'Principal amount must be greater than zero.',
        };
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const status: DebtStatus =
        data.expectedRepaymentDate && data.expectedRepaymentDate < todayStr ? 'overdue' : 'active';

      const insertPayload = {
        user_id: userId,
        person_name: data.personName.trim(),
        phone_number: data.phoneNumber?.trim() || null,
        principal_amount_paise: principal,
        lent_date: data.lentDate,
        expected_repayment_date: data.expectedRepaymentDate || null,
        description: data.description?.trim() || null,
        status,
      };

      const { data: inserted, error } = await supabase
        .from('debts')
        .insert(insertPayload as any)
        .select()
        .single();

      if (error) {
        if (this.isSchemaCacheError(error)) {
          this.handleSchemaCacheNotice('debts');
        }
        throw error;
      }

      const row = inserted as unknown as DebtRow;
      const newDebt: Debt = {
        id: row.id,
        personName: row.person_name,
        phoneNumber: row.phone_number || undefined,
        principalAmountPaise: Number(row.principal_amount_paise),
        lentDate: row.lent_date,
        expectedRepaymentDate: row.expected_repayment_date || undefined,
        description: row.description || undefined,
        status: row.status,
        repayments: [],
        totalRepaidPaise: 0,
        outstandingBalancePaise: Number(row.principal_amount_paise),
        outstandingPaise: Number(row.principal_amount_paise),
        phone: row.phone_number || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      return {
        success: true,
        persisted: true,
        item: newDebt,
        warningMessage: '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save debt record';
      return {
        success: false,
        persisted: false,
        warningMessage: msg,
      };
    }
  }

  async updateDebt(
    id: string,
    data: Partial<{
      personName: string;
      phoneNumber: string;
      phone: string;
      principalAmountPaise: number;
      lentDate: string;
      expectedRepaymentDate: string;
      description: string;
    }>
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

      // Retrieve existing debt and repayments to validate updates
      const { data: existing, error: fetchErr } = await supabase
        .from('debts')
        .select('*, debt_repayments(*)')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchErr || !existing) throw new Error('Debt record not found');

      const repayments = ((existing as any).debt_repayments || []) as DebtRepaymentRow[];
      const totalRepaid = repayments.reduce((sum, r) => sum + Number(r.amount_paise), 0);

      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      let principal = Number(existing.principal_amount_paise);
      if (data.principalAmountPaise !== undefined) {
        principal = Math.round(data.principalAmountPaise);
        if (principal < totalRepaid) {
          return {
            success: false,
            persisted: false,
            warningMessage: `Principal amount cannot be lower than existing repayments of ₹${(totalRepaid / 100).toFixed(2)}.`,
          };
        }
        updatePayload.principal_amount_paise = principal;
      }

      if (data.personName !== undefined) updatePayload.person_name = data.personName.trim();
      if (data.phoneNumber !== undefined) updatePayload.phone_number = data.phoneNumber.trim() || null;
      if (data.lentDate !== undefined) updatePayload.lent_date = data.lentDate;
      if (data.expectedRepaymentDate !== undefined) {
        updatePayload.expected_repayment_date = data.expectedRepaymentDate || null;
      }
      if (data.description !== undefined) updatePayload.description = data.description.trim() || null;

      // Recalculate status
      const expectedDate =
        data.expectedRepaymentDate !== undefined
          ? data.expectedRepaymentDate
          : existing.expected_repayment_date;
      const outstanding = Math.max(0, principal - totalRepaid);
      const todayStr = new Date().toISOString().split('T')[0];

      let newStatus: DebtStatus = 'active';
      if (outstanding === 0) {
        newStatus = 'settled';
      } else if (expectedDate && expectedDate < todayStr) {
        newStatus = 'overdue';
      } else if (totalRepaid > 0) {
        newStatus = 'partially_repaid';
      }
      updatePayload.status = newStatus;

      const { data: updated, error: updateErr } = await supabase
        .from('debts')
        .update(updatePayload as any)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      const row = updated as unknown as DebtRow;
      const mappedRepayments: DebtRepayment[] = repayments.map((r) => ({
        id: r.id,
        debtId: r.debt_id,
        amountPaise: Number(r.amount_paise),
        repaymentDate: r.repayment_date,
        note: r.note || undefined,
        createdAt: r.created_at,
      }));

      const debtItem: Debt = {
        id: row.id,
        personName: row.person_name,
        phoneNumber: row.phone_number || undefined,
        principalAmountPaise: Number(row.principal_amount_paise),
        lentDate: row.lent_date,
        expectedRepaymentDate: row.expected_repayment_date || undefined,
        description: row.description || undefined,
        status: row.status,
        repayments: mappedRepayments,
        totalRepaidPaise: totalRepaid,
        outstandingBalancePaise: outstanding,
        outstandingPaise: outstanding,
        phone: row.phone_number || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      return {
        success: true,
        persisted: true,
        item: debtItem,
        warningMessage: '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update debt record';
      return { success: false, persisted: false, warningMessage: msg };
    }
  }

  async deleteDebt(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) return false;
    try {
      const userId = await this.getUserId();
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      return !error;
    } catch {
      return false;
    }
  }

  async addDebtRepayment(
    debtId: string,
    amountPaise: number,
    repaymentDate: string,
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
      const roundedAmount = Math.round(amountPaise);
      if (roundedAmount <= 0) {
        return {
          success: false,
          persisted: false,
          warningMessage: 'Repayment amount must be greater than zero.',
        };
      }

      const { data: debt, error: debtErr } = await supabase
        .from('debts')
        .select('*, debt_repayments(*)')
        .eq('id', debtId)
        .eq('user_id', userId)
        .single();

      if (debtErr || !debt) throw new Error('Debt record not found');

      const existingRepayments = ((debt as any).debt_repayments || []) as DebtRepaymentRow[];
      const alreadyRepaid = existingRepayments.reduce((sum, r) => sum + Number(r.amount_paise), 0);
      const principal = Number(debt.principal_amount_paise);
      const outstanding = Math.max(0, principal - alreadyRepaid);

      if (roundedAmount > outstanding) {
        return {
          success: false,
          persisted: false,
          warningMessage: `Repayment amount exceeds remaining outstanding balance of ₹${(outstanding / 100).toFixed(2)}.`,
        };
      }

      const { error: repInsertErr } = await supabase
        .from('debt_repayments')
        .insert({
          debt_id: debtId,
          user_id: userId,
          amount_paise: roundedAmount,
          repayment_date: repaymentDate,
          note: note?.trim() || null,
        } as any);

      if (repInsertErr) throw repInsertErr;

      const newTotalRepaid = alreadyRepaid + roundedAmount;
      const newOutstanding = Math.max(0, principal - newTotalRepaid);
      const todayStr = new Date().toISOString().split('T')[0];

      let newStatus: DebtStatus = 'active';
      if (newOutstanding === 0) {
        newStatus = 'settled';
      } else if (debt.expected_repayment_date && debt.expected_repayment_date < todayStr) {
        newStatus = 'overdue';
      } else if (newTotalRepaid > 0) {
        newStatus = 'partially_repaid';
      }

      await supabase
        .from('debts')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', debtId)
        .eq('user_id', userId);

      return {
        success: true,
        persisted: true,
        warningMessage: '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record repayment';
      return { success: false, persisted: false, warningMessage: msg };
    }
  }

  async deleteDebtRepayment(repaymentId: string, debtId: string) {
    const supabase = getSupabase();
    if (!supabase || !this._isSchemaReady) {
      return { success: false, persisted: false, warningMessage: 'Supabase is not configured.' };
    }

    try {
      const userId = await this.getUserId();
      const { error: delErr } = await supabase
        .from('debt_repayments')
        .delete()
        .eq('id', repaymentId)
        .eq('user_id', userId);

      if (delErr) throw delErr;

      const { data: debt } = await supabase
        .from('debts')
        .select('*, debt_repayments(*)')
        .eq('id', debtId)
        .eq('user_id', userId)
        .single();

      if (debt) {
        const remainingReps = ((debt as any).debt_repayments || []) as DebtRepaymentRow[];
        const totalRepaid = remainingReps.reduce((sum, r) => sum + Number(r.amount_paise), 0);
        const principal = Number(debt.principal_amount_paise);
        const outstanding = Math.max(0, principal - totalRepaid);
        const todayStr = new Date().toISOString().split('T')[0];

        let newStatus: DebtStatus = 'active';
        if (outstanding === 0) {
          newStatus = 'settled';
        } else if (debt.expected_repayment_date && debt.expected_repayment_date < todayStr) {
          newStatus = 'overdue';
        } else if (totalRepaid > 0) {
          newStatus = 'partially_repaid';
        }

        await supabase
          .from('debts')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', debtId)
          .eq('user_id', userId);
      }

      return {
        success: true,
        persisted: true,
        warningMessage: '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete repayment';
      return { success: false, persisted: false, warningMessage: msg };
    }
  }
}
