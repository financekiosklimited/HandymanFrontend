# AGENTS.md

Guidelines for AI coding agents working in this HandymanKiosk React Native/Next.js monorepo.

## Workflow Rules

### 🎯 PLAN MODE - **ALWAYS START HERE**

**⚠️ CRITICAL RULE: DO NOT EDIT FILES UNTIL EXPLICIT PERMISSION IS GIVEN**

When you ask me to do something, I **MUST** follow this workflow:

1. **Explore & Research**
   - Read relevant files to understand the current implementation
   - Find all related components, hooks, and services
   - Check for existing patterns in the codebase

2. **Analyze Root Cause**
   - Identify the underlying issue (for bugs)
   - Understand the full scope of the feature request
   - Find where changes need to be made

3. **Consider Edge Cases**
   - What could break with this change?
   - How does this affect mobile vs web?
   - What about error states and loading states?
   - Backward compatibility concerns?

4. **Identify Possible Conflicts**
   - Will this conflict with existing features?
   - Does it require backend API changes?
   - TypeScript type implications?
   - Shared component changes that affect multiple screens?

5. **Present Multiple Approaches**
   - Approach 1: Minimal change (safest)
   - Approach 2: Refactored solution (cleaner)
   - Approach 3: Full-featured solution (most comprehensive)
   - Pros/cons of each approach

6. **Wait for Permission**
   - **DO NOT EDIT ANY FILES**
   - Present findings and wait for your explicit "proceed" or "go with approach X"
   - Only then execute the plan

---

## Build/Lint/Test Commands

```bash
# Install dependencies
yarn install

# Build all packages (required before running apps)
yarn build

# Type checking
yarn type-check

# Linting (Biome) - **REQUIRED AFTER EVERY EDIT**

**⚠️ CRITICAL RULE: Always run linting after ANY file edit in this repo.**

```bash
# Check for errors (after ANY edit)
npx biome check .

# Auto-fix issues (preferred after editing)
npx biome check --write --unsafe .

# Or use the npm scripts
yarn lint      # Check only
yarn lint:fix  # Auto-fix all issues
```

**Pre-commit Hook:** Husky is configured to run `npx biome check --write --staged .` on every commit.

# Testing
yarn test              # Run all tests once
yarn test:watch        # Run tests in watch mode
yarn vitest run <path> # Run specific test file

# Running apps
yarn web               # Start Next.js dev server
yarn native            # Start Expo dev server
yarn ios               # Run iOS simulator
yarn android           # Run Android emulator
```

## Code Style Guidelines

### Decisions
- always keep in mind of edge cases
- be critical, ask detailed and important questions
- always consider performance when giving suggestions/possible fixes

When given a complex task:
1. Write Python code that uses asyncio to call tools in parallel
2. Process the results programmatically
3. Return only the final aggregated result

Example:
```python
import asyncio

async def research_topic(topic):
    # Parallel tool calls
    search_task = search(f"{topic} latest news")
    data_task = database_query(f"SELECT * FROM articles WHERE topic='{topic}'")

    results = await asyncio.gather(search_task, data_task)
    return synthesize_results(results)

print(asyncio.run(research_topic("AI safety")))
```

### Imports
- Group imports: React/hooks → External libraries → Internal packages → Types
- Use `@my/ui` for UI components, `@my/api` for API hooks
- Use `app/` path alias for `packages/app/*` imports
- Import types with `type` keyword: `import type { Role } from '@my/api'`

### Formatting (Biome)
- 2-space indentation
- Single quotes
- Semicolons: as needed (omitted when possible)
- Trailing commas: ES5 style
- Line width: 100 characters
- JSX: double quotes, multiline attributes

### Naming Conventions
- Components: PascalCase (e.g., `LoginScreen`)
- Hooks: camelCase with `use` prefix (e.g., `useLogin`)
- Types/Interfaces: PascalCase (e.g., `AuthResponse`)
- API types: Suffix with `Request`/`Response`/`Envelope`
- Files: camelCase for hooks/utils, PascalCase for components

### TypeScript
- Enable `strictNullChecks` and `noUncheckedIndexedAccess`
- Export types from `index.ts` files
- Use explicit return types on public API functions
- Use `type` for object shapes, `interface` for extensible types

### Error Handling
- Use `formatErrorMessage()` from `@my/api` for user-facing errors
- Handle ky `HTTPError` and `TimeoutError` specifically
- Parse API error responses for validation messages
- Always wrap async calls in try/catch with user-friendly messages

### React/Tamagui
- Use Tamagui components: `YStack`, `XStack`, `Text`, `Button`
- Style with theme tokens: `$primary`, `$color`, `$backgroundStrong`
- Use `pressStyle` for touch feedback
- Support web/native with `.web.tsx` extensions when needed

### Press Animations (PressPresets)
**⚠️ MANDATORY: All interactive elements MUST use `PressPresets` from `@my/ui`**

When adding any new interactive element (Button, Pressable, Touchable, etc.), you **MUST** use the standardized `PressPresets` pattern:

```tsx
import { PressPresets } from '@my/ui'

// Correct usage
<Button {...PressPresets.primary}>
  <Text>Submit</Text>
</Button>

<Button unstyled {...PressPresets.icon}>
  <XIcon />
</Button>
```

**Available Presets:**
- `PressPresets.primary` - Main CTAs (scale: 0.97, opacity: 0.9)
- `PressPresets.secondary` - Cancel/outline buttons (scale: 0.98, opacity: 0.8)
- `PressPresets.card` - Content cards (scale: 0.97)
- `PressPresets.listItem` - List rows, dropdown items (scale: 0.98, opacity: 0.9)
- `PressPresets.filter` - Filter pills/toggles (scale: 0.98, opacity: 0.8)
- `PressPresets.icon` - Icon buttons, small targets (scale: 0.95, opacity: 0.8)
- `PressPresets.document` - File thumbnails (opacity: 0.8 only)

**❌ NEVER use inline `pressStyle` definitions:**
```tsx
// INCORRECT - Do not do this
<Button pressStyle={{ scale: 0.95 }}>...</Button>
```

**Presets are defined in:** `packages/ui/src/pressAnimations.ts`

### API Hooks (TanStack Query)
- Use `useQuery` for reads, `useMutation` for writes
- Set appropriate `staleTime` for cached data
- Handle loading states with `isPending`
- Use `mutateAsync` when you need to await completion

### Testing
- Use Vitest for unit/integration tests
- Place tests in `__tests__/` directories
- Use `test()` with descriptive names
- Set appropriate timeouts for async tests (30s-60s)

## Project Structure

```
apps/
  next/          # Next.js web app
  expo/          # React Native mobile app
packages/
  app/           # Shared app logic, screens, features
  ui/            # Tamagui UI components (@my/ui)
  api/           # API client, hooks, types (@my/api)
  config/        # Tamagui config, tokens, themes
```

## Environment Variables
- Web: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_TIMEOUT_MS`
- Native: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_TIMEOUT_MS`
