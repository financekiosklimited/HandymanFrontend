/**
 * Standardized press animation configurations for consistent user feedback
 * across all interactable components in the HandymanKiosk app.
 *
 * These configurations provide tactile feedback through a combination of:
 * - Scale reduction (makes element feel pressed)
 * - Opacity change (visual feedback)
 * - Animation timing (smooth transitions)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PressStyle = any

/**
 * Primary action buttons (CTAs, form submissions, major actions)
 * - Prominent scale feedback for important actions
 * - Quick spring animation for responsiveness
 */
export const PRIMARY_BUTTON_PRESS: PressStyle = {
  scale: 0.97,
  opacity: 0.9,
}

/**
 * Secondary/outline buttons
 * - Subtle scale with opacity change
 * - Good for cancel buttons and secondary actions
 */
export const SECONDARY_BUTTON_PRESS: PressStyle = {
  scale: 0.98,
  opacity: 0.8,
}

/**
 * Card press (HandymanCard, JobCard, etc.)
 * - Subtle scale for content cards
 * - Micro animation for snappy feedback
 */
export const CARD_PRESS: PressStyle = {
  scale: 0.97,
}

/**
 * List item press (NotificationCard, list rows)
 * - Slight scale with opacity
 * - Quick animation for list interactions
 */
export const LIST_ITEM_PRESS: PressStyle = {
  scale: 0.98,
  opacity: 0.9,
}

/**
 * Filter pill/button press
 * - Subtle feedback for filter toggles
 * - Quick animation for rapid interactions
 */
export const FILTER_PRESS: PressStyle = {
  scale: 0.98,
  opacity: 0.8,
}

/**
 * Icon button press (navigation icons, action buttons)
 * - More pronounced scale for small targets
 * - Quick feedback for icon taps
 */
export const ICON_BUTTON_PRESS: PressStyle = {
  scale: 0.95,
  opacity: 0.8,
}

/**
 * Document/file press
 * - Standard opacity feedback
 * - No scale to maintain document feel
 */
export const DOCUMENT_PRESS: PressStyle = {
  opacity: 0.8,
}

/**
 * Destructive action press (delete, remove)
 * - Same as primary but used with red background
 */
export const DESTRUCTIVE_PRESS: PressStyle = {
  scale: 0.97,
  opacity: 0.9,
}

// Animation presets to use with press styles
export const ANIMATION_QUICK = 'quick'
export const ANIMATION_MICRO = 'micro'
export const ANIMATION_PRESS = 'press'

/**
 * Complete press configuration objects for common use cases
 * Combines pressStyle with animation prop for convenience
 */
export const PressPresets = {
  /** Primary CTA buttons */
  primary: {
    pressStyle: PRIMARY_BUTTON_PRESS,
    animation: ANIMATION_QUICK,
  },
  /** Secondary/outline buttons */
  secondary: {
    pressStyle: SECONDARY_BUTTON_PRESS,
    animation: ANIMATION_QUICK,
  },
  /** Content cards */
  card: {
    pressStyle: CARD_PRESS,
    animation: ANIMATION_MICRO,
  },
  /** List items and rows */
  listItem: {
    pressStyle: LIST_ITEM_PRESS,
    animation: ANIMATION_QUICK,
  },
  /** Filter pills and toggles */
  filter: {
    pressStyle: FILTER_PRESS,
    animation: ANIMATION_QUICK,
  },
  /** Icon buttons */
  icon: {
    pressStyle: ICON_BUTTON_PRESS,
    animation: ANIMATION_QUICK,
  },
  /** Document thumbnails */
  document: {
    pressStyle: DOCUMENT_PRESS,
    animation: ANIMATION_QUICK,
  },
} as const

export type PressPreset = keyof typeof PressPresets
