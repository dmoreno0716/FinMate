# FinMate - Budget Assistant

A mobile-first budgeting assistant built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Onboarding**: Set up your weekly budget with automatic category allocation
- **Dashboard**: View your budget overview and remaining funds
- **Categories**: Pre-configured categories (Food, Transport, Social, Other) with proportional limits

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand with localStorage persistence

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

## Onboarding Flow

1. User enters weekly budget amount
2. System automatically allocates budget across categories:
   - Food: 40%
   - Transport: 20%
   - Social: 25%
   - Other: 15%
3. Data is persisted to localStorage
4. User is redirected to dashboard

