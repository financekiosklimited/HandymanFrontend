import { View } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import type { ReactNode } from 'react'

interface ScrollIndicatorProps {
  children: ReactNode
}

/**
 * ScrollIndicator - Wraps horizontally scrollable content with a gradient fade
 * on the right edge to indicate more content is available.
 *
 * Usage:
 * <ScrollIndicator>
 *   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
 *     ...scrollable content
 *   </ScrollView>
 * </ScrollIndicator>
 */
export function ScrollIndicator({ children }: ScrollIndicatorProps) {
  return (
    <View position="relative">
      {children}
      {/* Gradient fade indicator on the right edge */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 24,
          pointerEvents: 'none',
        }}
      />
    </View>
  )
}
