# AGENTS.md - API Client

**Scope**: `frontend/packages/api/src` - API hooks, types, and client config

## OVERVIEW

TanStack Query-based API layer with ky HTTP client. Organized by user role and feature.

## STRUCTURE

```
packages/api/src/
├── types/                    # TypeScript types by domain
│   ├── auth.ts
│   ├── homeowner.ts
│   ├── handyman.ts
│   ├── guest.ts
│   ├── chat.ts
│   ├── discount.ts
│   └── ...
├── hooks/
│   ├── common/               # Shared hooks (useUpload, etc.)
│   ├── homeowner/            # Homeowner-specific queries
│   ├── handyman/             # Handyman-specific queries
│   └── guest/                # Guest/unauthenticated queries
├── client.ts                 # ky instance config
├── errors.ts                 # Error handling utilities
└── index.ts                  # Public exports
```

## TYPE NAMING

**ALWAYS suffix types:**

```ts
// ✅ CORRECT
interface LoginRequest { }
interface LoginResponse { }
interface JobsListEnvelope { }

// ❌ AVOID
interface LoginData { }
interface JobsResponse { }
```

## HOOK PATTERNS

```tsx
// Reads - useQuery
const { data, isPending } = useQuery({
  queryKey: ['jobs', filters],
  queryFn: () => api.jobs.list(filters),
  staleTime: 5 * 60 * 1000,
})

// Writes - useMutation
const mutation = useMutation({
  mutationFn: api.jobs.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
  },
})
```

## ERROR HANDLING

```tsx
import { formatErrorMessage } from '@my/api'
import { HTTPError, TimeoutError } from 'ky'

try {
  await api.login(credentials)
} catch (error) {
  if (error instanceof HTTPError) {
    // Handle specific status codes
  }
  if (error instanceof TimeoutError) {
    // Handle timeout
  }
  // User-friendly message
  const message = formatErrorMessage(error)
}
```

## ANTI-PATTERNS

- ❌ Skip `staleTime` for cached data
- ❌ Forget error boundaries around mutations
- ❌ Mix concerns - keep hooks focused on data fetching
- ❌ Skip type exports from index.ts
