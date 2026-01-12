import 'setimmediate'
import { Platform } from 'react-native'

// Ensure process.env is available for modules that expect it
if (typeof process === 'undefined') {
  global.process = { env: {} }
} else if (!process.env) {
  process.env = {}
}

// Inline EXPO_OS if it wasn't inlined by Babel
if (!process.env.EXPO_OS) {
  process.env.EXPO_OS = Platform.OS
}

if (!global?.setImmediate) {
  global.setImmediate = setTimeout
}

import 'expo-router/entry'
