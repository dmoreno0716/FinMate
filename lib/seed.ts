import { Category, Transaction } from './types';

export const defaultCategories: Category[] = [
  {
    id: 'food',
    name: 'Food',
    color: '#10B981', // emerald-500
    weeklyLimit: 0, // Will be set based on budget
  },
  {
    id: 'transport',
    name: 'Transport',
    color: '#3B82F6', // blue-500
    weeklyLimit: 0, // Will be set based on budget
  },
  {
    id: 'social',
    name: 'Social',
    color: '#F59E0B', // amber-500
    weeklyLimit: 0, // Will be set based on budget
  },
  {
    id: 'other',
    name: 'Other',
    color: '#8B5CF6', // violet-500
    weeklyLimit: 0, // Will be set based on budget
  },
];

export const exampleTransactions: Transaction[] = [
  {
    id: '1',
    categoryId: 'food',
    label: 'Coffee',
    amount: 4.50,
    date: new Date().toISOString(),
  },
  {
    id: '2',
    categoryId: 'transport',
    label: 'Uber',
    amount: 12.00,
    date: new Date().toISOString(),
  },
];

export function initializeCategoriesWithBudget(weeklyBudget: number): Category[] {
  const percentages = {
    Food: 0.40,
    Transport: 0.20,
    Social: 0.25,
    Other: 0.15,
  };

  return defaultCategories.map(category => ({
    ...category,
    weeklyLimit: Math.round(weeklyBudget * percentages[category.name]),
  }));
}
