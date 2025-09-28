'use client';

import { useBudgetStore } from '@/lib/store';
import { formatCurrency, getThisWeekTransactions } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const { 
    weeklyBudget, 
    categories, 
    transactions, 
    remainingThisWeek, 
    spendByCategory,
    addTransaction
  } = useBudgetStore();

  // Debug current week calculation
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const thisWeekTransactions = getThisWeekTransactions(transactions);

  const addTestTransaction = () => {
    const testTransaction = {
      id: `debug-${Date.now()}`,
      categoryId: categories[0]?.id || 'food',
      label: 'Debug Test',
      amount: 15.00,
      date: new Date().toISOString()
    };
    
    console.log('Adding transaction:', testTransaction);
    addTransaction(testTransaction);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Debug Store State</h1>
          <p className="text-gray-600">Debug the store logic and date filtering</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Week Calculation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Today:</strong> {today.toLocaleDateString()}</div>
              <div><strong>Day of Week:</strong> {dayOfWeek} (0=Sunday, 1=Monday)</div>
              <div><strong>Week Start (Monday):</strong> {monday.toLocaleDateString()}</div>
              <div><strong>Week End (Sunday):</strong> {sunday.toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Weekly Budget:</strong> {formatCurrency(weeklyBudget)}</div>
              <div><strong>Total Transactions:</strong> {transactions.length}</div>
              <div><strong>This Week Transactions:</strong> {thisWeekTransactions.length}</div>
              <div><strong>Remaining This Week:</strong> {formatCurrency(remainingThisWeek())}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
              {transactions.map((transaction, index) => {
                const transactionDate = new Date(transaction.date);
                const isThisWeek = thisWeekTransactions.includes(transaction);
                return (
                  <div key={index} className={`p-2 rounded ${isThisWeek ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div><strong>{transaction.label}</strong> - {formatCurrency(transaction.amount)}</div>
                    <div className="text-xs text-gray-600">
                      Date: {transactionDate.toLocaleDateString()} | 
                      Category: {categories.find(c => c.id === transaction.categoryId)?.name} |
                      {isThisWeek ? ' ✅ This Week' : ' ❌ Not This Week'}
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <div className="text-gray-500 text-center py-4">No transactions yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {categories.map(category => {
                const spent = spendByCategory(category.id);
                return (
                  <div key={category.id} className="flex justify-between">
                    <span>{category.name}:</span>
                    <span>{formatCurrency(spent)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <button 
              onClick={addTestTransaction}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Test Transaction (Today)
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
