'use client'

import { useCallback } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, PressPresets } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { PageHeader } from '@my/ui'
import { useWalletBalance, useWithdrawals, formatErrorMessage } from '@my/api'
import { useRouter, useNavigation } from 'expo-router'
import {
  Wallet,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  RefreshCw,
} from '@tamagui/lucide-icons'
import { colors } from '@my/config'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import type { WithdrawalStatus } from '@my/api'

// ── Helpers ──

function formatCurrency(amount: string | number, currency = 'usd') {
  const num = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (Number.isNaN(num)) return '$0.00'
  return `$${num.toFixed(2)}`
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

function getWithdrawalStatusConfig(status: WithdrawalStatus) {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        color: '$success',
        bgColor: '$successBackground',
        icon: CheckCircle,
        iconColor: colors.success,
      }
    case 'processing':
      return {
        label: 'Processing',
        color: '$accent',
        bgColor: '$accentBackground',
        icon: Clock,
        iconColor: colors.accent,
      }
    case 'requested':
      return {
        label: 'Requested',
        color: '$info',
        bgColor: '$infoBackground',
        icon: Clock,
        iconColor: colors.info,
      }
    case 'failed':
      return {
        label: 'Failed',
        color: '$error',
        bgColor: '$errorBackground',
        icon: XCircle,
        iconColor: colors.error,
      }
    case 'canceled':
      return {
        label: 'Canceled',
        color: '$placeholderColor',
        bgColor: '$backgroundMuted',
        icon: XCircle,
        iconColor: colors.placeholderColor,
      }
    default:
      return {
        label: status,
        color: '$placeholderColor',
        bgColor: '$backgroundMuted',
        icon: AlertCircle,
        iconColor: colors.placeholderColor,
      }
  }
}

// ── Main Screen ──

