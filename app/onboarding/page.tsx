'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBudgetStore } from '@/lib/store';

export default function OnboardingPage() {
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setWeeklyBudget } = useBudgetStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetAmount = parseFloat(budget);
    
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      setError('Please enter a valid budget amount greater than $0');
      return;
    }

    setWeeklyBudget(budgetAmount);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 p-6 flex flex-col justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-violet-600 mb-2">FinMate</h1>
        <p className="text-gray-600">Your personal budgeting assistant</p>
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Let&apos;s get started!</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="budget">What&apos;s your weekly budget?</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => {
                    setBudget(e.target.value);
                    setError('');
                  }}
                  className="pl-8"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-violet-600 hover:bg-violet-700"
              size="lg"
            >
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
