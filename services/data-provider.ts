import {
  Transaction,
  Budget,
  SavingsGoal,
  Category,
  UserProfile,
  TransactionType,
  Debt,
  DebtRepayment,
  DebtStatus,
} from '@/types';
import { INITIAL_STUDENT_CATEGORIES } from '@/constants/categories';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { SupabaseDataProvider } from '@/services/supabase/supabase-data-provider';

export interface TransactionFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType | 'all';
  minAmountPaise?: number;
  maxAmountPaise?: number;
}

export interface IDataProvider {
  readonly isBackendConnected: boolean;

  // Transactions
  getTransactions(filters?: TransactionFilters): Promise<Transaction[]>;
  createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<{
    success: boolean;
    persisted: boolean;
    item?: Transaction;
    warningMessage: string;
  }>;
  updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<{
    success: boolean;
    persisted: boolean;
    item?: Transaction;
    warningMessage: string;
  }>;
  deleteTransaction(id: string): Promise<boolean>;
  restoreTransaction(id: string): Promise<boolean>;
  permanentlyDeleteTransaction(id: string): Promise<boolean>;
  emptyTrash(): Promise<number>;
  getRecentlyDeleted(): Promise<Transaction[]>;

  // Budgets
  getBudgets(): Promise<Budget[]>;
  createBudget(data: Omit<Budget, 'id' | 'createdAt'>): Promise<{
    success: boolean;
    persisted: boolean;
    item?: Budget;
    warningMessage: string;
  }>;
  deleteBudget(id: string): Promise<boolean>;

  // Savings
  getSavingsGoals(): Promise<SavingsGoal[]>;
  createSavingsGoal(data: Omit<SavingsGoal, 'id' | 'createdAt' | 'allocations' | 'currentAmountPaise'>): Promise<{
    success: boolean;
    persisted: boolean;
    item?: SavingsGoal;
    warningMessage: string;
  }>;
  deleteSavingsGoal(id: string): Promise<boolean>;
  addSavingsAllocation(
    goalId: string,
    amountPaise: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ): Promise<{ success: boolean; persisted: boolean; warningMessage: string }>;

  // Categories
  getCategories(): Promise<Category[]>;
  addCustomCategory(data: Omit<Category, 'id' | 'isCustom'>): Promise<Category>;
  updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;

  // Profile & Settings
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile>;

  // Debts (Money Lent & Repayments)
  getDebts(): Promise<Debt[]>;
  createDebt(data: {
    personName: string;
    phoneNumber?: string;
    principalAmountPaise: number;
    lentDate: string;
    expectedRepaymentDate?: string;
    description?: string;
  }): Promise<{
    success: boolean;
    persisted: boolean;
    item?: Debt;
    warningMessage: string;
  }>;
  updateDebt(
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
  ): Promise<{
    success: boolean;
    persisted: boolean;
    item?: Debt;
    warningMessage: string;
  }>;
  deleteDebt(id: string): Promise<boolean>;
  addDebtRepayment(
    debtId: string,
    amountPaise: number,
    repaymentDate: string,
    note?: string
  ): Promise<{ success: boolean; persisted: boolean; warningMessage: string }>;
  deleteDebtRepayment(
    repaymentId: string,
    debtId: string
  ): Promise<{ success: boolean; persisted: boolean; warningMessage: string }>;
}

/**
 * Standard Frontend-Only Data Provider
 * Adheres strictly to the Zero Fake Data policy:
 * - Real arrays start completely empty: []
 * - When user submits forms, client validation is performed and items are placed in volatile session memory
 * - Returns persisted: false and an honest warning message stating backend persistence is unavailable.
 */
export class ClientSessionDataProvider implements IDataProvider {
  public readonly isBackendConnected = false;

  private transactions: Transaction[] = [];
  private deletedTransactions: Transaction[] = [];
  private budgets: Budget[] = [];
  private savingsGoals: SavingsGoal[] = [];
  private categories: Category[] = [...INITIAL_STUDENT_CATEGORIES];
  private debts: Debt[] = [];

