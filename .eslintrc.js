module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'reanimated-custom'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    // Enable our custom Reanimated rule
    'reanimated-custom/no-invalid-reanimated-scroll-handler': 'error',

    // Additional strict rules
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/strict-boolean-expressions': 'error',

    // React Native specific
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',

    // Import rules
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-native',
            importNames: ['FlatList'],
            message:
              "Use Animated.FlatList from 'react-native-reanimated' when working with animated scroll handlers. Import as: import Animated from 'react-native-reanimated'",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'types/', '.next/', '.tamagui/'],
}
