import { defaultConfig } from '@tamagui/config/v4'
import { createTamagui } from 'tamagui'
import { bodyFont, headingFont } from './fonts'
import { animations } from './animations'
import { colors, spacing, borderRadius } from './tokens'

// Light theme definition
const lightTheme = {
  // === STANDARD TAMAGUI KEYS ===
  // Background variants
  background: colors.background,
  backgroundHover: colors.backgroundSubtle,
  backgroundPress: colors.backgroundSubtle,
  backgroundFocus: colors.backgroundSubtle,
  backgroundStrong: colors.backgroundStrong,
  backgroundMuted: colors.backgroundMuted,
  backgroundTransparent: 'rgba(255,255,255,0.7)',

  // Text variants
  color: colors.text,
  colorHover: colors.text,
  colorPress: colors.textSubtle,
  colorFocus: colors.textSubtle,
  colorMuted: colors.textMuted,
  colorSubtle: colors.textSubtle,
  colorTransparent: 'rgba(0,0,0,0.5)',

  // Border variants
  borderColor: colors.border,
  borderColorHover: colors.borderSubtle,
  borderColorFocus: colors.primary,
  borderColorPress: colors.borderSubtle,

  // Other standard
  placeholderColor: colors.textMuted,
  shadowColor: 'rgba(0,0,0,0.1)',
  outlineColor: colors.primary,

  // === SEMANTIC CUSTOM KEYS ===
  primary: colors.primary,
  primaryBackground: 'rgba(12,154,92,0.1)',

  success: colors.success,
  successBackground: '#D1FAE5',

  warning: colors.warning,
  warningBackground: '#FEF3C7',

  error: colors.error,
  errorBackground: '#FEE2E2',

  info: colors.info,
  infoBackground: '#DBEAFE',

  accent: colors.accent,
}

// Dark theme definition
const darkTheme: typeof lightTheme = {
  // === STANDARD TAMAGUI KEYS ===
  background: '#1A1A1A',
  backgroundHover: '#2A2A2A',
  backgroundPress: '#333333',
  backgroundFocus: '#333333',
  backgroundStrong: '#0A0A0A',
  backgroundMuted: '#242424',
  backgroundTransparent: 'rgba(0,0,0,0.7)',

  color: '#FFFFFF',
  colorHover: '#F0F0F0',
  colorPress: '#E0E0E0',
  colorFocus: '#E0E0E0',
  colorMuted: '#8E8E93',
  colorSubtle: '#A0A0A0',
  colorTransparent: 'rgba(255,255,255,0.5)',

  borderColor: '#3A3A3A',
  borderColorHover: '#4A4A4A',
  borderColorFocus: colors.primary,
  borderColorPress: '#4A4A4A',

  placeholderColor: '#6E6E73',
  shadowColor: 'rgba(0,0,0,0.3)',
  outlineColor: colors.primary,

  // === SEMANTIC CUSTOM KEYS ===
  primary: colors.primary,
  primaryBackground: 'rgba(12,154,92,0.15)',

  success: colors.success,
  successBackground: 'rgba(52,199,89,0.15)',

  warning: colors.warning,
  warningBackground: 'rgba(255,149,0,0.15)',

  error: colors.error,
  errorBackground: 'rgba(255,59,48,0.15)',

  info: colors.info,
  infoBackground: 'rgba(0,122,255,0.15)',

  accent: colors.accent,
}

export const config = createTamagui({
  ...defaultConfig,
  animations,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  tokens: {
    ...defaultConfig.tokens,
    // Override spacing
    space: {
      ...defaultConfig.tokens.space,
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
      xl: spacing.xl,
      '2xl': spacing['2xl'],
      '3xl': spacing['3xl'],
      '4xl': spacing['4xl'],
    },
    // Override radius
    radius: {
      ...defaultConfig.tokens.radius,
      sm: borderRadius.sm,
      md: borderRadius.md,
      lg: borderRadius.lg,
      xl: borderRadius.xl,
      '2xl': borderRadius['2xl'],
      full: borderRadius.full,
    },
  },
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      ...lightTheme,
    },
    dark: {
      ...defaultConfig.themes.dark,
      ...darkTheme,
    },
  },
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
})
