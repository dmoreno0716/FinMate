import { BudgetStore, Category, Transaction } from './types';

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
  quickActions?: QuickAction[];
}

export interface QuickAction {
  label: string;
  action: string;
  data?: any;
}

export interface BudgetStoreSnapshot {
  weeklyBudget: number;
  categories: Category[];
  transactions: Transaction[];
  remainingThisWeek: number;
  spendByCategory: (categoryId: string) => number;
}

// Helper function to create a snapshot of the store for deterministic responses
export function createStoreSnapshot(store: BudgetStore): BudgetStoreSnapshot {
  return {
    weeklyBudget: store.weeklyBudget,
    categories: store.categories,
    transactions: store.transactions,
    remainingThisWeek: store.remainingThisWeek(),
    spendByCategory: store.spendByCategory.bind(store)
  };
}

// Parse user intent from natural language
export function parseIntent(message: string): {
  intent: 'plan' | 'reallocate' | 'query' | 'unknown';
  data?: any;
} {
  const lowerMessage = message.toLowerCase().trim();
  
  // Plan intent: "plan dinner for $20 tomorrow", "plan lunch for $15"
  const planMatch = lowerMessage.match(/plan\s+(.+?)\s+for\s+\$?(\d+(?:\.\d{2})?)/);
  if (planMatch) {
    return {
      intent: 'plan',
      data: {
        thing: planMatch[1].trim(),
        amount: parseFloat(planMatch[2])
      }
    };
  }
  
  // Reallocate intent: "reallocate $15 from social to food", "move $10 from transport to food"
  const reallocateMatch = lowerMessage.match(/(?:reallocate|move|transfer)\s+\$?(\d+(?:\.\d{2})?)\s+from\s+(.+?)\s+to\s+(.+)/);
  if (reallocateMatch) {
    return {
      intent: 'reallocate',
      data: {
        amount: parseFloat(reallocateMatch[1]),
        fromCategory: reallocateMatch[2].trim(),
        toCategory: reallocateMatch[3].trim()
      }
    };
  }
  
  // Query intent: "how much can I spend on food?", "what's my food budget?"
  const queryMatch = lowerMessage.match(/how\s+much\s+can\s+I\s+spend\s+on\s+(.+?)\?|what'?s\s+my\s+(.+?)\s+budget\?|how\s+much\s+left\s+for\s+(.+?)\?/);
  if (queryMatch) {
    const category = queryMatch[1] || queryMatch[2] || queryMatch[3];
    return {
      intent: 'query',
      data: {
        category: category.trim()
      }
    };
  }
  
  return { intent: 'unknown' };
}

// Find category by name (fuzzy matching)
function findCategoryByName(categories: Category[], name: string): Category | null {
  const lowerName = name.toLowerCase();
  
  // Exact match first
  let category = categories.find(cat => cat.name.toLowerCase() === lowerName);
  if (category) return category;
  
  // Fuzzy matching for common variations
  const variations: { [key: string]: string[] } = {
    'food': ['dinner', 'lunch', 'breakfast', 'snack', 'snacks', 'meal', 'meals', 'eating', 'restaurant', 'cafe', 'coffee'],
    'transport': ['transportation', 'travel', 'traveling', 'uber', 'lyft', 'bus', 'train', 'gas', 'fuel'],
    'social': ['socializing', 'entertainment', 'party', 'parties', 'friends', 'date', 'dating'],
    'other': ['misc', 'miscellaneous', 'general', 'stuff', 'things', 'shopping', 'personal']
  };
  
  for (const [categoryName, keywords] of Object.entries(variations)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      category = categories.find(cat => cat.name.toLowerCase() === categoryName);
      if (category) return category;
    }
  }
  
  return null;
}

// Generate response for plan intent
function generatePlanResponse(data: any, snapshot: BudgetStoreSnapshot): ChatTurn {
  const { thing, amount } = data;
  const remaining = snapshot.remainingThisWeek;
  
  if (amount > remaining) {
    return {
      role: 'assistant',
      text: `I'd love to help you plan ${thing} for $${amount.toFixed(2)}, but you only have $${remaining.toFixed(2)} remaining this week. Here are some suggestions:\n\n• Reduce the budget to $${remaining.toFixed(2)}\n• Wait until next week when your budget resets\n• Reallocate money from other categories`,
      quickActions: [
        {
          label: `Plan ${thing} for $${remaining.toFixed(2)}`,
          action: 'suggest_amount',
          data: { thing, amount: remaining }
        },
        {
          label: 'Reallocate $15 from Social to Food',
          action: 'suggest_reallocate',
          data: { amount: 15, fromCategory: 'Social', toCategory: 'Food' }
        }
      ]
    };
  }
  
  const foodCategory = findCategoryByName(snapshot.categories, 'food');
  if (foodCategory) {
    const foodSpent = snapshot.spendByCategory(foodCategory.id);
    const foodRemaining = foodCategory.weeklyLimit - foodSpent;
    
    if (amount > foodRemaining) {
      return {
        role: 'assistant',
        text: `Great idea to plan ${thing} for $${amount.toFixed(2)}! However, you only have $${foodRemaining.toFixed(2)} left in your Food budget this week. You could:\n\n• Use $${foodRemaining.toFixed(2)} from Food and $${(amount - foodRemaining).toFixed(2)} from other categories\n• Reallocate some money to Food first`,
        quickActions: [
          {
            label: `Use $${foodRemaining.toFixed(2)} from Food`,
            action: 'suggest_amount',
            data: { thing, amount: foodRemaining }
          },
          {
            label: 'Reallocate $20 to Food',
            action: 'suggest_reallocate',
            data: { amount: 20, fromCategory: 'Social', toCategory: 'Food' }
          }
        ]
      };
    }
  }
  
  return {
    role: 'assistant',
    text: `Perfect! You can definitely plan ${thing} for $${amount.toFixed(2)}. You have $${remaining.toFixed(2)} remaining this week, so this fits well within your budget. I recommend adding this as a planned expense to track it properly.`,
    quickActions: [
      {
        label: `Add ${thing} to Food category`,
        action: 'add_planned_transaction',
        data: { thing, amount, categoryId: foodCategory?.id || 'food' }
      }
    ]
  };
}

