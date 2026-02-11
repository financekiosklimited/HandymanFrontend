# Component Testing Guide

This guide explains how to run and write tests for the SolutionBank React Native Expo app.

## Quick Start

### Run All Tests
```bash
cd frontend/apps/expo
yarn test
```

### Run Tests in Watch Mode
```bash
cd frontend/apps/expo
yarn test:watch
```

### Run Specific Test File
```bash
cd frontend/apps/expo
yarn test packages/api/src/utils/__tests__/time.test.ts
```

## Current Test Coverage - 367 Tests Passing! 🎉

### Time Utilities (79 tests)
**Files:**
- `packages/api/src/utils/__tests__/time.test.ts` (23 tests)
- `packages/api/src/utils/__tests__/time-comprehensive.test.ts` (56 tests)

Tests for time-related functions:
- `getTimeRemaining()` - Calculate time remaining until expiry
- `formatTimeRemaining()` - Format as human-readable string
- `getTimeUrgency()` - Get urgency level for UI coloring
- `formatOfferDate()` - Format date for display
- `formatPreferredStartDate()` - Format preferred start date

**Comprehensive Tests:**
- Edge cases (0ms, exact boundaries, far future)
- Input validation (null, undefined, invalid dates)
- Boundary testing (exactly 2h, 24h, etc.)
- Time formatting (seconds, minutes, hours, days)

### Error Formatting (110 tests)
**Files:**
- `packages/api/src/__tests__/errors.test.ts` (21 tests)
- `packages/api/src/__tests__/errors-comprehensive.test.ts` (89 tests)

Tests for error handling:
- `formatErrorMessage()` - Format errors for user display
  - HTTP status codes (4xx, 5xx)
  - Network errors (connection, DNS, timeout)
  - All JavaScript error types
  - URL stripping (http/https with ports, paths, params)
  - Primitive types (strings, numbers, booleans, null, undefined, symbols, BigInt)
  - Complex objects (arrays, functions, Dates, Maps, Sets)
  - Special characters (unicode, emojis, newlines)
- `formatValidationError()` - Extract validation errors
  - Field mapping (snake_case to Title Case)
  - Nested error structures
  - Edge cases (null, undefined, empty)

### Dev Flags (8 tests)
**File:** `packages/app/utils/__tests__/dev-flags.test.ts`

Tests for developer flags:
- `isDevFlagEnabled()` - Check if dev flag is enabled
- `setDevFlag()` - Enable/disable dev flags
- `DEV_FLAGS` constant values

### Onboarding Storage (13 tests)
**File:** `packages/app/utils/__tests__/onboarding-storage.test.ts`

Tests for onboarding toast tracking:
- `hasSeenOnboarding()` - Check if onboarding was shown
- `shouldShowOnboarding()` - Check if should show (respects dev flags)
- `markOnboardingSeen()` - Mark as shown
- `resetAllOnboarding()` - Reset all flags
- `resetOnboarding()` - Reset specific flag

### Notification Storage (15 tests)
**File:** `packages/app/utils/__tests__/notification-toast-storage.test.ts`

Tests for notification toast tracking:
- `hasNotificationToastBeenShown()` - Check if toast was shown
- `markNotificationToastAsShown()` - Mark as shown
- `clearNotificationToastTracking()` - Clear tracking
- `pickRandomNotification()` - Pick random from array
- `shouldShowNoApplicantsToast()` - Check 48h threshold

### Advanced AsyncStorage (35 tests) ⭐ NEW
**File:** `packages/app/utils/__tests__/asyncstorage-advanced.test.ts`

**Concurrent Operations:**
- Multiple simultaneous reads/writes
- Read while writing
- Rapid successive operations (100+ ops)
- Mixed read/write operations
- multiSet/multiGet operations

**Error Scenarios:**
- Quota exceeded errors
- Random storage failures
- Intermittent failures
- Data corruption
- Recovery after failure

**Data Integrity:**
- Large values (100KB strings)
- Special characters in keys (spaces, newlines, emojis)
- Unicode values (multiple languages)
- Empty strings vs null
- Boolean-like strings
- JSON objects
- Many keys (500+)

**Migration & Edge Cases:**
- Missing keys
- Key overwrites
- Key deletion
- multiRemove
- Null characters
- Very long keys

**Real-world Scenarios:**
- Token storage/retrieval
- User preferences persistence
- Onboarding state tracking
- Cache expiration simulation
- Notification tracking for many jobs
- Atomic update simulation

### Toast Messages (58 tests)
**Files:**
- `packages/app/utils/__tests__/toast-messages.test.ts` (12 tests)
- `packages/app/utils/__tests__/toast-messages-comprehensive.test.ts` (46 tests)

Tests for core toast functions:
- `showSuccessToast()` - Success notifications
- `showErrorToast()` - Error notifications
- `showNetworkErrorToast()` - Network error
- `showRateLimitToast()` - Rate limiting
- `showSessionExpiredToast()` - Session expired

