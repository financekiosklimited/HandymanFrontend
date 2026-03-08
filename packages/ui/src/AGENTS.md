# AGENTS.md - UI Components

**Scope**: `frontend/packages/ui/src` - Tamagui-based component library

## OVERVIEW

Shared UI components built on Tamagui. Cross-platform support for web (Next.js) and native (Expo).
Components handle press animations via standardized `PressPresets`.

## STRUCTURE

```
packages/ui/src/
├── pressAnimations.ts    # PressPresets definitions
├── components/           # Reusable UI components
└── [other exports]       # Theme, tokens from config
```

## CRITICAL RULE: PressPresets

**ALL interactive elements MUST use PressPresets.**

```tsx
import { PressPresets } from '@my/ui'

// ✅ CORRECT
<Button {...PressPresets.primary}>
  <Text>Submit</Text>
</Button>

// ✅ Icon buttons
<Button unstyled {...PressPresets.icon}>
  <XIcon />
</Button>

// ❌ NEVER inline pressStyle
<Button pressStyle={{ scale: 0.95 }}>...</Button>
```

### Available Presets

| Preset | Use Case | Effect |
|--------|----------|--------|
| `primary` | Main CTAs | scale: 0.97, opacity: 0.9 |
| `secondary` | Cancel/outline | scale: 0.98, opacity: 0.8 |
| `card` | Content cards | scale: 0.97 |
| `listItem` | List rows, dropdowns | scale: 0.98, opacity: 0.9 |
| `filter` | Filter pills/toggles | scale: 0.98, opacity: 0.8 |
| `icon` | Icon buttons | scale: 0.95, opacity: 0.8 |
| `document` | File thumbnails | opacity: 0.8 only |

## CONVENTIONS

- Components: PascalCase files (`Button.tsx`)
- Export from `index.ts`
- Use Tamagui primitives: `YStack`, `XStack`, `Text`, `Button`
- Theme tokens: `$primary`, `$color`, `$backgroundStrong`
- Platform-specific: `.web.tsx` extension when needed

## ANTI-PATTERNS

- ❌ Inline `pressStyle` - always use PressPresets
- ❌ Direct React Native components - use Tamagui
- ❌ Hardcoded colors - use theme tokens
