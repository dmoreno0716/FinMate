# Category Breakdown Testing Guide

## 🧪 Comprehensive Category Functionality Testing

### Prerequisites
- Development server running on `http://localhost:3002`
- Budget setup completed (go through onboarding first)
- Some transactions added for testing
- Modern browser with developer tools

### Automated Testing
1. **Visit Category Test Page**: Navigate to `http://localhost:3002/category-test`
2. **Run Automated Tests**: Click "Run All Category Tests" button
3. **Review Results**: Check the terminal-style output for all test results
4. **Test Specific Categories**: Use the quick access buttons to open category pages

### Manual Testing Checklist

#### 1. Navigation to Category Pages
- [ ] **From Dashboard**: Click on any category in the legend
- [ ] **Direct URL**: Navigate to `/category/food`, `/category/transport`, etc.
- [ ] **Back Button**: Click back button to return to dashboard
- [ ] **URL Structure**: Verify URLs use slugified category names

#### 2. Category Page Layout
- [ ] **Header**: Shows back button, category color chip, and category name
- [ ] **Stats Card**: Displays spent, limit, remaining in 3-column grid
- [ ] **Progress Bar**: Shows visual progress (spent/limit percentage)
- [ ] **Action Buttons**: "Add Transaction" and "Adjust Limit" buttons
- [ ] **Transaction List**: Shows filtered transactions for the category

#### 3. Stats Card Functionality
- [ ] **Spent Amount**: Shows correct total spent this week for category
- [ ] **Limit Amount**: Shows current weekly limit for category
- [ ] **Remaining Amount**: Shows limit - spent (clamped at 0)
- [ ] **Progress Bar**: Visual representation of spending progress
- [ ] **Color Coding**: Remaining amount turns red when over budget

#### 4. Add Transaction Dialog
- [ ] **Dialog Opens**: Click "Add Transaction" button
- [ ] **Preset Category**: Category is automatically set (not visible in dialog)
- [ ] **Form Fields**: Label, amount, date inputs
- [ ] **Validation**: Submit button disabled until required fields filled
- [ ] **Submit**: Transaction added, dialog closes, form resets
- [ ] **Real-time Update**: Stats update immediately after adding

#### 5. Adjust Limit Dialog
- [ ] **Dialog Opens**: Click "Adjust Limit" button
- [ ] **Current Limit**: Shows current limit as placeholder
- [ ] **Input Field**: Numeric input for new limit
- [ ] **Validation**: Submit button disabled for invalid input
- [ ] **Submit**: Limit updated, dialog closes
- [ ] **Real-time Update**: Stats update immediately after change

#### 6. Transaction List
- [ ] **Filtered Results**: Shows only transactions for this category
- [ ] **Sorting**: Transactions sorted by date (newest first)
- [ ] **Transaction Details**: Shows label, date, and amount
- [ ] **Date Format**: Dates formatted as "MMM dd, yyyy"
- [ ] **Empty State**: Shows helpful message when no transactions

#### 7. Edge Cases Testing

##### Invalid Category Slug
- [ ] **Non-existent Category**: Navigate to `/category/invalid-category`
- [ ] **404 State**: Shows friendly "Category Not Found" message
- [ ] **Back Button**: "Back to Dashboard" button works
- [ ] **Error Handling**: No console errors or crashes

##### Empty Category State
- [ ] **No Transactions**: Category with no transactions shows empty state
- [ ] **Empty State UI**: Shows icon, message, and helpful text
- [ ] **Action Buttons**: Add Transaction button still works

##### Over-budget Category
- [ ] **Exceeded Limit**: Category with spending over limit
- [ ] **Red Remaining**: Remaining amount shows in red
- [ ] **Progress Bar**: Progress bar can exceed 100%
- [ ] **No Errors**: No crashes or calculation errors

##### Zero Limit Category
- [ ] **Zero Limit**: Category with $0 weekly limit
- [ ] **Safe Calculations**: No division by zero errors
- [ ] **Progress Display**: Progress shows 0% when no spending

