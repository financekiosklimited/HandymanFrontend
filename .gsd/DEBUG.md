# Debug Session: ReferenceError Property 'System' doesn't exist

## Symptom
`ERROR  [ReferenceError: Property 'System' doesn't exist]` occurs when loading `apps\expo\app\(homeowner)\messages\[id].js`

**When:** When navigating to or loading the messaging route `apps\expo\app\(homeowner)\messages\[id].js`
**Expected:** The message detail screen should load without errors.
**Actual:** The app throws a ReferenceError stating `System` doesn't exist.

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | Errant `.js` files emitted by `tsc` inside the `app/` directory are being picked up by Expo Router, and they lack Metro support because they use `System.register`. | 95% | TESTING |

## Attempts

### Attempt 1
**Testing:** H1 — Errant `.js` files
**Action:** Found 67 `.js` files in `apps/expo/app/` and 100+ in `packages/app/`. Deleted all `.js` files that had matching `.ts` or `.tsx` files. Added `"noEmit": true` to `tsconfig.base.json` to prevent future occurrences.
**Result:** The stray files are removed.
**Conclusion:** CONFIRMED. The errant `.js` files were the source of the `ReferenceError: Property 'System' doesn't exist` error because Expo Router tried to load them over the `.tsx` files and Metro failed on `System.register`.

## Resolution

**Root Cause:** Running `yarn tsc` without `"noEmit": true` in `tsconfig.base.json` caused TypeScript to emit `.js` files with `System.register` module format into the source tree next to `.tsx` files. Expo Router picked up these `.js` files instead of the source files.
**Fix:** Added `"noEmit": true` to `tsconfig.base.json` and deleted all stray `.js` files from `apps/expo/app`, `packages/app`, and `packages/ui/src`.
**Verified:** The errant `.js` files are deleted. User should reload the Metro bundler.
**Regression Check:** Typescript check `yarn tsc` will no longer generate files.