  private userProfile: UserProfile = {
    name: '',
    email: '',
    studentType: 'College Undergraduate',
    institution: '',
    rollNumber: '',
    monthlyAllowancePaise: 0,
    currency: 'INR',
  };

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    let result = this.transactions.filter((t) => !t.deletedAt);

    if (!filters) return result;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          this.getCategoryName(t.categoryId).toLowerCase().includes(q)
      );
    }

    if (filters.type && filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.categoryId) {
      result = result.filter((t) => t.categoryId === filters.categoryId);
    }

    if (filters.startDate) {
      result = result.filter((t) => t.date >= filters.startDate!);
    }

    if (filters.endDate) {
      result = result.filter((t) => t.date <= filters.endDate!);
    }

    if (filters.minAmountPaise !== undefined) {
      result = result.filter((t) => t.amountPaise >= filters.minAmountPaise!);
    }

    if (filters.maxAmountPaise !== undefined) {
      result = result.filter((t) => t.amountPaise <= filters.maxAmountPaise!);
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>) {
    const newTransaction: Transaction = {
      ...data,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };
    this.transactions.unshift(newTransaction);
    return {
      success: true,
      persisted: false,
      item: newTransaction,
      warningMessage:
        'Frontend Preview: Form validated. Transaction is active in this session only; database persistence is unavailable until a backend is connected.',
    };
  }

  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      return { success: false, persisted: false, warningMessage: 'Transaction not found.' };
    }
    const current = this.transactions[index];
    const updated: Transaction = {
      ...current,
      ...data,
      amountPaise: data.amountPaise !== undefined ? Math.round(data.amountPaise) : current.amountPaise,
    };
    this.transactions[index] = updated;
    return {
      success: true,
      persisted: false,
      item: updated,
      warningMessage: 'Transaction updated in local session.',
    };
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const tx = this.transactions.find((t) => t.id === id);
    if (!tx) return false;
    tx.deletedAt = new Date().toISOString();
    this.deletedTransactions.unshift(tx);
    this.transactions = this.transactions.filter((t) => t.id !== id);
    return true;
  }

  async restoreTransaction(id: string): Promise<boolean> {
    const tx = this.deletedTransactions.find((t) => t.id === id);
    if (!tx) return false;
    tx.deletedAt = null;
    this.transactions.unshift(tx);
    this.deletedTransactions = this.deletedTransactions.filter((t) => t.id !== id);
    return true;
  }

  async permanentlyDeleteTransaction(id: string): Promise<boolean> {
    this.deletedTransactions = this.deletedTransactions.filter((t) => t.id !== id);
    return true;
  }

  async emptyTrash(): Promise<number> {
    const count = this.deletedTransactions.length;
    this.deletedTransactions = [];
    return count;
  }

  async getRecentlyDeleted(): Promise<Transaction[]> {
    return [...this.deletedTransactions];
  }

  async getBudgets(): Promise<Budget[]> {
    return [...this.budgets];
  }

  async createBudget(data: Omit<Budget, 'id' | 'createdAt'>) {
    const existing = this.budgets.findIndex(
      (b) => b.categoryId === data.categoryId && b.period === data.period
    );
    const newBudget: Budget = {
      ...data,
      id: `bg_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (existing >= 0) {
      this.budgets[existing] = newBudget;
    } else {
      this.budgets.push(newBudget);
    }
    return {
      success: true,
      persisted: false,
      item: newBudget,
      warningMessage:
        'Frontend Preview: Budget threshold configured in local session. Permanent cloud sync requires backend integration.',
    };
  }

  async deleteBudget(id: string): Promise<boolean> {
    this.budgets = this.budgets.filter((b) => b.id !== id);
    return true;
  }

  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return [...this.savingsGoals];
  }

  async createSavingsGoal(data: Omit<SavingsGoal, 'id' | 'createdAt' | 'allocations' | 'currentAmountPaise'>) {
    const newGoal: SavingsGoal = {
      ...data,
      id: `sg_${Date.now()}`,
      currentAmountPaise: 0,
      allocations: [],
      createdAt: new Date().toISOString(),
    };
    this.savingsGoals.push(newGoal);
    return {
      success: true,
      persisted: false,
      item: newGoal,
      warningMessage:
        'Frontend Preview: Savings goal created in memory. Connect backend persistence for multi-device sync.',
    };
  }

  async deleteSavingsGoal(id: string): Promise<boolean> {
    this.savingsGoals = this.savingsGoals.filter((g) => g.id !== id);
    return true;
  }

  async addSavingsAllocation(
    goalId: string,
    amountPaise: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ) {
    const goal = this.savingsGoals.find((g) => g.id === goalId);
    if (!goal) return { success: false, persisted: false, warningMessage: 'Goal not found' };

    const allocation = {
      id: `alloc_${Date.now()}`,
      amountPaise,
      date: new Date().toISOString().split('T')[0],
      type,
      note,
    };

    if (type === 'deposit') {
      goal.currentAmountPaise += amountPaise;
    } else {
      goal.currentAmountPaise = Math.max(0, goal.currentAmountPaise - amountPaise);
    }
    goal.allocations.unshift(allocation);

    return {
      success: true,
      persisted: false,
      warningMessage: `Allocation recorded in session. Note: Savings allocations are dedicated student funds, not counted as ordinary expenses.`,
    };
  }

  private saveCategoriesToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('expence_tracker_user_categories_v3', JSON.stringify(this.categories));
      } catch {
        // ignore
      }
    }
  }

  async getCategories(): Promise<Category[]> {
    if (typeof window !== 'undefined' && this.categories.length === 0) {
      try {
        const stored = localStorage.getItem('expence_tracker_user_categories_v3');
        if (stored) {
          this.categories = JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }
    return [...this.categories];
  }

  async addCustomCategory(data: Omit<Category, 'id' | 'isCustom'>): Promise<Category> {
    const trimmedName = data.name.trim();
    // Prevent duplicate category names within the same transaction type (case-insensitive)
    const duplicate = this.categories.some(
      (c) =>
        c.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        (c.type === data.type || c.type === 'both' || (data.type as string) === 'both')
    );
    if (duplicate) {
      throw new Error(`A ${data.type} category named "${trimmedName}" already exists.`);
    }

    const newCat: Category = {
      ...data,
      name: trimmedName,
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      isCustom: true,
    };
    this.categories.push(newCat);
    this.saveCategoriesToStorage();
    return newCat;
  }

  async updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    const current = this.categories[index];
    const newName = data.name !== undefined ? data.name.trim() : current.name;
    const newType = data.type !== undefined ? data.type : current.type;

    // Check duplicate if name or type changed
    const duplicate = this.categories.some(
      (c) =>
        c.id !== id &&
        c.name.trim().toLowerCase() === newName.toLowerCase() &&
        (c.type === newType || c.type === 'both' || (newType as string) === 'both')
    );
    if (duplicate) {
      throw new Error(`A ${newType} category named "${newName}" already exists.`);
    }

    const updatedCat: Category = {
      ...current,
      ...data,
      name: newName,
    };
    this.categories[index] = updatedCat;
    this.saveCategoriesToStorage();
    return updatedCat;
  }

  async deleteCategory(id: string): Promise<boolean> {
    this.categories = this.categories.filter((c) => c.id !== id);
    this.saveCategoriesToStorage();
    return true;
  }

  async getUserProfile(): Promise<UserProfile> {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('expence_tracker_profile_v3');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.userProfile = { ...this.userProfile, ...parsed };
        } else {
          const authEmail = localStorage.getItem('expence_tracker_auth_user_email');
          if (authEmail && !this.userProfile.email) {
            this.userProfile.email = authEmail;
            if (!this.userProfile.name) {
              this.userProfile.name = authEmail.split('@')[0];
            }
          }
        }
      } catch {
        // ignore
      }
    }
    return { ...this.userProfile };
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    this.userProfile = { ...this.userProfile, ...data };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('expence_tracker_profile_v3', JSON.stringify(this.userProfile));
        if (this.userProfile.email) {
          localStorage.setItem('expence_tracker_auth_user_email', this.userProfile.email);
        }
      } catch {
        // ignore
      }
    }
    return { ...this.userProfile };
  }

  private getCategoryName(categoryId: string): string {
    return this.categories.find((c) => c.id === categoryId)?.name || 'General';
  }

  // =========================================================================
  // DEBTS & REPAYMENTS (CLIENT SESSION)
  // =========================================================================
  private calculateDebtStatus(
    principalAmountPaise: number,
    totalRepaidPaise: number,
    expectedRepaymentDate?: string
  ): DebtStatus {
    const outstanding = Math.max(0, principalAmountPaise - totalRepaidPaise);
    if (outstanding === 0) return 'settled';

    const todayStr = new Date().toISOString().split('T')[0];
    if (expectedRepaymentDate && expectedRepaymentDate < todayStr) {
      return 'overdue';
    }

    if (totalRepaidPaise > 0) return 'partially_repaid';
    return 'active';
  }

  async getDebts(): Promise<Debt[]> {
    return this.debts.map((d) => {
      const status = this.calculateDebtStatus(
        d.principalAmountPaise,
        d.totalRepaidPaise,
        d.expectedRepaymentDate
      );
      const outstanding = Math.max(0, d.principalAmountPaise - d.totalRepaidPaise);
      return {
        ...d,
        status,
        phone: d.phoneNumber || d.phone,
        phoneNumber: d.phoneNumber || d.phone,
        outstandingBalancePaise: outstanding,
        outstandingPaise: outstanding,
      };
    });
  }

  async createDebt(data: {
    personName: string;
    phoneNumber?: string;
    phone?: string;
    principalAmountPaise: number;
    lentDate: string;
    expectedRepaymentDate?: string;
    description?: string;
  }) {
    const principal = Math.round(data.principalAmountPaise);
    if (principal <= 0) {
      return {
        success: false,
        persisted: false,
        warningMessage: 'Principal amount must be greater than zero.',
      };
    }

    const now = new Date().toISOString();
    const status = this.calculateDebtStatus(principal, 0, data.expectedRepaymentDate);
    const rawPhone = data.phoneNumber || data.phone;
    const newDebt: Debt = {
      id: `debt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      personName: data.personName.trim(),
      phoneNumber: rawPhone?.trim() || undefined,
      phone: rawPhone?.trim() || undefined,
      principalAmountPaise: principal,
      lentDate: data.lentDate,
      expectedRepaymentDate: data.expectedRepaymentDate || undefined,
      description: data.description?.trim() || undefined,
      status,
      repayments: [],
      totalRepaidPaise: 0,
      outstandingBalancePaise: principal,
      outstandingPaise: principal,
      createdAt: now,
      updatedAt: now,
    };

    this.debts.unshift(newDebt);
    return {
      success: true,
      persisted: false,
      item: newDebt,
      warningMessage: 'Debt record recorded in local session.',
    };
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
    const debt = this.debts.find((d) => d.id === id);
    if (!debt) {
      return { success: false, persisted: false, warningMessage: 'Debt record not found.' };
    }

    if (data.principalAmountPaise !== undefined) {
      const newPrincipal = Math.round(data.principalAmountPaise);
      if (newPrincipal < debt.totalRepaidPaise) {
        return {
          success: false,
          persisted: false,
          warningMessage: `Principal amount cannot be less than already repaid amount (₹${(debt.totalRepaidPaise / 100).toFixed(2)}).`,
        };
      }
      debt.principalAmountPaise = newPrincipal;
      debt.outstandingBalancePaise = Math.max(0, newPrincipal - debt.totalRepaidPaise);
    }

    if (data.personName !== undefined) debt.personName = data.personName.trim();
    const rawPhone = data.phoneNumber || data.phone;
    if (rawPhone !== undefined) {
      debt.phoneNumber = rawPhone.trim() || undefined;
      debt.phone = rawPhone.trim() || undefined;
    }
    if (data.lentDate !== undefined) debt.lentDate = data.lentDate;
    if (data.expectedRepaymentDate !== undefined) debt.expectedRepaymentDate = data.expectedRepaymentDate || undefined;
    if (data.description !== undefined) debt.description = data.description.trim() || undefined;
    debt.outstandingPaise = debt.outstandingBalancePaise;
    debt.updatedAt = new Date().toISOString();
    debt.status = this.calculateDebtStatus(debt.principalAmountPaise, debt.totalRepaidPaise, debt.expectedRepaymentDate);

    return {
      success: true,
      persisted: false,
      item: debt,
      warningMessage: 'Debt updated successfully.',
    };
  }

  async deleteDebt(id: string): Promise<boolean> {
    this.debts = this.debts.filter((d) => d.id !== id);
    return true;
  }

  async addDebtRepayment(
    debtId: string,
    amountPaise: number,
    repaymentDate: string,
    note?: string
  ) {
    const debt = this.debts.find((d) => d.id === debtId);
    if (!debt) {
      return { success: false, persisted: false, warningMessage: 'Debt record not found.' };
    }

    const rounded = Math.round(amountPaise);
    if (rounded <= 0) {
      return { success: false, persisted: false, warningMessage: 'Repayment amount must be positive.' };
    }
    if (rounded > debt.outstandingBalancePaise) {
      return {
        success: false,
        persisted: false,
        warningMessage: `Repayment amount exceeds remaining outstanding balance of ₹${(debt.outstandingBalancePaise / 100).toFixed(2)}.`,
      };
    }

    const repayment: DebtRepayment = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      debtId,
      amountPaise: rounded,
      repaymentDate,
      note: note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    debt.repayments.unshift(repayment);
    debt.totalRepaidPaise += rounded;
    debt.outstandingBalancePaise = Math.max(0, debt.principalAmountPaise - debt.totalRepaidPaise);
    debt.outstandingPaise = debt.outstandingBalancePaise;
    debt.status = this.calculateDebtStatus(debt.principalAmountPaise, debt.totalRepaidPaise, debt.expectedRepaymentDate);
    debt.updatedAt = new Date().toISOString();

    return {
      success: true,
      persisted: false,
      warningMessage: `Repayment of ₹${(rounded / 100).toFixed(2)} recorded successfully.`,
    };
  }

  async deleteDebtRepayment(arg1: string, arg2: string) {
    // Resilient parameter resolution: handles (repaymentId, debtId) or (debtId, repaymentId)
    let debt = this.debts.find((d) => d.id === arg2);
    let repId = arg1;
    if (!debt) {
      debt = this.debts.find((d) => d.id === arg1);
      repId = arg2;
    }
    if (!debt) {
      debt = this.debts.find((d) => d.repayments.some((r) => r.id === arg1 || r.id === arg2));
      repId = debt?.repayments.some((r) => r.id === arg1) ? arg1 : arg2;
    }

    if (!debt) {
      return { success: false, persisted: false, warningMessage: 'Debt record not found.' };
    }

    const rep = debt.repayments.find((r) => r.id === repId);
    if (!rep) {
      return { success: false, persisted: false, warningMessage: 'Repayment not found.' };
    }

    debt.repayments = debt.repayments.filter((r) => r.id !== repId);
    debt.totalRepaidPaise = debt.repayments.reduce((sum, r) => sum + r.amountPaise, 0);
    debt.outstandingBalancePaise = Math.max(0, debt.principalAmountPaise - debt.totalRepaidPaise);
    debt.outstandingPaise = debt.outstandingBalancePaise;
    debt.status = this.calculateDebtStatus(debt.principalAmountPaise, debt.totalRepaidPaise, debt.expectedRepaymentDate);
    debt.updatedAt = new Date().toISOString();

    return {
      success: true,
      persisted: false,
      warningMessage: 'Repayment removed.',
    };
  }
}

