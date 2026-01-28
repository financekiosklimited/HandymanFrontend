# AGENTS.md

Guidelines for AI coding agents working in this HandymanKiosk React Native/Next.js monorepo.

## Build/Lint/Test Commands

```bash
# Install dependencies
yarn install

# Build all packages (required before running apps)
yarn build

# Type checking
yarn type-check

# Linting (Biome)
yarn workspace next-app lint
# Or run biome directly:
npx biome check .
npx biome check --write .  # Auto-fix issues

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
