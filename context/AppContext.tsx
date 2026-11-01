'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Budget,
  SavingsGoal,
  Category,
  UserProfile,
  DashboardWidgetConfig,
  DashboardWidgetItem,
  DashboardWidgetId,
  AppScreen,
  FinancialSummary,
} from '@/types';
import { dataProvider } from '@/services/data-provider';
import {
  calculateNetBalance,
  calculateAvailableBalance,
} from '@/lib/calculations/financial';

interface AppContextType {
  // Navigation
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Data & Entities (Zero Fake Data Guarantee)
  transactions: Transaction[];
  deletedTransactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  userProfile: UserProfile;

  // Calculations
  financialSummary: FinancialSummary;

  // Dashboard Customization
  widgets: DashboardWidgetItem[];
  moveWidget: (id: DashboardWidgetId, direction: 'up' | 'down') => void;
  toggleWidgetPin: (id: DashboardWidgetId) => void;
  toggleWidgetVisible: (id: DashboardWidgetId) => void;
  resetWidgetLayout: () => void;
  widgetConfig: DashboardWidgetConfig;
  updateWidgetConfig: (config: Partial<DashboardWidgetConfig>) => void;
  isCustomizeModalOpen: boolean;
  setIsCustomizeModalOpen: (open: boolean) => void;

  // Transaction Drawer
  transactionDrawer: {
    isOpen: boolean;
    mode: 'add' | 'edit';
    initialData?: Transaction;
  };
  openAddTransaction: () => void;
  openEditTransaction: (tx: Transaction) => void;
  closeTransactionDrawer: () => void;

  // Mutators (with strict honesty / warning message triggers)
  submitTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'deletedAt'>) => Promise<{
    success: boolean;
    warningMessage: string;
  }>;
  deleteTransaction: (id: string) => Promise<boolean>;
  restoreTransaction: (id: string) => Promise<boolean>;
  permanentlyDeleteTransaction: (id: string) => Promise<boolean>;
  emptyTrash: () => Promise<number>;

  // Budgets
  submitBudget: (data: Omit<Budget, 'id' | 'createdAt'>) => Promise<{
    success: boolean;
    warningMessage: string;
  }>;
  deleteBudget: (id: string) => Promise<boolean>;

  // Savings
  submitSavingsGoal: (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'allocations' | 'currentAmountPaise'>) => Promise<{
    success: boolean;
    warningMessage: string;
  }>;
  submitSavingsAllocation: (
    goalId: string,
    amountPaise: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ) => Promise<{ success: boolean; warningMessage: string }>;

  // Categories
  addCustomCategory: (data: Omit<Category, 'id' | 'isCustom'>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Profile & Settings
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  resetAllData: () => void;

  // Notification Banner Modal
  bannerNotice: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'notice';
  } | null;
  clearBannerNotice: () => void;
  showNotice: (title: string, message: string, type?: 'info' | 'warning' | 'notice') => void;
}

