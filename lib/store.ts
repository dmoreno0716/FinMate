import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BudgetStore, Category, Transaction } from './types';
import { initializeCategoriesWithBudget, defaultCategories } from './seed';
import { getThisWeekTransactions } from './utils';

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      weeklyBudget: 0,
      categories: [],
      transactions: [],

      setWeeklyBudget: (budget: number) => {
        set({ weeklyBudget: budget });
        // Initialize categories with proportional limits
        const categories = initializeCategoriesWithBudget(budget);
        set({ categories });
      },

      setCategories: (categories: Category[]) => {
        set({ categories });
      },

      addTransaction: (transaction: Transaction) => {
        set((state) => ({
          transactions: [...state.transactions, transaction],
        }));
      },

      updateCategoryLimit: (id: string, limit: number) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, weeklyLimit: limit } : category
          ),
        }));
      },

      remainingThisWeek: () => {
        const { weeklyBudget, transactions } = get();
        
        const thisWeekTransactions = getThisWeekTransactions(transactions);
        const spentThisWeek = thisWeekTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );
        
        return weeklyBudget - spentThisWeek;
      },

      spendByCategory: (categoryId: string) => {
        const { transactions } = get();
        
        const thisWeekTransactions = getThisWeekTransactions(transactions);
        return thisWeekTransactions
          .filter((transaction) => transaction.categoryId === categoryId)
          .reduce((sum, transaction) => sum + transaction.amount, 0);
      },
    }),
    {
      name: 'finmate_budget_store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Function to reset the store for a new session
export const resetStoreForNewSession = () => {
  const store = useBudgetStore.getState();
  
  // Reset to clean slate
  store.setWeeklyBudget(0);
  store.setCategories(defaultCategories.map(cat => ({ ...cat, weeklyLimit: 0 })));
  
  // Clear transactions by directly updating the store
  useBudgetStore.setState({ transactions: [] });
};
