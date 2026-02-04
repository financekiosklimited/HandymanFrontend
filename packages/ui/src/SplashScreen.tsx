import React from 'react'
import { YStack, XStack, Text, View } from 'tamagui'
import { Home, Wrench } from '@tamagui/lucide-icons'
import { LinearGradient } from 'expo-linear-gradient'

/**
 * HandymanKiosk Splash Screen Component
 * 
 * Design: Gradient Hero (Option 2)
 * - Gradient background: #0C9A5C → #34C759
 * - Custom logo: Wrench + House combination
 * - White text for contrast
 * - Decorative tool icons
 * 
 * Usage: This component can be used to generate the splash screen image
 * or as a loading/launch screen in the app
 */

export function SplashScreen() {
  return (
    <View flex={1}>
      <LinearGradient
        colors={['#0C9A5C', '#34C759']}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Decorative Background Elements */}
      <View
        position="absolute"
        top={-100}
        right={-100}
        width={300}
        height={300}
        backgroundColor="rgba(255,255,255,0.1)"
        borderRadius={150}
        style={{ filter: 'blur(40px)' }}
      />
      <View
        position="absolute"
        bottom={-50}
        left={-50}
        width={200}
        height={200}
        backgroundColor="rgba(0,0,0,0.1)"
        borderRadius={100}
        style={{ filter: 'blur(30px)' }}
      />

      {/* Main Content */}
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        {/* Logo Container */}
        <YStack alignItems="center" gap="$4">
          {/* Custom Logo: House + Wrench */}
          <View
            width={120}
            height={120}
            backgroundColor="rgba(255,255,255,0.95)"
            borderRadius="$6"
            alignItems="center"
            justifyContent="center"
            shadowColor="rgba(0,0,0,0.2)"
            shadowRadius={20}
            shadowOffset={{ width: 0, height: 8 }}
          >
            <YStack alignItems="center">
              {/* House Icon */}
              <Home
                size={48}
                color="#0C9A5C"
                strokeWidth={2}
              />
              {/* Wrench Overlay */}
              <View
                position="absolute"
                bottom={20}
                right={25}
                backgroundColor="white"
                padding="$1"
                borderRadius="$2"
              >
                <Wrench
                  size={28}
                  color="#FFB800"
                  strokeWidth={2.5}
                />
              </View>
            </YStack>
          </View>

          {/* App Name */}
          <YStack alignItems="center" gap="$2">
            <Text
              fontSize="$8"
              fontWeight="bold"
              color="white"
              textAlign="center"
            >
              HandymanKiosk
            </Text>
            <Text
              fontSize="$4"
              color="rgba(255,255,255,0.9)"
              textAlign="center"
              fontWeight="500"
            >
              Your Home, Our Expertise
            </Text>
          </YStack>
        </YStack>

        {/* Decorative Tool Icons */}
        <XStack
          position="absolute"
          bottom={100}
          gap="$4"
          opacity={0.3}
        >
          <View
            width={40}
            height={40}
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$3"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={20}>🔧</Text>
          </View>
          <View
            width={40}
            height={40}
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$3"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={20}>🔨</Text>
          </View>
          <View
            width={40}
            height={40}
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$3"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={20}>🎨</Text>
          </View>
          <View
            width={40}
            height={40}
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$3"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={20}>⚡</Text>
          </View>
        </XStack>

        {/* Version/Loading Indicator */}
        <Text
          position="absolute"
          bottom={40}
          fontSize="$2"
          color="rgba(255,255,255,0.6)"
        >
          Loading...
        </Text>
      </YStack>
    </View>
  )
}

/**
 * Static Splash Screen for Export
 * 
 * This is a 1242×2688 pixel version (iPhone 14 Pro Max dimensions)
 * that can be exported as a PNG for the actual splash screen image
 */
export function SplashScreenExport() {
  return (
    <View
      width={1242}
      height={2688}
      overflow="hidden"
    >
      <LinearGradient
        colors={['#0C9A5C', '#34C759']}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Decorative Background Elements */}
      <View
        position="absolute"
        top={-200}
        right={-200}
        width={600}
        height={600}
        backgroundColor="rgba(255,255,255,0.1)"
        borderRadius={300}
        style={{ filter: 'blur(80px)' }}
      />
      <View
        position="absolute"
        bottom={-100}
        left={-100}
        width={400}
        height={400}
        backgroundColor="rgba(0,0,0,0.1)"
        borderRadius={200}
        style={{ filter: 'blur(60px)' }}
      />

      {/* Main Content */}
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        {/* Logo Container */}
        <YStack alignItems="center" gap="$8">
          {/* Custom Logo: House + Wrench */}
          <View
            width={240}
            height={240}
            backgroundColor="rgba(255,255,255,0.95)"
            borderRadius="$8"
            alignItems="center"
            justifyContent="center"
            shadowColor="rgba(0,0,0,0.2)"
            shadowRadius={40}
            shadowOffset={{ width: 0, height: 16 }}
          >
            <YStack alignItems="center">
              {/* House Icon */}
              <Home
                size={96}
                color="#0C9A5C"
                strokeWidth={2}
              />
              {/* Wrench Overlay */}
              <View
                position="absolute"
                bottom={40}
                right={50}
                backgroundColor="white"
                padding="$2"
                borderRadius="$4"
              >
                <Wrench
                  size={56}
                  color="#FFB800"
                  strokeWidth={2.5}
                />
              </View>
            </YStack>
          </View>

          {/* App Name */}
          <YStack alignItems="center" gap="$4">
            <Text
              fontSize="$12"
              fontWeight="bold"
              color="white"
              textAlign="center"
            >
              HandymanKiosk
            </Text>
            <Text
              fontSize="$6"
              color="rgba(255,255,255,0.9)"
              textAlign="center"
              fontWeight="500"
            >
              Your Home, Our Expertise
            </Text>
          </YStack>
        </YStack>

        {/* Decorative Tool Icons */}
        <XStack
          position="absolute"
          bottom={200}
          gap="$6"
          opacity={0.3}
        >
          <View
            width={80}
            height={80}
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$4"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={40}>🔧</Text>
          </View>
          <View
            width={80}
            height={80}
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$4"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={40}>🔨</Text>
          </View>
          <View
            width={80}
            height={80}
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$4"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={40}>🎨</Text>
          </View>
          <View
            width={80}
            height={80}
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$4"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={40}>⚡</Text>
          </View>
        </XStack>
      </YStack>
    </View>
  )
}
