'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend as RechartsLegend } from 'recharts';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBudgetStore } from '@/lib/store';
import { formatCurrency, createSlug } from '@/lib/utils';
import { Transaction } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { 
    weeklyBudget, 
    remainingThisWeek, 
    categories, 
    transactions, 
    addTransaction,
    spendByCategory 
  } = useBudgetStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    label: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Redirect to onboarding if no budget is set
    if (weeklyBudget === 0) {
      router.push('/onboarding');
    }
  }, [weeklyBudget, router]);

  if (weeklyBudget === 0) {
    return null; // Will redirect to onboarding
  }

  // Calculate remaining and chart data reactively
  const remaining = remainingThisWeek();
  
  // Prepare data for donut chart - this will re-calculate when transactions change
  const chartData = categories.map(category => {
    const spent = spendByCategory(category.id);
    return {
      name: category.name,
      value: spent,
      color: category.color,
      categoryId: category.id
    };
  }).filter(item => item.value > 0); // Only show categories with spending

  // Get recent transactions (latest 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleAddTransaction = () => {
    if (!newTransaction.label || !newTransaction.amount || !newTransaction.categoryId) {
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      categoryId: newTransaction.categoryId,
      label: newTransaction.label,
      amount: parseFloat(newTransaction.amount),
      date: new Date(newTransaction.date).toISOString()
    };

    addTransaction(transaction);
    
    // Reset form
    setNewTransaction({
      label: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    setIsDialogOpen(false);
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  return (
    <div className="p-6 space-y-6 pb-20">
        {/* Header with remaining amount */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You have {formatCurrency(remaining)} remaining this week
          </h1>
        </div>

        {/* Donut Chart */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-sm">No spending yet</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Legend with Progress */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Category Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => {
                const spent = spendByCategory(category.id);
                const progress = category.weeklyLimit > 0 ? (spent / category.weeklyLimit) * 100 : 0;
                
                return (
                  <Link 
                    key={category.id} 
                    href={`/category/${createSlug(category.name)}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(spent)} / {formatCurrency(category.weeklyLimit)}
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(progress, 100)} 
                      className="h-2"
                    />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const category = getCategoryById(transaction.categoryId);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category?.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{transaction.label}</div>
                          <div className="text-sm text-gray-500">{formatTransactionDate(transaction.date)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No transactions yet</p>
                <p className="text-xs mt-1">Add your first transaction to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Add Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-3">
              <Plus className="w-5 h-5 mr-2" />
              Quick Add
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="e.g., Coffee"
                  value={newTransaction.label}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, label: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTransaction.categoryId}
                  onValueChange={(value) => setNewTransaction(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleAddTransaction}
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={!newTransaction.label || !newTransaction.amount || !newTransaction.categoryId}
              >
                Add Transaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}
