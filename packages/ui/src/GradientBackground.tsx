import { LinearGradient } from 'expo-linear-gradient'
import { YStack } from 'tamagui'

interface GradientBackgroundProps {
  children: React.ReactNode
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <YStack
      flex={1}
      position="relative"
    >
      <LinearGradient
        colors={['#FBF6F2', '#F0F5F3', '#FBF6F2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.5, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />
      <YStack
        flex={1}
        position="relative"
        zIndex={1}
      >
        {children}
      </YStack>
    </YStack>
  )
}
