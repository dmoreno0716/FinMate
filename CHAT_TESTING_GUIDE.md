# AI Assistant Chat Testing Guide

## 🧪 Comprehensive Chat Functionality Testing

### Prerequisites
- Development server running on `http://localhost:3002`
- Budget setup completed (go through onboarding first)
- Modern browser with developer tools

### Automated Testing
1. **Visit Chat Test Page**: Navigate to `http://localhost:3002/chat-test`
2. **Run Automated Tests**: Click "Run All Chat Tests" button
3. **Review Results**: Check the terminal-style output for all test results
4. **Test Custom Messages**: Use the input field to test specific scenarios

### Manual Testing Checklist

#### 1. Chat UI Components
- [ ] **Top App Bar**: Back button, title, home button
- [ ] **Chat Messages**: User bubbles (violet, right-aligned), assistant bubbles (white, left-aligned)
- [ ] **Input Bar**: Text field with Send button, Enter key support
- [ ] **Suggested Prompts**: 3 chips shown initially, disappear after first message
- [ ] **Quick Action Buttons**: Appear below assistant messages when available

#### 2. Basic Chat Flow
- [ ] **Welcome Message**: Shows on first load with current budget status
- [ ] **Message Sending**: Type message and press Enter or click Send
- [ ] **Loading State**: Shows bouncing dots while generating response
- [ ] **Auto-scroll**: Chat scrolls to bottom with new messages
- [ ] **Input Focus**: Input field focused on page load

#### 3. Intent Recognition Testing

##### Plan Intent
Test these messages and verify appropriate responses:
- [ ] "Plan dinner for $20 tomorrow"
- [ ] "Plan lunch for $15"
- [ ] "Plan coffee for $5"
- [ ] "Plan groceries for $50"

Expected: Responses should check budget availability and suggest actions.

##### Query Intent
Test these messages:
- [ ] "How much can I spend on Food?"
- [ ] "What's my Food budget?"
- [ ] "How much left for Transport?"
- [ ] "Check my Social budget"

Expected: Should show current spending, limits, and remaining amounts.

##### Reallocate Intent
Test these messages:
- [ ] "Reallocate $15 from Social to Food"
- [ ] "Move $10 from Transport to Food"
- [ ] "Transfer $20 from Other to Social"

Expected: Should verify available funds and offer reallocation actions.

##### Unknown Intent
Test these messages:
- [ ] "Hello, how are you?"
- [ ] "What's the weather?"
- [ ] "Help me with something else"

Expected: Should provide helpful guidance about available commands.

#### 4. Quick Action Functionality

##### Reallocate Actions
- [ ] Click "Reallocate $15 from Social to Food"
- [ ] Verify category limits update in real-time
- [ ] Check confirmation message appears
- [ ] Navigate to dashboard and verify changes persist

##### Add Transaction Actions
- [ ] Click "Add dinner to Food category"
- [ ] Verify transaction appears in recent activity
- [ ] Check remaining budget updates
- [ ] Verify transaction persists on refresh

##### Suggestion Actions
- [ ] Click any suggestion button (Plan dinner for $20, etc.)
- [ ] Verify message is sent as user message
- [ ] Check appropriate response is generated

#### 5. Edge Cases and Error Handling

##### Budget Constraints
- [ ] Try planning expense larger than remaining budget
- [ ] Try reallocating more than available in category
- [ ] Verify appropriate warnings and suggestions

##### Invalid Categories
- [ ] Ask about non-existent category
- [ ] Try reallocating to/from invalid categories
- [ ] Verify helpful error messages

##### Empty States
- [ ] Test with zero budget
- [ ] Test with no transactions
- [ ] Verify graceful handling

#### 6. State Integration
- [ ] Add transaction via chat, check dashboard updates
- [ ] Reallocate via chat, verify category limits change
- [ ] Refresh page, verify chat state resets but budget persists
- [ ] Navigate between chat and dashboard, verify consistency

#### 7. Mobile Responsiveness
- [ ] Test on mobile viewport (375px width)
- [ ] Verify chat bubbles scale properly
- [ ] Check input bar is accessible
- [ ] Test touch interactions with quick actions

### Browser Developer Tools Testing

#### 1. Console Errors
- [ ] Open DevTools Console
- [ ] No red error messages during chat interactions
- [ ] No warnings about missing dependencies

#### 2. Network Tab
- [ ] No failed API requests (should work offline)
- [ ] No unexpected network calls

#### 3. LocalStorage
- [ ] Budget data persists across refreshes
- [ ] Chat state resets (as expected)
- [ ] No chat data stored in localStorage

### Performance Testing

#### 1. Response Time
- [ ] Chat responses appear within 1-2 seconds
- [ ] No lag when typing in input field
- [ ] Smooth scrolling behavior

#### 2. Memory Usage
- [ ] No memory leaks during extended chat session
- [ ] Messages don't accumulate indefinitely

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on macOS)
- [ ] Mobile browsers

## 🐛 Troubleshooting

### Common Issues

#### 1. Chat not responding
- **Cause**: Store not properly initialized
- **Fix**: Complete onboarding first, ensure budget is set

#### 2. Quick actions not working
- **Cause**: Store update functions not available
- **Fix**: Check console for errors, refresh page

#### 3. Intent not recognized
- **Cause**: Message doesn't match expected patterns
- **Fix**: Use suggested prompts or try rephrasing

#### 4. State not syncing
- **Cause**: Store updates not triggering re-renders
- **Fix**: Check store implementation, refresh page

### Debug Commands
```javascript
// In browser console
// Check store state
console.log(useBudgetStore.getState());

// Test intent parsing
console.log(parseIntent("Plan dinner for $20"));

// Test response generation
const snapshot = createStoreSnapshot(useBudgetStore.getState());
const responses = simulateAdvice("Plan dinner for $20", snapshot);
console.log(responses);
```

## ✅ Acceptance Criteria Verification

### Core Requirements
- [x] Works offline (no API key required)
- [x] Local rule-based simulator by default
- [x] Optional OpenAI path if API key present
- [x] Natural language parsing for common intents
- [x] Deterministic responses from store snapshot
- [x] Conversation kept in page state (no server)

### Data + Logic Requirements
- [x] `/lib/ai.ts` with `simulateAdvice` function
- [x] Intent parsing for plan, reallocate, query
- [x] Structured chat turns with quick actions
- [x] Store snapshot helper for deterministic responses
- [x] Optional OpenAI integration (guarded by env var)

### UI Requirements
- [x] Vertical scroll chat with bubbles
- [x] User bubble: right-aligned, violet background, white text
- [x] Assistant bubble: left-aligned, neutral background
- [x] Input bar fixed at bottom with text field + Send button
- [x] Top app bar with back/home icons
- [x] Suggested prompts as chips above input
- [x] Quick action buttons rendered inline

### Quick Actions
- [x] Reallocate buttons update store and UI
- [x] Add transaction buttons create real transactions
- [x] Suggestion buttons send messages
- [x] All actions provide feedback

### Integration
- [x] Changes reflect in Home dashboard
- [x] State persists across refreshes
- [x] No console errors
- [x] Mobile-responsive design

## 🎉 Success Criteria

The implementation is successful when:
1. All automated tests pass
2. All manual tests pass
3. Intent recognition works for common phrases
4. Quick actions update store correctly
5. UI is responsive and accessible
6. Works completely offline
7. State integrates with dashboard

---

**Test Environment**: Development server on http://localhost:3002
**Chat Page**: http://localhost:3002/chat
**Test Page**: http://localhost:3002/chat-test
**Last Updated**: $(date)
**Test Status**: ✅ Ready for testing