#### 8. State Integration
- [ ] **Dashboard Sync**: Changes reflect on home dashboard immediately
- [ ] **Donut Chart**: Category changes update the donut chart
- [ ] **Legend Updates**: Category progress bars update on dashboard
- [ ] **Persistence**: Changes persist across page refreshes
- [ ] **Cross-page Updates**: Changes in category page reflect everywhere

#### 9. Mobile Responsiveness
- [ ] **Mobile Layout**: Test on mobile viewport (375px width)
- [ ] **Touch Interactions**: All buttons and dialogs work on touch
- [ ] **Card Layout**: Stats card scales properly on small screens
- [ ] **Dialog Size**: Dialogs fit properly on mobile screens

### Browser Developer Tools Testing

#### 1. Console Errors
- [ ] Open DevTools Console
- [ ] No red error messages during category interactions
- [ ] No warnings about missing dependencies

#### 2. Network Tab
- [ ] No failed requests (should work offline)
- [ ] No unexpected network calls

#### 3. LocalStorage
- [ ] Category changes persist in localStorage
- [ ] Transaction additions persist
- [ ] Limit adjustments persist

### Performance Testing

#### 1. Page Load
- [ ] Category pages load quickly
- [ ] No lag when switching between categories
- [ ] Smooth animations and transitions

#### 2. Real-time Updates
- [ ] Stats update immediately after actions
- [ ] No lag when adding transactions
- [ ] Progress bars animate smoothly

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on macOS)
- [ ] Mobile browsers

## 🐛 Troubleshooting

### Common Issues

#### 1. Category not found
- **Cause**: Invalid slug or category deleted
- **Fix**: Check category exists in store, verify slug generation

#### 2. Stats not updating
- **Cause**: Store not properly updated
- **Fix**: Check console for errors, refresh page

#### 3. Transaction not appearing
- **Cause**: Date filtering or category mismatch
- **Fix**: Verify transaction date is within current week

#### 4. Progress bar errors
- **Cause**: Division by zero or invalid calculations
- **Fix**: Check category limit is not zero

### Debug Commands
```javascript
// In browser console
// Check store state
console.log(useBudgetStore.getState());

// Test slug generation
console.log(createSlug('Food')); // Should return 'food'

// Check category by slug
const categories = useBudgetStore.getState().categories;
const foodCategory = categories.find(cat => createSlug(cat.name) === 'food');
console.log(foodCategory);

// Check transactions for category
const transactions = useBudgetStore.getState().transactions;
const foodTransactions = transactions.filter(t => t.categoryId === 'food');
console.log(foodTransactions);
```

## ✅ Acceptance Criteria Verification

### Core Requirements
- [x] Dynamic route `[slug]` maps to category by slugified name
- [x] Header shows category name + color chip
- [x] Stats card with spent, limit, remaining, progress bar
- [x] Transaction list filtered by category (newest first)
- [x] "Add transaction" button with dialog preset for category
- [x] "Adjust limit" button with dialog and store update
- [x] Edge cases: 404 state and empty transactions

### UX/Styling Requirements
- [x] Mobile-first layout with safe-area padding
- [x] Cards with rounded-2xl
- [x] Primary actions in violet
- [x] Back button to Home (top-left)

### Integration Requirements
- [x] Updating limit persists and reflects on Home
- [x] Adding transaction updates totals everywhere
- [x] No runtime errors
- [x] Real-time state synchronization

## 🎉 Success Criteria

The implementation is successful when:
1. All automated tests pass
2. All manual tests pass
3. Category pages load correctly for all categories
4. Stats calculations are accurate
5. State integrates seamlessly with dashboard
6. Edge cases are handled gracefully
7. UI is responsive and accessible

---

**Test Environment**: Development server on http://localhost:3002
**Category Pages**: http://localhost:3002/category/[slug]
**Test Page**: http://localhost:3002/category-test
**Last Updated**: $(date)
**Test Status**: ✅ Ready for testing