// Generate response for reallocate intent
function generateReallocateResponse(data: any, snapshot: BudgetStoreSnapshot): ChatTurn {
  const { amount, fromCategory, toCategory } = data;
  
  const fromCat = findCategoryByName(snapshot.categories, fromCategory);
  const toCat = findCategoryByName(snapshot.categories, toCategory);
  
  if (!fromCat) {
    return {
      role: 'assistant',
      text: `I couldn't find a category matching "${fromCategory}". Your categories are: ${snapshot.categories.map(c => c.name).join(', ')}.`,
      quickActions: [
        {
          label: 'Show my categories',
          action: 'show_categories',
          data: {}
        }
      ]
    };
  }
  
  if (!toCat) {
    return {
      role: 'assistant',
      text: `I couldn't find a category matching "${toCategory}". Your categories are: ${snapshot.categories.map(c => c.name).join(', ')}.`,
      quickActions: [
        {
          label: 'Show my categories',
          action: 'show_categories',
          data: {}
        }
      ]
    };
  }
  
  const fromSpent = snapshot.spendByCategory(fromCat.id);
  const fromRemaining = fromCat.weeklyLimit - fromSpent;
  
  if (amount > fromRemaining) {
    return {
      role: 'assistant',
      text: `You can't reallocate $${amount.toFixed(2)} from ${fromCat.name} because you only have $${fromRemaining.toFixed(2)} remaining in that category. You've already spent $${fromSpent.toFixed(2)} of your $${fromCat.weeklyLimit.toFixed(2)} limit.`,
      quickActions: [
        {
          label: `Reallocate $${fromRemaining.toFixed(2)} instead`,
          action: 'reallocate',
          data: { amount: fromRemaining, fromCategory: fromCat.id, toCategory: toCat.id }
        }
      ]
    };
  }
  
  return {
    role: 'assistant',
    text: `Great idea! I can help you reallocate $${amount.toFixed(2)} from ${fromCat.name} to ${toCat.name}. This will give you more flexibility in your ${toCat.name} budget.`,
    quickActions: [
      {
        label: `Reallocate $${amount.toFixed(2)} from ${fromCat.name} to ${toCat.name}`,
        action: 'reallocate',
        data: { amount, fromCategory: fromCat.id, toCategory: toCat.id }
      }
    ]
  };
}

// Generate response for query intent
function generateQueryResponse(data: any, snapshot: BudgetStoreSnapshot): ChatTurn {
  const { category } = data;
  const cat = findCategoryByName(snapshot.categories, category);
  
  if (!cat) {
    return {
      role: 'assistant',
      text: `I couldn't find a category matching "${category}". Your categories are: ${snapshot.categories.map(c => c.name).join(', ')}.`,
      quickActions: [
        {
          label: 'Show my categories',
          action: 'show_categories',
          data: {}
        }
      ]
    };
  }
  
  const spent = snapshot.spendByCategory(cat.id);
  const remaining = cat.weeklyLimit - spent;
  const percentage = cat.weeklyLimit > 0 ? (spent / cat.weeklyLimit) * 100 : 0;
  
  return {
    role: 'assistant',
    text: `Here's your ${cat.name} budget status:\n\n• Weekly limit: $${cat.weeklyLimit.toFixed(2)}\n• Spent so far: $${spent.toFixed(2)} (${percentage.toFixed(1)}%)\n• Remaining: $${remaining.toFixed(2)}\n\nYou can spend up to $${remaining.toFixed(2)} more on ${cat.name} this week.`,
    quickActions: [
      {
        label: `Plan something for $${Math.min(remaining, 25).toFixed(2)}`,
        action: 'suggest_plan',
        data: { amount: Math.min(remaining, 25), category: cat.name }
      }
    ]
  };
}

// Main simulation function
export function simulateAdvice(message: string, snapshot: BudgetStoreSnapshot): ChatTurn[] {
  const intent = parseIntent(message);
  
  let response: ChatTurn;
  
  switch (intent.intent) {
    case 'plan':
      response = generatePlanResponse(intent.data, snapshot);
      break;
    case 'reallocate':
      response = generateReallocateResponse(intent.data, snapshot);
      break;
    case 'query':
      response = generateQueryResponse(intent.data, snapshot);
      break;
    default:
      response = {
        role: 'assistant',
        text: `I understand you want help with budgeting! I can help you:\n\n• Plan expenses: "Plan dinner for $20 tomorrow"\n• Reallocate money: "Reallocate $15 from Social to Food"\n• Check budgets: "How much can I spend on Food?"\n\nWhat would you like to do?`,
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
      };
  }
  
  return [response];
}

// Optional OpenAI integration
export async function callOpenAI(message: string, snapshot: BudgetStoreSnapshot): Promise<string> {
  // Only use OpenAI if the API key is present
  if (!process.env.NEXT_PUBLIC_OPENAI_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful budget assistant. The user has a weekly budget of $${snapshot.weeklyBudget} with these categories: ${snapshot.categories.map(c => `${c.name} ($${c.weeklyLimit})`).join(', ')}. They have $${snapshot.remainingThisWeek} remaining this week. Keep responses concise and helpful.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
