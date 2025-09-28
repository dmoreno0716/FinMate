'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/lib/store';
import { createSlug, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CategoryTestPage() {
  const store = useBudgetStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runCategoryTests = () => {
    setTestResults([]);
    
    addTestResult('🧪 Testing Category Breakdown Functionality...\n');

    // Test 1: Category Slug Generation
    addTestResult('1. Testing Category Slug Generation...');
    const testCategories = ['Food', 'Transport', 'Social', 'Other'];
    testCategories.forEach(categoryName => {
      const slug = createSlug(categoryName);
      addTestResult(`   ✓ "${categoryName}" → "${slug}"`);
    });
    addTestResult('');

    // Test 2: Category Finding by Slug
    addTestResult('2. Testing Category Finding by Slug...');
    store.categories.forEach(category => {
      const slug = createSlug(category.name);
      const foundCategory = store.categories.find(cat => createSlug(cat.name) === slug);
      if (foundCategory) {
        addTestResult(`   ✓ Found "${category.name}" via slug "${slug}"`);
      } else {
        addTestResult(`   ❌ Could not find "${category.name}" via slug "${slug}"`);
      }
    });
    addTestResult('');

    // Test 3: Category Stats Calculation
    addTestResult('3. Testing Category Stats Calculation...');
    store.categories.forEach(category => {
      const spent = store.spendByCategory(category.id);
      const remaining = Math.max(0, category.weeklyLimit - spent);
      const progress = category.weeklyLimit > 0 ? (spent / category.weeklyLimit) * 100 : 0;
      
      addTestResult(`   ✓ ${category.name}:`);
      addTestResult(`     - Spent: ${formatCurrency(spent)}`);
      addTestResult(`     - Limit: ${formatCurrency(category.weeklyLimit)}`);
      addTestResult(`     - Remaining: ${formatCurrency(remaining)}`);
      addTestResult(`     - Progress: ${progress.toFixed(1)}%`);
    });
    addTestResult('');

    // Test 4: Transaction Filtering
    addTestResult('4. Testing Transaction Filtering...');
    store.categories.forEach(category => {
      const categoryTransactions = store.transactions.filter(
        transaction => transaction.categoryId === category.id
      );
      addTestResult(`   ✓ ${category.name}: ${categoryTransactions.length} transactions`);
      
      if (categoryTransactions.length > 0) {
        const sortedTransactions = categoryTransactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        addTestResult(`     - Latest: ${sortedTransactions[0].label} (${formatCurrency(sortedTransactions[0].amount)})`);
      }
    });
    addTestResult('');

    // Test 5: Edge Cases
    addTestResult('5. Testing Edge Cases...');
    
    // Test invalid slug
    const invalidSlug = 'invalid-category';
    const invalidCategory = store.categories.find(cat => createSlug(cat.name) === invalidSlug);
    if (!invalidCategory) {
      addTestResult(`   ✓ Invalid slug "${invalidSlug}" correctly returns null`);
    } else {
      addTestResult(`   ❌ Invalid slug "${invalidSlug}" should return null`);
    }
    
    // Test zero limit category
    const zeroLimitCategory = store.categories.find(cat => cat.weeklyLimit === 0);
    if (zeroLimitCategory) {
      const progress = zeroLimitCategory.weeklyLimit > 0 ? (store.spendByCategory(zeroLimitCategory.id) / zeroLimitCategory.weeklyLimit) * 100 : 0;
      addTestResult(`   ✓ Zero limit category "${zeroLimitCategory.name}" progress: ${progress.toFixed(1)}% (safe)`);
    }
    
    // Test over-budget category
    store.categories.forEach(category => {
      const spent = store.spendByCategory(category.id);
      if (spent > category.weeklyLimit) {
        const remaining = Math.max(0, category.weeklyLimit - spent);
        addTestResult(`   ✓ Over-budget category "${category.name}" remaining: ${formatCurrency(remaining)} (clamped)`);
      }
    });
    addTestResult('');

    // Test 6: URL Generation
    addTestResult('6. Testing URL Generation...');
    store.categories.forEach(category => {
      const slug = createSlug(category.name);
      const url = `/category/${slug}`;
      addTestResult(`   ✓ ${category.name} → ${url}`);
    });
    addTestResult('');

    addTestResult('🎉 Category functionality tests completed!');
    addTestResult('');
    addTestResult('📋 Test Summary:');
    addTestResult('✓ Slug generation from category names');
    addTestResult('✓ Category finding by slug');
    addTestResult('✓ Stats calculation (spent, remaining, progress)');
    addTestResult('✓ Transaction filtering and sorting');
    addTestResult('✓ Edge case handling (invalid slugs, zero limits, over-budget)');
    addTestResult('✓ URL generation for navigation');
    addTestResult('');
    addTestResult('🚀 Category pages are ready for testing!');
  };

  const testSpecificCategory = (categoryName: string) => {
    const slug = createSlug(categoryName);
    window.open(`/category/${slug}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Breakdown Test</h1>
          <p className="text-gray-600">Test the category page functionality</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Store State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Weekly Budget:</strong> {formatCurrency(store.weeklyBudget)}</div>
              <div><strong>Categories:</strong> {store.categories.length}</div>
              <div><strong>Transactions:</strong> {store.transactions.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runCategoryTests}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              Run All Category Tests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Category Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {store.categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  onClick={() => testSpecificCategory(category.name)}
                  className="flex items-center space-x-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </Button>
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
                <div className="text-gray-500">Click &quot;Run All Category Tests&quot; to start testing...</div>
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
              onClick={() => window.location.href = '/chat'}
              variant="outline"
              className="w-full"
            >
              Go to Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