**Comprehensive Tests:**
- All toast categories (Jobs, Applications, Work Sessions, Completion)
- Direct Offers (Sent, Accepted, Declined)
- Network states (Offline, Online, Rate limiting)
- Upload progress tracking
- Auth notifications (Password, Phone, Profile)
- Consistency checks (all success/error toasts use correct variants)

### UI Components (7 tests)
**Files:**
- `packages/ui/src/__tests__/simple.test.ts` (2 tests)
- `packages/ui/src/__tests__/tamagui-import.test.tsx` (1 test)
- `packages/ui/src/__tests__/forminput-import.test.tsx` (1 test)
- `packages/ui/src/__tests__/forminput.test.tsx` (3 tests)

### Custom Hooks (4 tests)
**File:** `packages/app/hooks/__tests__/hooks-imports.test.ts`

Import tests for:
- useDebounce
- useNavigationGuard
- useToastFromParams

### Utility Imports (4 tests)
**File:** `packages/app/utils/__tests__/utils-imports.test.ts`

Import tests for utility modules.

### API Hooks (24 tests)
**File:** `packages/api/src/hooks/__tests__/api-hooks-imports.test.ts`

Import tests for:
- Auth hooks (5)
- Guest hooks (3)
- Homeowner hooks (6)
- Handyman hooks (5)
- Common hooks (5)

### API Structure (10 tests)
**File:** `packages/api/src/__tests__/api-imports.test.ts`

Import tests for API client, auth store, error functions, and types.

## What These Tests Validate

### ✅ Pure Functions (Time & Errors)
- Correct calculations
- Edge cases (expired dates, null values)
- Different input formats (Date objects, strings)
- Boundary conditions

### ✅ AsyncStorage Operations
- Mocked storage interactions
- Error handling (silent failures)
- Key generation
- State management
- Concurrent operations (read/write races)
- Error scenarios (quota, corruption, failures)
- Data integrity (large data, unicode, special chars)
- Migration scenarios
- Real-world usage patterns

### ✅ Function Behavior
- Toast message formatting
- Error message mapping
- Date/time calculations
- Random selection logic

### ✅ Import/Export Validation
- Module structure
- Function availability
- TypeScript compilation

## Writing New Tests

### For Pure Functions
```typescript
import { describe, it, expect } from 'vitest'

describe('My Function', () => {
  it('should handle normal case', () => {
    expect(myFunction('input')).toBe('expected output')
  })

  it('should handle edge case', () => {
    expect(myFunction(null)).toBe('fallback')
  })
})
```

### For AsyncStorage Functions
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AsyncStorage from '@react-native-async-storage/async-storage'

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}))

describe('My Storage Function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get item from storage', async () => {
    AsyncStorage.getItem.mockResolvedValue('value')
    
    const result = await myStorageFunction()
    
    expect(result).toBe('value')
    expect(AsyncStorage.getItem).toHaveBeenCalled()
  })
})
```

### For Functions with Mocks
```typescript
import { describe, it, expect, vi } from 'vitest'

vi.mock('some-library', () => ({
  someFunction: vi.fn(),
}))

import { someFunction } from 'some-library'

describe('My Function Using Library', () => {
  it('should call library function', () => {
    myFunction()
    
    expect(someFunction).toHaveBeenCalled()
  })
})
```

## Test Locations

```
packages/
├── api/
│   ├── src/__tests__/              # Error formatting, API imports
│   ├── src/hooks/__tests__/        # API hooks imports
│   └── src/utils/__tests__/        # Time utilities
├── app/
│   ├── hooks/__tests__/            # Custom hooks
│   └── utils/__tests__/            # Storage, flags, toast, notifications
└── ui/src/__tests__/               # UI components
```

## Test Commands

| Command | Description |
|---------|-------------|
| `yarn test` | Run all tests once |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test <path>` | Run specific test file |

## What's Tested vs. What Isn't

### ✅ Working Tests
- **Pure functions** - Time calculations, error formatting
- **Storage utilities** - AsyncStorage operations
- **Import validation** - Module structure
- **Basic function behavior** - Core logic

### ❌ Known Limitations
- **Screen components** - Use "typeof" error with dynamic imports
- **Full rendering** - @testing-library/react-native not working
- **User interactions** - Cannot test press events

## Recommended Testing Strategy

### Current Setup (Working)
1. **Unit tests for pure functions** ✅
2. **Storage operation tests with mocks** ✅
3. **Import/export validation** ✅
4. **Basic behavior tests** ✅

### Future: E2E Testing
For UI testing, use **Maestro**:

```yaml
# .maestro/login.yaml
appId: com.yourcompany.handymankiosk
---
- launchApp
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Login"
- assertVisible: "Welcome"
```

## CI/CD Integration

Add to your GitHub Actions:

```yaml
- name: Run Tests
  run: |
    cd frontend/apps/expo
    yarn test
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Maestro E2E Testing](https://maestro.mobile.dev/)
