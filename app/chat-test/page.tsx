'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/lib/store';
import { 
  simulateAdvice, 
  createStoreSnapshot, 
  parseIntent 
} from '@/lib/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

export default function ChatTestPage() {
  const store = useBudgetStore();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runChatTests = () => {
    setTestResults([]);
    
    addTestResult('🧪 Testing AI Chat Functionality...\n');

    // Test 1: Intent Parsing
    addTestResult('1. Testing Intent Parsing...');
    
    const testMessages = [
      'Plan dinner for $20 tomorrow',
      'How much can I spend on Food?',
      'Reallocate $15 from Social to Food',
      'Move $10 from Transport to Food',
      'What\'s my Food budget?',
      'Random message that doesn\'t match'
    ];

    testMessages.forEach(message => {
      const intent = parseIntent(message);
      addTestResult(`   ✓ "${message}" → ${intent.intent}`);
      if (intent.data) {
        addTestResult(`     Data: ${JSON.stringify(intent.data)}`);
      }
    });
    addTestResult('');

    // Test 2: Store Snapshot
    addTestResult('2. Testing Store Snapshot...');
    try {
      const snapshot = createStoreSnapshot(store);
      addTestResult(`   ✓ Weekly Budget: ${formatCurrency(snapshot.weeklyBudget)}`);
      addTestResult(`   ✓ Categories: ${snapshot.categories.length}`);
      addTestResult(`   ✓ Transactions: ${snapshot.transactions.length}`);
      addTestResult(`   ✓ Remaining: ${formatCurrency(snapshot.remainingThisWeek)}`);
    } catch (error) {
      addTestResult(`   ❌ Error creating snapshot: ${error}`);
    }
    addTestResult('');

    // Test 3: Plan Intent Response
    addTestResult('3. Testing Plan Intent...');
    try {
      const snapshot = createStoreSnapshot(store);
      const responses = simulateAdvice('Plan dinner for $20 tomorrow', snapshot);
      responses.forEach(response => {
        addTestResult(`   ✓ Response: ${response.role}`);
        addTestResult(`   ✓ Text: ${response.text.substring(0, 100)}...`);
        if (response.quickActions) {
          addTestResult(`   ✓ Quick Actions: ${response.quickActions.length}`);
        }
      });
    } catch (error) {
      addTestResult(`   ❌ Error: ${error}`);
    }
    addTestResult('');

    // Test 4: Query Intent Response
    addTestResult('4. Testing Query Intent...');
    try {
      const snapshot = createStoreSnapshot(store);
      const responses = simulateAdvice('How much can I spend on Food?', snapshot);
      responses.forEach(response => {
        addTestResult(`   ✓ Response: ${response.role}`);
        addTestResult(`   ✓ Text: ${response.text.substring(0, 100)}...`);
      });
    } catch (error) {
      addTestResult(`   ❌ Error: ${error}`);
    }
    addTestResult('');

    // Test 5: Reallocate Intent Response
    addTestResult('5. Testing Reallocate Intent...');
    try {
      const snapshot = createStoreSnapshot(store);
      const responses = simulateAdvice('Reallocate $15 from Social to Food', snapshot);
      responses.forEach(response => {
        addTestResult(`   ✓ Response: ${response.role}`);
        addTestResult(`   ✓ Text: ${response.text.substring(0, 100)}...`);
        if (response.quickActions) {
          addTestResult(`   ✓ Quick Actions: ${response.quickActions.length}`);
        }
      });
    } catch (error) {
      addTestResult(`   ❌ Error: ${error}`);
    }
    addTestResult('');

    // Test 6: Unknown Intent Response
    addTestResult('6. Testing Unknown Intent...');
    try {
      const snapshot = createStoreSnapshot(store);
      const responses = simulateAdvice('Hello, how are you?', snapshot);
      responses.forEach(response => {
        addTestResult(`   ✓ Response: ${response.role}`);
        addTestResult(`   ✓ Text: ${response.text.substring(0, 100)}...`);
        if (response.quickActions) {
          addTestResult(`   ✓ Quick Actions: ${response.quickActions.length}`);
        }
      });
    } catch (error) {
      addTestResult(`   ❌ Error: ${error}`);
    }
    addTestResult('');

    addTestResult('🎉 Chat functionality tests completed!');
  };

  const testCustomMessage = () => {
    if (!customMessage.trim()) return;
    
    addTestResult(`\n🔍 Testing Custom Message: "${customMessage}"`);
    try {
      const snapshot = createStoreSnapshot(store);
      const responses = simulateAdvice(customMessage, snapshot);
      responses.forEach(response => {
        addTestResult(`   ✓ Response: ${response.role}`);
        addTestResult(`   ✓ Text: ${response.text}`);
        if (response.quickActions) {
          addTestResult(`   ✓ Quick Actions: ${response.quickActions.map(a => a.label).join(', ')}`);
        }
      });
    } catch (error) {
      addTestResult(`   ❌ Error: ${error}`);
    }
    setCustomMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Chat Test</h1>
          <p className="text-gray-600">Test the AI assistant functionality</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Store State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Weekly Budget:</strong> {formatCurrency(store.weeklyBudget)}</div>
              <div><strong>Remaining:</strong> {formatCurrency(store.remainingThisWeek())}</div>
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
              onClick={runChatTests}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              Run All Chat Tests
            </Button>
            
            <div className="flex space-x-2">
              <Input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Test a custom message..."
                className="flex-1"
              />
              <Button 
                onClick={testCustomMessage}
                disabled={!customMessage.trim()}
                variant="outline"
              >
                Test
              </Button>
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
                <div className="text-gray-500">Click &quot;Run All Chat Tests&quot; to start testing...</div>
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
              onClick={() => window.location.href = '/chat'}
              className="w-full"
            >
              Go to Chat
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
