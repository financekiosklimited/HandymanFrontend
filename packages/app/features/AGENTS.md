# AGENTS.md - App Features

**Scope**: `frontend/packages/app/features` - Screen organization by role

## OVERVIEW

Feature-based organization grouping screens by user role: guest, homeowner, handyman, auth.

## STRUCTURE

```
packages/app/features/
├── auth/           # Login, register, password reset
├── guest/          # Unauthenticated browsing
├── homeowner/      # Job posting, tracking, payments
├── handyman/       # Job discovery, proposals, scheduling
├── user/           # Profile, settings (shared)
├── common/         # Shared components across roles
└── onboarding/     # First-time user flow
```

## FEATURE ORGANIZATION

Each feature follows this pattern:

```
features/homeowner/
├── index.ts              # Public exports
├── jobs/
│   ├── index.ts          # Screen exports
│   ├── JobListScreen.tsx
│   ├── JobDetailScreen.tsx
│   └── components/       # Job-specific components
├── payments/
└── [other domains]/
```

## CROSS-PLATFORM SUPPORT

Use platform extensions when needed:

```
JobDetailScreen.tsx       # Shared implementation
JobDetailScreen.web.tsx   # Web-specific overrides
```

## IMPORT PATTERNS

```tsx
// ✅ Use package aliases
import { Button, PressPresets } from '@my/ui'
import { useJobs } from '@my/api'
import type { JobResponse } from '@my/api'

// ✅ App-relative imports for sibling features
import { ProfileHeader } from '../user/components/ProfileHeader'
```

## CONVENTIONS

- Screens: PascalCase with `Screen` suffix (`JobListScreen.tsx`)
- Components: PascalCase (`JobCard.tsx`)
- Hooks: camelCase with `use` prefix (`useJobFilters.ts`)
- Co-locate components with the screens that use them
- Extract truly shared components to `packages/ui`

## ANTI-PATTERNS

- ❌ Deep cross-feature imports (use index.ts exports)
- ❌ Duplicate business logic (move to hooks in api package)
- ❌ Feature leaking UI details to other features
