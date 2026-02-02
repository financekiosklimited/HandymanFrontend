
import { useState, useRef } from 'react'
import { FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { YStack, XStack, Text, Button, Circle, Theme } from '@my/ui'
import { Shield, ArrowRight, CheckCircle, Gavel, Hammer } from '@tamagui/lucide-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'solito/navigation'
import { Image } from 'expo-image'

const { width, height } = Dimensions.get('window')

const slides = [
    {
        id: 1,
        title: 'Welcome to HandymanKiosk',
        description: 'Your trusted partner for home services. Connect with verified local professionals instantly.',
        icon: Shield,
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop',
        color: '$green10',
        iconColor: '$green10',
    },
    {
        id: 2,
        title: 'For Homeowners: Competitive Prices',
        description: 'Professionals compete for your business. You get the true market price without haggling.',
        icon: Gavel,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop',
        color: '$emerald10',
        iconColor: '$emerald10',
    },
    {
        id: 3,
        title: 'For Professionals: Win on Merit',
        description: 'Stop paying for leads. Bid on jobs you want and win based on skill and reputation, not marketing budget.',
        icon: Hammer,
        image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1000&auto=format&fit=crop',
        color: '$blue10',
        iconColor: '$blue10',
    },
    {
        id: 4,
        title: 'Secure & Ready to Start',
        description: 'Verified reviews, transparent pricing, and secure payments. Join thousands building better communities today.',
        icon: CheckCircle,
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop',
        color: '$teal10',
        iconColor: '$teal10',
    },
]

export function OnboardingScreen() {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const flatListRef = useRef<FlatList>(null)

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x
        const index = Math.round(scrollPosition / width)
        setCurrentIndex(index)
    }

    const scrollToIndex = (index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true })
    }

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            scrollToIndex(currentIndex + 1)
        } else {
            await completeOnboarding()
        }
    }

    const handleSkip = async () => {
        await completeOnboarding()
    }

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('onboarding_complete', 'true')
            router.replace('/')
        } catch (e) {
            console.error('Failed to save onboarding status', e)
            router.replace('/')
        }
    }

    return (
        <Theme name="light">
            <YStack flex={1} backgroundColor="$color1">
                <FlatList
                    ref={flatListRef}
                    data={slides}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <YStack width={width} height={height} position="relative">
                            {/* Image Section */}
                            <YStack height="65%" width="100%" position="relative">
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                />
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(255,255,255,0.9)']}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                />
                            </YStack>

                            {/* Content Card */}
                            <YStack
                                position="absolute"
                                bottom={0}
                                left={0}
                                right={0}
                                height="45%"
                                backgroundColor="$background"
                                borderTopRightRadius={40}
                                borderTopLeftRadius={40}
                                paddingHorizontal="$6"
                                paddingTop="$10"
                                paddingBottom="$12"
                                alignItems="center"
                                justifyContent="flex-start"
                                shadowColor="rgba(0,0,0,0.1)"
                                shadowRadius={40}
                                shadowOffset={{ width: 0, height: -10 }}
                                shadowOpacity={1}
                            >
                                {/* Floating Icon */}
                                <YStack
                                    position="absolute"
                                    top={-40}
                                    backgroundColor="$background"
                                    padding="$4"
                                    borderRadius="$10"
                                    shadowColor="$shadowColor"
                                    shadowRadius={10}
                                    shadowOffset={{ width: 0, height: 5 }}
                                    shadowOpacity={0.1}
                                    elevation={5}
                                >
                                    <item.icon size={40} color={item.iconColor} strokeWidth={2.5} />
                                </YStack>

                                <Text
                                    fontSize="$8"
                                    fontWeight="bold"
                                    color="$color"
                                    marginBottom="$4"
                                    textAlign="center"
                                    lineHeight={32}
                                >
                                    {item.title}
                                </Text>
                                <Text
                                    fontSize="$5"
                                    color="$color11"
                                    textAlign="center"
                                    lineHeight={24}
                                    maxWidth={350}
                                >
                                    {item.description}
                                </Text>
                            </YStack>
                        </YStack>
                    )}
                />

                {/* Bottom Controls */}
                <YStack
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    padding="$6"
                    paddingBottom="$8"
                    zIndex={100}
                >
                    <YStack gap="$6" maxWidth={450} width="100%" alignSelf="center">
                        {/* Pagination Dots */}
                        <XStack justifyContent="center" gap="$2.5">
                            {slides.map((_, index) => (
                                <YStack
                                    key={index}
                                    height={8}
                                    borderRadius="$10"
                                    animation="quick"
                                    width={index === currentIndex ? 32 : 8}
                                    backgroundColor={index === currentIndex ? '$color' : '$color5'}
                                />
                            ))}
                        </XStack>

                        {/* Buttons */}
                        <XStack
                            alignItems="center"
                            paddingHorizontal="$2"
                            justifyContent={currentIndex === slides.length - 1 ? 'center' : 'space-between'}
                        >
                            {currentIndex !== slides.length - 1 && (
                                <Button
                                    chromeless
                                    onPress={handleSkip}
                                    color="$color11"
                                    fontWeight="bold"
                                    fontSize="$3"
                                    pressStyle={{ opacity: 0.7 }}
                                >
                                    Skip
                                </Button>
                            )}

                            <Button
                                backgroundColor="$color"
                                color="$background"
                                borderRadius="$10"
                                fontWeight="bold"
                                size="$5"
                                paddingHorizontal={currentIndex === slides.length - 1 ? '$8' : '$5'}
                                iconAfter={currentIndex !== slides.length - 1 ? <ArrowRight size={20} /> : undefined}
                                onPress={handleNext}
                                hoverStyle={{ backgroundColor: '$color11' }}
                                pressStyle={{ scale: 0.95 }}
                                shadowColor="$shadowColor"
                                shadowRadius={10}
                                shadowOffset={{ width: 0, height: 5 }}
                                shadowOpacity={0.2}
                            >
                                {currentIndex === slides.length - 1 ? "Let's explore" : 'Next'}
                            </Button>
                        </XStack>
                    </YStack>
                </YStack>
            </YStack>
        </Theme>
    )
}
