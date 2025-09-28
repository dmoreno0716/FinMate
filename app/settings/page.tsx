'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function SettingsPage() {
  const handleSignOut = () => {
    // Clear session data
    sessionStorage.removeItem('finmate_account');
    sessionStorage.removeItem('finmate_budget_store');
    
    // Redirect to welcome page
    window.location.href = '/welcome';
  };

  return (
    <div className="p-6 space-y-6 pb-20">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-500">
            <p className="text-sm mb-4">
              Your account data is stored locally in this browser session.
            </p>
          </div>
          
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Signing out will clear all your data from this session.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p className="text-sm">
              Additional settings and preferences will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
