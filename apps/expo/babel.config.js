module.exports = (api) => {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: ['../..'],
          alias: {
            // define aliases to shorten the import paths
            app: '../../packages/app',
            '@my/ui': '../../packages/ui',
          },
          extensions: ['.js', '.jsx', '.tsx', '.ios.js', '.android.js'],
        },
      ],
      'react-native-reanimated/plugin',
      [
        '@tamagui/babel-plugin',
        {
          components: ['@my/ui', 'tamagui'],
          config: '../../packages/config/src/tamagui.config.ts',
          logTimings: true,
          // Prevent static extraction on native so Expo modules are not
          // evaluated in Node (avoids missing native modules and EXPO_OS).
          platform: 'native',
          disableExtraction: true,
        },
      ],
    ],
  }
}
