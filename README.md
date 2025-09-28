# FinMate - Budget Assistant

A mobile-first budgeting assistant built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Onboarding**: Set up your weekly budget with automatic category allocation
- **Dashboard**: View your budget overview and remaining funds
- **Categories**: Pre-configured categories (Food, Transport, Social, Other) with proportional limits
- **Persistence**: All data is stored in localStorage for offline access
- **Mobile-First**: Optimized for mobile devices with a clean, modern UI

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand with localStorage persistence
- **Icons**: Lucide React
- **Charts**: Recharts (for future use)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
finmate/
├── app/
│   ├── chat/page.tsx          # Chat placeholder
│   ├── category/[slug]/page.tsx # Category details placeholder
│   ├── onboarding/page.tsx    # Budget setup screen
│   ├── settings/page.tsx      # Settings placeholder
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Dashboard
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── NavBar.tsx             # Bottom navigation
├── lib/
│   ├── types.ts               # TypeScript type definitions
│   ├── store.ts               # Zustand store
│   ├── utils.ts               # Utility functions
│   └── seed.ts                # Default data
└── package.json
```

## Data Model

### Category
```typescript
{
  id: string;
  name: "Food" | "Transport" | "Social" | "Other";
  color: string;
  weeklyLimit: number;
}
```

### Transaction
```typescript
{
  id: string;
  categoryId: string;
  label: string;
  amount: number;
  date: string; // ISO string
}
```

### Budget Store
The Zustand store manages:
- Weekly budget amount
- Category configurations
- Transaction history
- Derived calculations (remaining budget, spending by category)

## Onboarding Flow

1. User enters weekly budget amount
2. System automatically allocates budget across categories:
   - Food: 40%
   - Transport: 20%
   - Social: 25%
   - Other: 15%
3. Data is persisted to localStorage
4. User is redirected to dashboard

## Future Features

- Transaction tracking and management
- Category customization
- Spending analytics and charts
- AI-powered budgeting advice
- Export/import functionality