export function WalletScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeArea()
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useWalletBalance()
  const {
    data: withdrawalPages,
    isLoading: withdrawalsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWithdrawals()

  const withdrawals = withdrawalPages?.pages.flatMap((page) => page.results) ?? []

  const handleWithdraw = useCallback(() => {
    router.push('/(handyman)/wallet/withdraw')
  }, [router])

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="My Wallet"
          onBack={() => {
            if (navigation.canGoBack()) {
              router.back()
            } else {
              router.replace('/(handyman)/profile')
            }
          }}
        />

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {balanceLoading ? (
            <YStack
              flex={1}
              py="$10"
              alignItems="center"
              justifyContent="center"
            >
              <Spinner
                size="large"
                color="$primary"
              />
              <Text
                color="$placeholderColor"
                mt="$3"
                fontSize={14}
              >
                Loading wallet...
              </Text>
            </YStack>
          ) : balanceError ? (
            <YStack
              flex={1}
              py="$10"
              alignItems="center"
              justifyContent="center"
              px="$5"
            >
              <Text
                color="$error"
                textAlign="center"
                fontSize={14}
              >
                Failed to load wallet balance
              </Text>
              <Button
                unstyled
                mt="$4"
                bg="$primary"
                borderRadius={8}
                height={48}
                px="$6"
                onPress={() => refetchBalance()}
                {...PressPresets.primary}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color="$backgroundStrong"
                  fontSize={15}
                  fontWeight="600"
                >
                  Retry
                </Text>
              </Button>
            </YStack>
          ) : (
            <YStack
              px="$5"
              gap="$5"
            >
              {/* Balance Card */}
              <YStack
                bg="$backgroundStrong"
                borderRadius={12}
                borderWidth={1}
                borderColor="$backgroundHover"
                overflow="hidden"
              >
                <YStack
                  px="$5"
                  py="$5"
                  alignItems="center"
                  gap="$2"
                >
                  <View
                    width={56}
                    height={56}
                    borderRadius={28}
                    bg="$primary"
                    alignItems="center"
                    justifyContent="center"
                    opacity={0.15}
                  >
                    <Wallet
                      size={28}
                      color="$primary"
                    />
                  </View>
                  <View
                    position="absolute"
                    top={20}
                    alignItems="center"
                    justifyContent="center"
                    width={56}
                    height={56}
                  >
                    <Wallet
                      size={28}
                      color="$primary"
                    />
                  </View>

                  <Text
                    fontSize={13}
                    color="$placeholderColor"
                    mt="$2"
                  >
                    Available Balance
                  </Text>
                  <Text
                    fontSize={32}
                    fontWeight="700"
                    color="$color"
                  >
                    {balance ? formatCurrency(balance.available_amount) : '$0.00'}
                  </Text>

                  {balance && Number.parseFloat(balance.pending_amount) > 0 && (
                    <XStack
                      alignItems="center"
                      gap="$1.5"
                    >
                      <Clock
                        size={13}
                        color="$placeholderColor"
                      />
                      <Text
                        fontSize={13}
                        color="$placeholderColor"
                      >
                        {formatCurrency(balance.pending_amount)} pending
                      </Text>
                    </XStack>
                  )}
                </YStack>

                {/* Withdraw Button */}
                <YStack
                  px="$4"
                  pb="$4"
                >
                  <Button
                    unstyled
                    bg="$primary"
                    borderRadius={8}
                    height={48}
                    alignItems="center"
                    justifyContent="center"
                    onPress={handleWithdraw}
                    disabled={!balance || Number.parseFloat(balance.available_amount) <= 0}
                    opacity={!balance || Number.parseFloat(balance.available_amount) <= 0 ? 0.5 : 1}
                    {...PressPresets.primary}
                  >
                    <XStack
                      alignItems="center"
                      gap="$2"
                    >
                      <ArrowDownCircle
                        size={18}
                        color="$backgroundStrong"
                      />
                      <Text
                        color="$backgroundStrong"
                        fontSize={15}
                        fontWeight="600"
                      >
                        Withdraw Funds
                      </Text>
                    </XStack>
                  </Button>
                </YStack>
              </YStack>

              {/* Withdrawal History */}
              <YStack
                bg="$backgroundStrong"
                borderRadius={12}
                borderWidth={1}
                borderColor="$backgroundHover"
                overflow="hidden"
              >
                {/* Section Header */}
                <XStack
                  px="$4"
                  py="$3.5"
                  alignItems="center"
                  gap="$2.5"
                  borderBottomWidth={1}
                  borderBottomColor="$borderColor"
                >
                  <DollarSign
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                  >
                    Withdrawal History
                  </Text>
                </XStack>

                {withdrawalsLoading ? (
                  <YStack
                    py="$6"
                    alignItems="center"
                  >
                    <Spinner
                      size="small"
                      color="$primary"
                    />
                  </YStack>
                ) : withdrawals.length === 0 ? (
                  <YStack
                    py="$6"
                    alignItems="center"
                    px="$4"
                  >
                    <Text
                      fontSize={14}
                      color="$placeholderColor"
                      textAlign="center"
                    >
                      No withdrawals yet
                    </Text>
                  </YStack>
                ) : (
                  <YStack>
                    {withdrawals.map((withdrawal, index) => {
                      const statusConfig = getWithdrawalStatusConfig(withdrawal.status)
                      const isLast = index === withdrawals.length - 1

                      return (
                        <XStack
                          key={withdrawal.public_id}
                          px="$4"
                          py="$3.5"
                          alignItems="center"
                          borderBottomWidth={isLast ? 0 : 1}
                          borderBottomColor="$borderColor"
                        >
                          <YStack
                            flex={1}
                            gap="$0.5"
                          >
                            <XStack
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Text
                                fontSize={15}
                                fontWeight="600"
                                color="$color"
                              >
                                {formatCurrency(withdrawal.amount)}
                              </Text>
                              <View
                                bg={statusConfig.bgColor}
                                px="$2"
                                py="$0.5"
                                borderRadius={8}
                              >
                                <Text
                                  fontSize={11}
                                  fontWeight="600"
                                  color={statusConfig.color}
                                >
                                  {statusConfig.label}
                                </Text>
                              </View>
                            </XStack>
                            <XStack
                              alignItems="center"
                              gap="$2"
                            >
                              <Text
                                fontSize={12}
                                color="$placeholderColor"
                                textTransform="capitalize"
                              >
                                {withdrawal.method} payout
                              </Text>
                              <Text
                                fontSize={12}
                                color="$placeholderColor"
                              >
                                {'\u2022'}
                              </Text>
                              <Text
                                fontSize={12}
                                color="$placeholderColor"
                              >
                                {formatDate(withdrawal.requested_at)}
                              </Text>
                            </XStack>
                            {withdrawal.instant_fee &&
                              Number.parseFloat(withdrawal.instant_fee) > 0 && (
                                <Text
                                  fontSize={11}
                                  color="$placeholderColor"
                                  opacity={0.7}
                                >
                                  Instant fee: {formatCurrency(withdrawal.instant_fee)}
                                </Text>
                              )}
                            {withdrawal.failure_message && (
                              <Text
                                fontSize={12}
                                color="$error"
                                mt="$0.5"
                              >
                                {withdrawal.failure_message}
                              </Text>
                            )}
                          </YStack>
                        </XStack>
                      )
                    })}

                    {/* Load More */}
                    {hasNextPage && (
                      <YStack
                        py="$3"
                        alignItems="center"
                      >
                        <Button
                          unstyled
                          onPress={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          {...PressPresets.secondary}
                        >
                          {isFetchingNextPage ? (
                            <Spinner
                              size="small"
                              color="$primary"
                            />
                          ) : (
                            <Text
                              fontSize={14}
                              color="$primary"
                              fontWeight="500"
                            >
                              Load More
                            </Text>
                          )}
                        </Button>
                      </YStack>
                    )}
                  </YStack>
                )}
              </YStack>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