const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetItem[] = [
  // CORE WIDGETS (Visible by default)
  {
    id: 'overview',
    label: 'Overview',
    desc: 'Total balance, income, expenses & available funds',
    visible: true,
    pinned: true,
  },
  {
    id: 'moneyAnalytics',
    label: 'Money Analytics',
    desc: 'Spending breakdown, category distribution & trends',
    visible: true,
    pinned: false,
  },
  {
    id: 'cashFlow',
    label: 'Cash Flow',
    desc: 'Money coming in vs money going out comparison',
    visible: true,
    pinned: false,
  },
  {
    id: 'budget',
    label: 'Budget Watchlist',
    desc: 'Budget limits, spending progress & alerts',
    visible: true,
    pinned: false,
  },
  {
    id: 'savings',
    label: 'Savings Goals',
    desc: 'Dedicated milestone progress & accumulated funds',
    visible: true,
    pinned: false,
  },
  {
    id: 'recentTransactions',
    label: 'Recent Transactions',
    desc: 'Latest ledger activity & quick records',
    visible: true,
    pinned: false,
  },
  // OPTIONAL WIDGETS (User-configurable via Customize Dashboard)
  {
    id: 'billsRecurring',
    label: 'Bills & Recurring Payments',
    desc: 'Subscriptions, rent, utility & payment commitments',
    visible: false,
    pinned: false,
  },
  {
    id: 'financialHealth',
    label: 'Financial Health',
    desc: 'Savings rate, spending-to-income ratio & health score',
    visible: false,
    pinned: false,
  },
  {
    id: 'netWorth',
    label: 'Net Worth',
    desc: 'Assets, dedicated reserves & net financial position',
    visible: false,
    pinned: false,
  },
  {
    id: 'debtEmi',
    label: 'Debt & EMI',
    desc: 'Outstanding loans & installment commitments',
    visible: false,
    pinned: false,
  },
  {
    id: 'reportsSummary',
    label: 'Reports Summary',
    desc: 'Executive period statement & daily spending rate',
    visible: false,
    pinned: false,
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Core state: strict zero fake data defaults
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deletedTransactions, setDeletedTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    studentType: 'College Undergraduate',
    institution: '',
    rollNumber: '',
    monthlyAllowancePaise: 0,
    currency: 'INR',
  });

  // Dashboard widgets state
  const [widgets, setWidgets] = useState<DashboardWidgetItem[]>(DEFAULT_DASHBOARD_WIDGETS);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Computed widgetConfig for backwards compatibility
  const widgetConfig = useMemo<DashboardWidgetConfig>(() => {
    const config: DashboardWidgetConfig = {
      moneyDashboard: true,
      balanceSummary: true,
      incomeExpenseChart: true,
      categorySpendingChart: true,
      budgetOverview: true,
      savingsProgress: true,
      recentTransactions: true,
    };
    widgets.forEach((w) => {
      config[w.id] = w.visible;
    });
    return config;
  }, [widgets]);

  // Drawer
  const [transactionDrawer, setTransactionDrawer] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    initialData?: Transaction;
  }>({
    isOpen: false,
    mode: 'add',
  });

  // Global honest notification notice
  const [bannerNotice, setBannerNotice] = useState<{
    title: string;
    message: string;
    type: 'info' | 'warning' | 'notice';
  } | null>(null);

  // Initial load from dataProvider
  useEffect(() => {
    async function loadInitial() {
      const [txs, delTxs, cats, bgs, goals, profile] = await Promise.all([
        dataProvider.getTransactions(),
        dataProvider.getRecentlyDeleted(),
        dataProvider.getCategories(),
        dataProvider.getBudgets(),
        dataProvider.getSavingsGoals(),
        dataProvider.getUserProfile(),
      ]);

      setTransactions(txs);
      setDeletedTransactions(delTxs);
      setCategories(cats);
      setBudgets(bgs);
      setSavingsGoals(goals);
      setUserProfile(profile);

      // Load widget preferences if in localStorage
      try {
        const savedWidgets = localStorage.getItem('expence_tracker_widgets_v4');
        if (savedWidgets) {
          const parsed = JSON.parse(savedWidgets) as DashboardWidgetItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge with defaults to ensure all keys exist
            const merged = DEFAULT_DASHBOARD_WIDGETS.map((def) => {
              const found = parsed.find((p) => p.id === def.id);
              return found ? { ...def, visible: found.visible, pinned: found.pinned } : def;
            });
            // Re-order by saved order
            const ordered = [...merged].sort((a, b) => {
              const idxA = parsed.findIndex((p) => p.id === a.id);
              const idxB = parsed.findIndex((p) => p.id === b.id);
              return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
            });
            setWidgets(ordered);
          }
        }
      } catch {
        // Ignore
      }
    }

    loadInitial();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const moveWidget = (id: DashboardWidgetId, direction: 'up' | 'down') => {
    setWidgets((prev) => {
      const index = prev.findIndex((w) => w.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const newWidgets = [...prev];
      const [moved] = newWidgets.splice(index, 1);
      newWidgets.splice(targetIndex, 0, moved);

      try {
        localStorage.setItem('expence_tracker_widgets_v4', JSON.stringify(newWidgets));
      } catch {
        // Ignore
      }
      return newWidgets;
    });
  };

  const toggleWidgetPin = (id: DashboardWidgetId) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, pinned: !w.pinned } : w));
      try {
        localStorage.setItem('expence_tracker_widgets_v4', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const toggleWidgetVisible = (id: DashboardWidgetId) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
      try {
        localStorage.setItem('expence_tracker_widgets_v4', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const resetWidgetLayout = () => {
    setWidgets(DEFAULT_DASHBOARD_WIDGETS);
    try {
      localStorage.setItem('expence_tracker_widgets_v4', JSON.stringify(DEFAULT_DASHBOARD_WIDGETS));
    } catch {
      // Ignore
    }
    showNotice('Dashboard Layout Reset', 'Dashboard widgets restored to default arrangement.', 'info');
  };

  const updateWidgetConfig = (config: Partial<DashboardWidgetConfig>) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => {
        if (config[w.id] !== undefined) {
          return { ...w, visible: Boolean(config[w.id]) };
        }
        return w;
      });
      try {
        localStorage.setItem('expence_tracker_widgets_v2', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const openAddTransaction = () => {
    setTransactionDrawer({ isOpen: true, mode: 'add' });
  };

  const openEditTransaction = (tx: Transaction) => {
    setTransactionDrawer({ isOpen: true, mode: 'edit', initialData: tx });
  };

  const closeTransactionDrawer = () => {
    setTransactionDrawer((prev) => ({ ...prev, isOpen: false }));
  };

  const showNotice = (title: string, message: string, type: 'info' | 'warning' | 'notice' = 'info') => {
    setBannerNotice({ title, message, type });
  };

  const clearBannerNotice = () => {
    setBannerNotice(null);
  };

  // Financial summary computation
  const financialSummary = useMemo<FinancialSummary>(() => {
    const totalIncomePaise = transactions
      .filter((t) => t.type === 'income' && !t.deletedAt)
      .reduce((sum, t) => sum + t.amountPaise, 0);

    const totalExpensesPaise = transactions
      .filter((t) => t.type === 'expense' && !t.deletedAt)
      .reduce((sum, t) => sum + t.amountPaise, 0);

    const netBalancePaise = calculateNetBalance(totalIncomePaise, totalExpensesPaise);

    // Sum allocated savings (allocations are NOT ordinary expenses)
    const savingsAllocatedPaise = savingsGoals.reduce((sum, g) => sum + g.currentAmountPaise, 0);

    const availableBalancePaise = calculateAvailableBalance(netBalancePaise, savingsAllocatedPaise);

    return {
      totalIncomePaise,
      totalExpensesPaise,
      netBalancePaise,
      savingsAllocatedPaise,
      availableBalancePaise,
    };
  }, [transactions, savingsGoals]);

  // Submit Transaction
  const submitTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'deletedAt'>
  ) => {
    const res = await dataProvider.createTransaction(data);
    const updated = await dataProvider.getTransactions();
    setTransactions(updated);
    closeTransactionDrawer();

    showNotice(
      'Form Validated & Preview Active',
      res.warningMessage,
      'warning'
    );

    return {
      success: res.success,
      warningMessage: res.warningMessage,
    };
  };

  const deleteTransaction = async (id: string) => {
    await dataProvider.deleteTransaction(id);
    const [active, deleted] = await Promise.all([
      dataProvider.getTransactions(),
      dataProvider.getRecentlyDeleted(),
    ]);
    setTransactions(active);
    setDeletedTransactions(deleted);
    showNotice(
      'Transaction Moved to Recently Deleted',
      'The item was moved to Recently Deleted. Retention policy will permanently remove records after 30 days.',
      'info'
    );
    return true;
  };

  const restoreTransaction = async (id: string) => {
    await dataProvider.restoreTransaction(id);
    const [active, deleted] = await Promise.all([
      dataProvider.getTransactions(),
      dataProvider.getRecentlyDeleted(),
    ]);
    setTransactions(active);
    setDeletedTransactions(deleted);
    showNotice('Transaction Restored', 'Transaction was restored to your active ledger.', 'info');
    return true;
  };

  const permanentlyDeleteTransaction = async (id: string) => {
    await dataProvider.permanentlyDeleteTransaction(id);
    const deleted = await dataProvider.getRecentlyDeleted();
    setDeletedTransactions(deleted);
    showNotice(
      'Permanently Deleted',
      'Record was permanently expunged from the session.',
      'info'
    );
    return true;
  };

  const emptyTrash = async () => {
    const count = await dataProvider.emptyTrash();
    const deleted = await dataProvider.getRecentlyDeleted();
    setDeletedTransactions(deleted);
    showNotice(
      'Trash Bin Emptied',
      `Permanently purged ${count} ${count === 1 ? 'record' : 'records'} from the local session.`,
      'info'
    );
    return count;
  };

  const submitBudget = async (data: Omit<Budget, 'id' | 'createdAt'>) => {
    const res = await dataProvider.createBudget(data);
    const updated = await dataProvider.getBudgets();
    setBudgets(updated);
    showNotice('Budget Configured', res.warningMessage, 'warning');
    return { success: res.success, warningMessage: res.warningMessage };
  };

  const deleteBudget = async (id: string) => {
    await dataProvider.deleteBudget(id);
    const updated = await dataProvider.getBudgets();
    setBudgets(updated);
    return true;
  };

  const submitSavingsGoal = async (
    data: Omit<SavingsGoal, 'id' | 'createdAt' | 'allocations' | 'currentAmountPaise'>
  ) => {
    const res = await dataProvider.createSavingsGoal(data);
    const updated = await dataProvider.getSavingsGoals();
    setSavingsGoals(updated);
    showNotice('Savings Goal Created', res.warningMessage, 'warning');
    return { success: res.success, warningMessage: res.warningMessage };
  };

  const submitSavingsAllocation = async (
    goalId: string,
    amountPaise: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ) => {
    const res = await dataProvider.addSavingsAllocation(goalId, amountPaise, type, note);
    const updated = await dataProvider.getSavingsGoals();
    setSavingsGoals(updated);
    showNotice('Fund Allocation Updated', res.warningMessage, 'info');
    return { success: res.success, warningMessage: res.warningMessage };
  };

  const addCustomCategory = async (data: Omit<Category, 'id' | 'isCustom'>) => {
    const newCat = await dataProvider.addCustomCategory(data);
    const updated = await dataProvider.getCategories();
    setCategories(updated);
    showNotice(
      'Category Created',
      `Category "${newCat.name}" is now available.`,
      'info'
    );
    return newCat;
  };

  const updateCategory = async (id: string, data: Partial<Omit<Category, 'id'>>) => {
    const updated = await dataProvider.updateCategory(id, data);
    const refreshed = await dataProvider.getCategories();
    setCategories(refreshed);
    showNotice(
      'Category Updated',
      `Category "${updated.name}" has been updated.`,
      'info'
    );
    return updated;
  };

  const deleteCategory = async (id: string) => {
    await dataProvider.deleteCategory(id);
    const refreshed = await dataProvider.getCategories();
    setCategories(refreshed);
    showNotice(
      'Category Deleted',
      'The category has been deleted.',
      'info'
    );
    return true;
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    const updated = await dataProvider.updateUserProfile(profileData);
    setUserProfile(updated);
    showNotice(
      'Profile Updated',
      'Student profile information updated for this local session.',
      'info'
    );
  };

  const resetAllData = () => {
    setTransactions([]);
    setDeletedTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    showNotice(
      'Session Reset Complete',
      'All volatile local session entries have been cleared. No server data was affected.',
      'info'
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        transactions,
        deletedTransactions,
        categories,
        budgets,
        savingsGoals,
        userProfile,
        financialSummary,
        widgets,
        moveWidget,
        toggleWidgetPin,
        toggleWidgetVisible,
        resetWidgetLayout,
        widgetConfig,
        updateWidgetConfig,
        isCustomizeModalOpen,
        setIsCustomizeModalOpen,
        transactionDrawer,
        openAddTransaction,
        openEditTransaction,
        closeTransactionDrawer,
        submitTransaction,
        deleteTransaction,
        restoreTransaction,
        permanentlyDeleteTransaction,
        emptyTrash,
        submitBudget,
        deleteBudget,
        submitSavingsGoal,
        submitSavingsAllocation,
        addCustomCategory,
        updateCategory,
        deleteCategory,
        updateProfile,
        resetAllData,
        bannerNotice,
        clearBannerNotice,
        showNotice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