/**
 * Production Hybrid Data Provider
 * Automatically routes to real Supabase database when Supabase is configured,
 * and seamlessly provides volatile guest/offline session storage when unconfigured.
 */
export class HybridDataProvider implements IDataProvider {
  private localProvider = new ClientSessionDataProvider();
  private supabaseProvider: SupabaseDataProvider | null = null;

  public get isBackendConnected(): boolean {
    return isSupabaseConfigured();
  }

  private getActiveProvider(): IDataProvider {
    if (isSupabaseConfigured()) {
      if (!this.supabaseProvider) {
        this.supabaseProvider = new SupabaseDataProvider();
      }
      return this.supabaseProvider;
    }
    return this.localProvider;
  }

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    return this.getActiveProvider().getTransactions(filters);
  }
  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>) {
    return this.getActiveProvider().createTransaction(data);
  }
  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) {
    return this.getActiveProvider().updateTransaction(id, data);
  }
  async deleteTransaction(id: string): Promise<boolean> {
    return this.getActiveProvider().deleteTransaction(id);
  }
  async restoreTransaction(id: string): Promise<boolean> {
    return this.getActiveProvider().restoreTransaction(id);
  }
  async permanentlyDeleteTransaction(id: string): Promise<boolean> {
    return this.getActiveProvider().permanentlyDeleteTransaction(id);
  }
  async emptyTrash(): Promise<number> {
    return this.getActiveProvider().emptyTrash();
  }
  async getRecentlyDeleted(): Promise<Transaction[]> {
    return this.getActiveProvider().getRecentlyDeleted();
  }
  async getBudgets(): Promise<Budget[]> {
    return this.getActiveProvider().getBudgets();
  }
  async createBudget(data: Omit<Budget, 'id' | 'createdAt'>) {
    return this.getActiveProvider().createBudget(data);
  }
  async deleteBudget(id: string): Promise<boolean> {
    return this.getActiveProvider().deleteBudget(id);
  }
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return this.getActiveProvider().getSavingsGoals();
  }
  async createSavingsGoal(data: Omit<SavingsGoal, 'id' | 'createdAt' | 'allocations' | 'currentAmountPaise'>) {
    return this.getActiveProvider().createSavingsGoal(data);
  }
  async deleteSavingsGoal(id: string): Promise<boolean> {
    return this.getActiveProvider().deleteSavingsGoal(id);
  }
  async addSavingsAllocation(
    goalId: string,
    amountPaise: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ) {
    return this.getActiveProvider().addSavingsAllocation(goalId, amountPaise, type, note);
  }
  async getCategories(): Promise<Category[]> {
    return this.getActiveProvider().getCategories();
  }
  async addCustomCategory(data: Omit<Category, 'id' | 'isCustom'>): Promise<Category> {
    return this.getActiveProvider().addCustomCategory(data);
  }
  async updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category> {
    return this.getActiveProvider().updateCategory(id, data);
  }
  async deleteCategory(id: string): Promise<boolean> {
    return this.getActiveProvider().deleteCategory(id);
  }
  async getUserProfile(): Promise<UserProfile> {
    return this.getActiveProvider().getUserProfile();
  }
  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.getActiveProvider().updateUserProfile(data);
  }

  // Debts
  async getDebts(): Promise<Debt[]> {
    return this.getActiveProvider().getDebts();
  }
  async createDebt(data: {
    personName: string;
    phoneNumber?: string;
    principalAmountPaise: number;
    lentDate: string;
    expectedRepaymentDate?: string;
    description?: string;
  }) {
    return this.getActiveProvider().createDebt(data);
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
    return this.getActiveProvider().updateDebt(id, data);
  }
  async deleteDebt(id: string): Promise<boolean> {
    return this.getActiveProvider().deleteDebt(id);
  }
  async addDebtRepayment(
    debtId: string,
    amountPaise: number,
    repaymentDate: string,
    note?: string
  ) {
    return this.getActiveProvider().addDebtRepayment(debtId, amountPaise, repaymentDate, note);
  }
  async deleteDebtRepayment(repaymentId: string, debtId: string) {
    return this.getActiveProvider().deleteDebtRepayment(repaymentId, debtId);
  }
}

// Global data provider singleton: automatically connects Supabase when configured
export const dataProvider: IDataProvider = new HybridDataProvider();


