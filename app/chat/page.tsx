'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBudgetStore } from '@/lib/store';
import { 
  simulateAdvice, 
  createStoreSnapshot, 
  ChatTurn, 
  QuickAction 
} from '@/lib/ai';
import { formatCurrency } from '@/lib/utils';

export default function ChatPage() {
  const router = useRouter();
  const { 
    weeklyBudget, 
    categories, 
    transactions, 
    remainingThisWeek, 
    spendByCategory,
    addTransaction,
    updateCategoryLimit 
  } = useBudgetStore();

  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Add welcome message if no messages
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        text: `Hi! I'm your budget assistant. I can help you plan expenses, reallocate money between categories, and check your budget status.\n\nYou have ${formatCurrency(remainingThisWeek())} remaining this week. How can I help?`,
        quickActions: [
          {
            label: 'Plan dinner for $20',
            action: 'suggest_plan',
            data: { amount: 20, category: 'Food' }
          },
          {
            label: 'Check Food budget',
            action: 'suggest_query',
            data: { category: 'Food' }
          },
          {
            label: 'Show my categories',
            action: 'show_categories',
            data: {}
          }
        ]
      }]);
    }
  }, [messages.length, remainingThisWeek]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatTurn = {
      role: 'user',
      text: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create snapshot of current store state
      const storeSnapshot = useBudgetStore.getState();
      const snapshot = createStoreSnapshot(storeSnapshot);

      // Generate response using local simulator
      const responses = simulateAdvice(userMessage.text, snapshot);
      
      // Add responses with a small delay for better UX
      for (const response of responses) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setMessages(prev => [...prev, response]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    switch (action.action) {
      case 'reallocate':
        const { amount, fromCategory, toCategory } = action.data;
        const fromCat = categories.find(c => c.id === fromCategory);
        const toCat = categories.find(c => c.id === toCategory);
        
        if (fromCat && toCat) {
          const newFromLimit = fromCat.weeklyLimit - amount;
          const newToLimit = toCat.weeklyLimit + amount;
          
          updateCategoryLimit(fromCategory, newFromLimit);
          updateCategoryLimit(toCategory, newToLimit);
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            text: `✅ Done! I've reallocated ${formatCurrency(amount)} from ${fromCat.name} to ${toCat.name}. Your ${fromCat.name} limit is now ${formatCurrency(newFromLimit)} and your ${toCat.name} limit is now ${formatCurrency(newToLimit)}.`
          }]);
        }
        break;
        
      case 'add_planned_transaction':
        const { thing, amount: transactionAmount, categoryId } = action.data;
        const transaction = {
          id: Date.now().toString(),
          categoryId,
          label: thing,
          amount: transactionAmount,
          date: new Date().toISOString()
        };
        
        addTransaction(transaction);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `✅ Added "${thing}" for ${formatCurrency(transactionAmount)} to your transactions. You now have ${formatCurrency(remainingThisWeek())} remaining this week.`
        }]);
        break;
        
      case 'suggest_plan':
      case 'suggest_query':
      case 'suggest_reallocate':
      case 'suggest_amount':
      case 'show_categories':
        // These are suggestions, not actions - just add the message
        const suggestionMessage = action.label;
        setMessages(prev => [...prev, {
          role: 'user',
          text: suggestionMessage
        }]);
        
        // Generate response for the suggestion
        const storeSnapshot = useBudgetStore.getState();
        const snapshot = createStoreSnapshot(storeSnapshot);
        
        const responses = simulateAdvice(suggestionMessage, snapshot);
        for (const response of responses) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setMessages(prev => [...prev, response]);
        }
        break;
        
      default:
        console.log('Unknown action:', action.action);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    'Plan dinner for $20 tomorrow',
    'How much can I spend on Food?',
    'Reallocate $15 from Social to Food'
  ];

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top App Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          className="h-8 w-8"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.text}</div>
              
              {/* Quick Actions */}
              {message.quickActions && message.quickActions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.quickActions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className={`text-xs ${
                        message.role === 'user'
                          ? 'bg-white text-violet-600 border-white hover:bg-gray-100'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedPrompt(prompt)}
                className="text-xs bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your budget..."
            className="flex-1 rounded-2xl"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
