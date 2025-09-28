'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
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

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { 
    categories, 
    transactions, 
    spendByCategory, 
    addTransaction,
    updateCategoryLimit 
  } = useBudgetStore();

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    label: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newLimit, setNewLimit] = useState('');

  // Find category by slug
  const category = categories.find(cat => createSlug(cat.name) === params.slug);

  // If category not found, show 404 state
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
            <p className="text-gray-600 mb-6">
              The category &quot;{params.slug}&quot; doesn&apos;t exist. It might have been deleted or renamed.
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/')}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Calculate category stats
  const spent = spendByCategory(category.id);
  const remaining = Math.max(0, category.weeklyLimit - spent);
  const progress = category.weeklyLimit > 0 ? (spent / category.weeklyLimit) * 100 : 0;

  // Get transactions for this category (newest first)
  const categoryTransactions = transactions
    .filter(transaction => transaction.categoryId === category.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddTransaction = () => {
    if (!newTransaction.label || !newTransaction.amount) {
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      categoryId: category.id,
      label: newTransaction.label,
      amount: parseFloat(newTransaction.amount),
      date: new Date(newTransaction.date).toISOString()
    };

    addTransaction(transaction);
    
    // Reset form
    setNewTransaction({
      label: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    setIsTransactionDialogOpen(false);
  };

  const handleUpdateLimit = () => {
    if (!newLimit || isNaN(parseFloat(newLimit))) {
      return;
    }

    updateCategoryLimit(category.id, parseFloat(newLimit));
    setNewLimit('');
    setIsLimitDialogOpen(false);
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6 pb-20">
        {/* Header with back button */}
        <div className="flex items-center space-x-3 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: category.color }}
            />
            <h1 className="text-xl font-bold text-gray-900">{category.name}</h1>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">This Week&apos;s Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(spent)}
                  </div>
                  <div className="text-sm text-gray-600">Spent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(category.weeklyLimit)}
                  </div>
                  <div className="text-sm text-gray-600">Limit</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${remaining > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {formatCurrency(remaining)}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900 font-medium">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(progress, 100)} 
                  className="h-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-3">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add Transaction to {category.name}</DialogTitle>
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
                  disabled={!newTransaction.label || !newTransaction.amount}
                >
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-2xl py-3">
                <Settings className="w-4 h-4 mr-2" />
                Adjust Limit
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Adjust {category.name} Limit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="limit">Weekly Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    placeholder={category.weeklyLimit.toString()}
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Current limit: {formatCurrency(category.weeklyLimit)}
                </div>
                <Button 
                  onClick={handleUpdateLimit}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  disabled={!newLimit || isNaN(parseFloat(newLimit))}
                >
                  Update Limit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transaction List */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryTransactions.length > 0 ? (
              <div className="space-y-3">
                {categoryTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{transaction.label}</div>
                      <div className="text-sm text-gray-500">{formatTransactionDate(transaction.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <p className="text-sm font-medium mb-1">No transactions yet</p>
                <p className="text-xs">Add your first {category.name.toLowerCase()} transaction to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
