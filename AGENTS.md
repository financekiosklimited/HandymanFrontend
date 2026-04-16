# AGENTS.md

Guidelines for AI coding agents working in this HandymanKiosk React Native/Next.js monorepo.

## Workflow Rules

### 🎯 PLAN MODE - **ALWAYS START HERE**

**⚠️ CRITICAL RULE: DO NOT EDIT FILES UNTIL EXPLICIT PERMISSION IS GIVEN**

Before making any changes or presenting approaches, you **MUST** conduct a Semi-Formal Analysis using the following structured template. Do not guess behavior; verify it.


**Phase 1: Premises & Test Semantics Analysis**
* Define the exact expected behavior vs. the observed issue.
* State these as formal premises (e.g., "PREMISE 1: The user clicks the Login Button and expects X", "PREMISE 2: The API returns Y").


**Phase 2: Code Path & Function Tracing Table**
* Trace the execution path from the entry point into the production code. 
* You must construct a Trace Table with explicit evidence:
  | Function/Method | File:Line | Parameter Types | Return Type | Behavior (VERIFIED) |
  |-----------------|-----------|-----------------|-------------|---------------------|
  | [function1]     | [file:N]  | [param types]   | [ret type]  | [ACTUAL behavior]   |


**Phase 3: Data Flow & Divergence Analysis**
* **Data Flow:** Trace how key variables flow through the code (Created at -> Modified at -> Used at).
* **Claims:** Identify exactly where the implementation diverges from the expected behavior. State these as formal claims referencing specific code locations (e.g., "CLAIM 1: At [file:line], [code] produces [behavior] which contradicts PREMISE 1 because [reason]").


**Phase 4: Alternative Hypothesis Check & Conclusion**
* **Alternative Check:** If the opposite of your claim were true, what evidence would exist? Search for it and state if it is REFUTED or SUPPORTED.
* **Ranked Predictions / Approaches:** Based strictly on the verified claims above, present your proposed solutions (Approach 1: Minimal, Approach 2: Robust).


**Wait for Permission**
* **DO NOT EDIT ANY FILES.** Present this completed Semi-Formal Certificate and wait for explicit "proceed" from the user.

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

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
