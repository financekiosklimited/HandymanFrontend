'use client'

import { useState } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, TextArea } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useHandymanDirectOffer, useRejectDirectOffer, QUICK_REJECTION_REASONS } from '@my/api'
import { ArrowLeft, X, AlertCircle, Check } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { Alert, Keyboard, TouchableWithoutFeedback } from 'react-native'

interface HandymanDirectOfferRejectScreenProps {
  offerId: string
}

export function HandymanDirectOfferRejectScreen({ offerId }: HandymanDirectOfferRejectScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const { data: offer, isLoading: offerLoading } = useHandymanDirectOffer(offerId)
  const rejectMutation = useRejectDirectOffer()

  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [customReason, setCustomReason] = useState('')

  const handleQuickReasonSelect = (reasonId: string) => {
    if (selectedReason === reasonId) {
      setSelectedReason(null)
    } else {
      setSelectedReason(reasonId)
      // Clear custom reason when selecting a quick reason
      setCustomReason('')
    }
  }

  const handleCustomReasonChange = (text: string) => {
    setCustomReason(text)
    // Clear quick reason when typing custom
    if (text.length > 0) {
      setSelectedReason(null)
    }
  }

  const getRejectionReason = (): string | undefined => {
    if (customReason.trim()) {
      return customReason.trim()
    }
    if (selectedReason) {
      const reason = QUICK_REJECTION_REASONS.find((r) => r.id === selectedReason)
      return reason?.value
    }
    return undefined
  }

  const handleReject = async () => {
    if (!offer) return

    const reason = getRejectionReason()

    Alert.alert(
      'Decline This Offer?',
      reason
        ? 'The homeowner will be notified with your reason.'
        : 'The homeowner will be notified that you declined.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectMutation.mutateAsync({
                publicId: offer.public_id,
                data: reason ? { rejection_reason: reason } : undefined,
              })
              Alert.alert('Offer Declined', 'The homeowner has been notified.', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(handyman)/direct-offers'),
                },
              ])
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to decline offer')
            }
          },
        },
      ]
    )
  }

  if (offerLoading) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          gap="$md"
        >
          <Spinner
            size="large"
            color="$primary"
          />
          <Text
            color="$colorSubtle"
            fontSize="$4"
          >
            Loading...
          </Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (!offer) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          px="$xl"
          gap="$md"
        >
          <YStack
            width={64}
            height={64}
            borderRadius="$full"
            bg="$errorBackground"
            alignItems="center"
            justifyContent="center"
          >
            <AlertCircle
              size={28}
              color="$error"
            />
          </YStack>
          <Text
            color="$color"
            fontSize="$5"
            fontWeight="600"
          >
            Offer not found
          </Text>
          <Button
            mt="$md"
            bg="$primary"
            borderRadius="$4"
            px="$6"
            py="$3"
            onPress={() => router.back()}
          >
            <Text
              color="white"
              fontWeight="600"
            >
              Go Back
            </Text>
          </Button>
        </YStack>
      </GradientBackground>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <GradientBackground>
        <YStack
          flex={1}
          pt={insets.top}
        >
          {/* Header */}
          <XStack
            px="$4"
            py="$3"
            alignItems="center"
            gap="$3"
          >
            <Button
              unstyled
              onPress={() => router.back()}
              p="$2"
              hitSlop={12}
              pressStyle={{ opacity: 0.7 }}
            >
              <ArrowLeft
                size={24}
                color="$color"
              />
            </Button>
            <Text
              fontSize="$6"
              fontWeight="bold"
              color="$color"
              flex={1}
            >
              Decline Offer
            </Text>
          </XStack>

          <ScrollView
            flex={1}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <YStack
              px="$4"
              gap="$5"
              pb="$xl"
            >
              {/* Offer Summary */}
              <YStack
                bg="$backgroundMuted"
                borderRadius="$4"
                p="$4"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                  mb="$2"
                >
                  {offer.title}
                </Text>
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text
                    fontSize="$3"
                    color="$colorSubtle"
                  >
                    From {offer.homeowner.display_name}
                  </Text>
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color="$primary"
                  >
                    ${offer.estimated_budget}
                  </Text>
                </XStack>
              </YStack>

              {/* Explanation */}
              <YStack gap="$2">
                <Text
                  fontSize="$5"
                  fontWeight="600"
                  color="$color"
                >
                  Let them know why (optional)
                </Text>
                <Text
                  fontSize="$3"
                  color="$colorSubtle"
                  lineHeight={20}
                >
                  Providing a reason helps homeowners understand and may lead to better offers in
                  the future.
                </Text>
              </YStack>

              {/* Quick Reasons */}
              <YStack gap="$3">
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$colorSubtle"
                >
                  QUICK REASONS
                </Text>
                <YStack gap="$2">
                  {QUICK_REJECTION_REASONS.map((reason) => (
                    <Button
                      key={reason.id}
                      unstyled
                      onPress={() => handleQuickReasonSelect(reason.id)}
                      bg={selectedReason === reason.id ? '$primaryBackground' : '$backgroundMuted'}
                      borderRadius="$3"
                      p="$4"
                      borderWidth={2}
                      borderColor={selectedReason === reason.id ? '$primary' : '$borderColor'}
                      pressStyle={{ opacity: 0.8 }}
                    >
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <YStack
                          flex={1}
                          gap="$1"
                        >
                          <Text
                            fontSize="$4"
                            fontWeight="600"
                            color={selectedReason === reason.id ? '$primary' : '$color'}
                          >
                            {reason.label}
                          </Text>
                          <Text
                            fontSize="$2"
                            color="$colorSubtle"
                            numberOfLines={2}
                          >
                            {reason.value}
                          </Text>
                        </YStack>
                        {selectedReason === reason.id && (
                          <View
                            width={24}
                            height={24}
                            borderRadius="$full"
                            bg="$primary"
                            alignItems="center"
                            justifyContent="center"
                            ml="$3"
                          >
                            <Check
                              size={14}
                              color="white"
                            />
                          </View>
                        )}
                      </XStack>
                    </Button>
                  ))}
                </YStack>
              </YStack>

              {/* Custom Reason */}
              <YStack gap="$3">
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$colorSubtle"
                >
                  OR WRITE YOUR OWN
                </Text>
                <TextArea
                  placeholder="Type your reason here..."
                  value={customReason}
                  onChangeText={handleCustomReasonChange}
                  minHeight={120}
                  bg="$backgroundMuted"
                  borderWidth={1}
                  borderColor={customReason ? '$primary' : '$borderColor'}
                  borderRadius="$3"
                  p="$3"
                />
              </YStack>
            </YStack>
          </ScrollView>

          {/* Bottom Action */}
          <YStack
            px="$4"
            pb={insets.bottom + 16}
            pt="$3"
            borderTopWidth={1}
            borderColor="$borderColor"
            bg="$background"
          >
            <Button
              bg="$error"
              borderRadius="$4"
              py="$3"
              minHeight={54}
              onPress={handleReject}
              disabled={rejectMutation.isPending}
              pressStyle={{ opacity: 0.9 }}
            >
              <XStack
                alignItems="center"
                gap="$2"
              >
                {rejectMutation.isPending ? (
                  <Spinner
                    size="small"
                    color="white"
                  />
                ) : (
                  <X
                    size={18}
                    color="white"
                  />
                )}
                <Text
                  color="white"
                  fontSize="$4"
                  fontWeight="600"
                >
                  {rejectMutation.isPending ? 'Declining...' : 'Decline Offer'}
                </Text>
              </XStack>
            </Button>
          </YStack>
        </YStack>
      </GradientBackground>
    </TouchableWithoutFeedback>
  )
}
