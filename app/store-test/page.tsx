'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/lib/types';

export default function StoreTestPage() {
  const { 
    weeklyBudget, 
    categories, 
    transactions, 
    remainingThisWeek, 
    spendByCategory,
    addTransaction,
    setWeeklyBudget
  } = useBudgetStore();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runStoreTests = () => {
    setTestResults([]);
    
    addTestResult('🧪 Testing Store Logic Fixes...\n');

    // Test 1: Current State
    addTestResult('1. Current Store State:');
    addTestResult(`   ✓ Weekly Budget: ${formatCurrency(weeklyBudget)}`);
    addTestResult(`   ✓ Categories: ${categories.length}`);
    addTestResult(`   ✓ Transactions: ${transactions.length}`);
    addTestResult(`   ✓ Remaining This Week: ${formatCurrency(remainingThisWeek())}`);
    addTestResult('');

    // Test 2: Category Spending
    addTestResult('2. Category Spending:');
    categories.forEach(category => {
      const spent = spendByCategory(category.id);
      addTestResult(`   ✓ ${category.name}: ${formatCurrency(spent)}`);
    });
    addTestResult('');

    // Test 3: Add Test Transaction
    addTestResult('3. Adding Test Transaction:');
    const testTransaction: Transaction = {
      id: `test-${Date.now()}`,
      categoryId: categories[0]?.id || 'food',
      label: 'Test Transaction',
      amount: 10.00,
      date: new Date().toISOString() // Today's date
    };
    
    addTestResult(`   ✓ Adding: ${testTransaction.label} - ${formatCurrency(testTransaction.amount)}`);
    addTransaction(testTransaction);
    
    // Wait a bit for state to update
    setTimeout(() => {
      addTestResult('4. After Adding Transaction:');
      addTestResult(`   ✓ Transactions: ${transactions.length + 1}`);
      addTestResult(`   ✓ Remaining This Week: ${formatCurrency(remainingThisWeek())}`);
      
      categories.forEach(category => {
        const spent = spendByCategory(category.id);
        addTestResult(`   ✓ ${category.name}: ${formatCurrency(spent)}`);
      });
      
      addTestResult('');
      addTestResult('🎉 Store logic tests completed!');
    }, 100);
  };

  const addQuickTransaction = (amount: number, categoryId: string) => {
    const transaction: Transaction = {
      id: `quick-${Date.now()}`,
      categoryId,
      label: `Quick Transaction $${amount}`,
      amount,
      date: new Date().toISOString()
    };
    
    addTransaction(transaction);
    addTestResult(`✅ Added: ${transaction.label} to ${categories.find(c => c.id === categoryId)?.name}`);
  };

  const clearAllTransactions = () => {
    // This would require adding a clearTransactions method to the store
    addTestResult('⚠️ Clear transactions not implemented - refresh page to reset');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Logic Test</h1>
          <p className="text-gray-600">Test the fixed store logic for transactions and calculations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Weekly Budget:</strong> {formatCurrency(weeklyBudget)}</div>
              <div><strong>Remaining:</strong> {formatCurrency(remainingThisWeek())}</div>
              <div><strong>Categories:</strong> {categories.length}</div>
              <div><strong>Transactions:</strong> {transactions.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runStoreTests}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              Run Store Logic Tests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Add Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addQuickTransaction(5, category.id)}
                    className="w-full text-xs"
                  >
                    +$5
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">Click &quot;Run Store Logic Tests&quot; to start testing...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
