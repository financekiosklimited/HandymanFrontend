// Learn more https://docs.expo.dev/guides/monorepos
// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config')}
 */
const { getDefaultConfig } = require('expo/metro-config')
const path = require('node:path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// 1. Watch all files within the monorepo
config.watchFolders = Array.from(new Set([...(config.watchFolders || []), workspaceRoot]))
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = false

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  minifierPath: require.resolve('metro-minify-terser'),
}

// Performance optimizations
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true, // Load modules on-demand for faster startup
  },
})

// Enable package exports for better tree shaking
config.resolver.unstable_enablePackageExports = true

module.exports = config
