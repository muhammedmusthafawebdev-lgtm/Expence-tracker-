import {
  Transaction,
  Budget,
  SavingsGoal,
  Category,
  UserProfile,
  TransactionType,
} from '@/types';
import { INITIAL_STUDENT_CATEGORIES } from '@/constants/categories';

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
    return { ...this.userProfile };
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    this.userProfile = { ...this.userProfile, ...data };
    return { ...this.userProfile };
  }

  private getCategoryName(categoryId: string): string {
    return this.categories.find((c) => c.id === categoryId)?.name || 'General';
  }
}

// Global frontend data provider singleton
// Implements IDataProvider with zero fake data and in-memory session reactivity.
// Prepared as a clear interface for the future Supabase backend tool to implement.
export const dataProvider: IDataProvider = new ClientSessionDataProvider();


