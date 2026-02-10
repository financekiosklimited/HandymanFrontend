'use client'

import { YStack, XStack, Text, Button, View } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { CheckCircle2, Clock, Home, Eye } from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { colors } from '@my/config'
import { PageHeader } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'

export function DirectOfferSuccessScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const params = useLocalSearchParams<{
    offerId: string
    handymanName: string
    expiresInDays: string
  }>()

  const handymanName = params.handymanName || 'the handyman'
  const expiresInDays = params.expiresInDays ? Number.parseInt(params.expiresInDays, 10) : 7
  const offerId = params.offerId || ''

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
        pb={insets.bottom + 16}
      >
        <PageHeader
          title="Offer Sent"
          description={PAGE_DESCRIPTIONS['create-direct-offer']}
          showBack={false}
        />
        {/* Content */}
        <YStack
          flex={1}
          px="$4"
          alignItems="center"
          justifyContent="center"
          gap="$6"
        >
          {/* Success Icon */}
          <View
            width={120}
            height={120}
            borderRadius={60}
            bg="$successBackground"
            alignItems="center"
            justifyContent="center"
          >
            <CheckCircle2
              size={64}
              color="$success"
            />
          </View>

          {/* Success Message */}
          <YStack
            alignItems="center"
            gap="$3"
          >
            <Text
              fontSize={28}
              fontWeight="bold"
              color="$color"
              textAlign="center"
            >
              Offer Sent!
            </Text>
            <Text
              fontSize="$4"
              color="$colorSubtle"
              textAlign="center"
              px="$4"
              lineHeight={24}
            >
              Your job offer has been sent to{' '}
              <Text
                fontWeight="600"
                color="$color"
              >
                {handymanName}
              </Text>
              . They will be notified immediately.
            </Text>
          </YStack>

          {/* Expiry Info Card */}
          <XStack
            bg="$warningBackground"
            borderRadius="$4"
            p="$4"
            gap="$3"
            alignItems="center"
            borderWidth={1}
            borderColor="$warningBackground"
            width="100%"
          >
            <View
              width={44}
              height={44}
              borderRadius={22}
              bg="white"
              alignItems="center"
              justifyContent="center"
            >
              <Clock
                size={22}
                color={colors.warning as any}
              />
            </View>
            <YStack flex={1}>
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$warning"
              >
                Offer expires in {expiresInDays} {expiresInDays === 1 ? 'day' : 'days'}
              </Text>
              <Text
                fontSize="$2"
                color="$warning"
                mt={2}
              >
                If they don't respond in time, you can convert the offer to a public job listing.
              </Text>
            </YStack>
          </XStack>

          {/* What Happens Next */}
          <YStack
            bg="$backgroundMuted"
            borderRadius="$4"
            p="$4"
            width="100%"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text
              fontSize="$3"
              fontWeight="600"
              color="$color"
              mb="$3"
            >
              What happens next?
            </Text>
            <YStack gap="$3">
              <XStack
                gap="$3"
                alignItems="flex-start"
              >
                <View
                  width={24}
                  height={24}
                  borderRadius={12}
                  bg="$primary"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={12}
                    fontWeight="600"
                    color="white"
                  >
                    1
                  </Text>
                </View>
                <Text
                  fontSize="$3"
                  color="$colorSubtle"
                  flex={1}
                >
                  {handymanName} will receive a notification about your offer
                </Text>
              </XStack>
              <XStack
                gap="$3"
                alignItems="flex-start"
              >
                <View
                  width={24}
                  height={24}
                  borderRadius={12}
                  bg="$primary"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={12}
                    fontWeight="600"
                    color="white"
                  >
                    2
                  </Text>
                </View>
                <Text
                  fontSize="$3"
                  color="$colorSubtle"
                  flex={1}
                >
                  They can accept or reject your offer
                </Text>
              </XStack>
              <XStack
                gap="$3"
                alignItems="flex-start"
              >
                <View
                  width={24}
                  height={24}
                  borderRadius={12}
                  bg="$primary"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={12}
                    fontWeight="600"
                    color="white"
                  >
                    3
                  </Text>
                </View>
                <Text
                  fontSize="$3"
                  color="$colorSubtle"
                  flex={1}
                >
                  If accepted, the job will start immediately!
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </YStack>

        {/* Bottom Buttons */}
        <YStack
          px="$4"
          gap="$3"
        >
          {!!offerId && (
            <Button
              bg="$primary"
              borderRadius="$4"
              py="$3"
              minHeight={54}
              onPress={() => {
                router.replace({
                  pathname: '/(homeowner)/direct-offers/[id]',
                  params: { id: offerId },
                })
              }}
              pressStyle={{ opacity: 0.9 }}
            >
              <XStack
                alignItems="center"
                gap="$2"
              >
                <Eye
                  size={18}
                  color="white"
                />
                <Text
                  color="white"
                  fontSize="$4"
                  fontWeight="600"
                >
                  View Offer Details
                </Text>
              </XStack>
            </Button>
          )}

          <Button
            bg="white"
            borderColor="$borderColorHover"
            borderWidth={1}
            borderRadius="$4"
            py="$3"
            minHeight={54}
            onPress={() =>
              router.replace({
                pathname: '/(homeowner)/jobs',
                params: { toast: 'direct-offer-sent', tab: 'offers' },
              })
            }
            pressStyle={{ opacity: 0.9 }}
          >
            <XStack
              alignItems="center"
              gap="$2"
            >
              <Home
                size={18}
                color="$color"
              />
              <Text
                color="$color"
                fontSize="$4"
                fontWeight="600"
              >
                Back to Home
              </Text>
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
