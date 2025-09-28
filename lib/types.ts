export type CategoryName = "Food" | "Transport" | "Social" | "Other";

export interface Account {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: CategoryName;
  color: string;
  weeklyLimit: number;
}

export interface Transaction {
  id: string;
  categoryId: string;
  label: string;
  amount: number;
  date: string; // ISO string
}

export interface BudgetStore {
  weeklyBudget: number;
  categories: Category[];
  transactions: Transaction[];
  setWeeklyBudget: (budget: number) => void;
  setCategories: (categories: Category[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateCategoryLimit: (id: string, limit: number) => void;
  remainingThisWeek: () => number;
  spendByCategory: (categoryId: string) => number;
}
