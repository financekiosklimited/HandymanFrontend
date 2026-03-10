'use client'

import { useState, useCallback } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, PressPresets } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { PageHeader } from '@my/ui'
import { useWalletBalance, useCreateWithdrawal, formatErrorMessage } from '@my/api'
import { useRouter, useNavigation } from 'expo-router'
import { ArrowDownCircle, Zap, Clock, AlertCircle } from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { Alert, TextInput, StyleSheet } from 'react-native'
import type { WithdrawalMethod } from '@my/api'

// ── Helpers ──

function formatCurrency(amount: string | number) {
  const num = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (Number.isNaN(num)) return '$0.00'
  return `$${num.toFixed(2)}`
}

// ── Main Screen ──

export function WithdrawScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeArea()
  const { data: balance, isLoading: balanceLoading } = useWalletBalance()
  const withdrawMutation = useCreateWithdrawal()

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<WithdrawalMethod>('standard')

  const availableAmount = balance ? Number.parseFloat(balance.available_amount) : 0
  const enteredAmount = Number.parseFloat(amount) || 0
  const isValidAmount = enteredAmount > 0 && enteredAmount <= availableAmount

  const handleWithdraw = useCallback(async () => {
    if (!isValidAmount) return

    const methodLabel = method === 'instant' ? 'Instant' : 'Standard'
    const feeNote = method === 'instant' ? '\n\nNote: Instant payouts may include a small fee.' : ''

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw ${formatCurrency(enteredAmount)} via ${methodLabel} payout?${feeNote}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await withdrawMutation.mutateAsync({
                amount: enteredAmount,
                method,
              })
              Alert.alert(
                'Withdrawal Requested',
                `Your ${methodLabel.toLowerCase()} withdrawal of ${formatCurrency(enteredAmount)} has been submitted.`,
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              )
            } catch (err) {
              Alert.alert('Withdrawal Failed', formatErrorMessage(err))
            }
          },
        },
      ]
    )
  }, [isValidAmount, enteredAmount, method, withdrawMutation, router])

  const handleSetMax = useCallback(() => {
    if (availableAmount > 0) {
      setAmount(availableAmount.toFixed(2))
    }
  }, [availableAmount])

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="Withdraw Funds"
          onBack={() => {
            if (navigation.canGoBack()) {
              router.back()
            } else {
              router.replace('/(handyman)/wallet')
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
            </YStack>
          ) : (
            <YStack
              px="$5"
              gap="$5"
            >
              {/* Available Balance Display */}
              <YStack
                bg="$backgroundStrong"
                borderRadius={12}
                borderWidth={1}
                borderColor="$backgroundHover"
                px="$4"
                py="$4"
                alignItems="center"
              >
                <Text
                  fontSize={13}
                  color="$placeholderColor"
                >
                  Available to Withdraw
                </Text>
                <Text
                  fontSize={28}
                  fontWeight="700"
                  color="$color"
                  mt="$1"
                >
                  {formatCurrency(availableAmount)}
                </Text>
              </YStack>

              {/* Amount Input */}
              <YStack
                bg="$backgroundStrong"
                borderRadius={12}
                borderWidth={1}
                borderColor="$backgroundHover"
                overflow="hidden"
              >
                <YStack
                  px="$4"
                  py="$3.5"
                  gap="$3"
                >
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                  >
                    Amount
                  </Text>

                  <XStack
                    alignItems="center"
                    gap="$2"
                  >
                    <Text
                      fontSize={24}
                      fontWeight="700"
                      color="$color"
                    >
                      $
                    </Text>
                    <TextInput
                      style={styles.amountInput}
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0.00"
                      placeholderTextColor="#666"
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                    />
                    <Button
                      unstyled
                      bg="$backgroundHover"
                      px="$3"
                      py="$1.5"
                      borderRadius={8}
                      onPress={handleSetMax}
                      {...PressPresets.filter}
                    >
                      <Text
                        fontSize={13}
                        fontWeight="600"
                        color="$primary"
                      >
                        MAX
                      </Text>
                    </Button>
                  </XStack>

                  {enteredAmount > availableAmount && (
                    <XStack
                      alignItems="center"
                      gap="$1.5"
                    >
                      <AlertCircle
                        size={13}
                        color="$error"
                      />
                      <Text
                        fontSize={12}
                        color="$error"
                      >
                        Amount exceeds available balance
                      </Text>
                    </XStack>
                  )}
                </YStack>
              </YStack>

              {/* Payout Method Selection */}
              <YStack
                bg="$backgroundStrong"
                borderRadius={12}
                borderWidth={1}
                borderColor="$backgroundHover"
                overflow="hidden"
              >
                <YStack
                  px="$4"
                  py="$3.5"
                  gap="$3"
                >
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                  >
                    Payout Method
                  </Text>

                  {/* Standard Option */}
                  <Button
                    unstyled
                    bg={method === 'standard' ? '$primary' : '$backgroundHover'}
                    borderRadius={10}
                    px="$4"
                    py="$3.5"
                    onPress={() => setMethod('standard')}
                    borderWidth={method === 'standard' ? 0 : 1}
                    borderColor="$borderColor"
                    {...PressPresets.card}
                  >
                    <XStack
                      alignItems="center"
                      gap="$3"
                    >
                      <Clock
                        size={22}
                        color={method === 'standard' ? '$backgroundStrong' : '$placeholderColor'}
                      />
                      <YStack flex={1}>
                        <Text
                          fontSize={15}
                          fontWeight="600"
                          color={method === 'standard' ? '$backgroundStrong' : '$color'}
                        >
                          Standard Payout
                        </Text>
                        <Text
                          fontSize={12}
                          color={method === 'standard' ? '$backgroundStrong' : '$placeholderColor'}
                          opacity={method === 'standard' ? 0.8 : 1}
                          mt="$0.5"
                        >
                          1-2 business days {'\u2022'} No fee
                        </Text>
                      </YStack>
                    </XStack>
                  </Button>

                  {/* Instant Option */}
                  <Button
                    unstyled
                    bg={method === 'instant' ? '$primary' : '$backgroundHover'}
                    borderRadius={10}
                    px="$4"
                    py="$3.5"
                    onPress={() => setMethod('instant')}
                    borderWidth={method === 'instant' ? 0 : 1}
                    borderColor="$borderColor"
                    {...PressPresets.card}
                  >
                    <XStack
                      alignItems="center"
                      gap="$3"
                    >
                      <Zap
                        size={22}
                        color={method === 'instant' ? '$backgroundStrong' : '$placeholderColor'}
                      />
                      <YStack flex={1}>
                        <Text
                          fontSize={15}
                          fontWeight="600"
                          color={method === 'instant' ? '$backgroundStrong' : '$color'}
                        >
                          Instant Payout
                        </Text>
                        <Text
                          fontSize={12}
                          color={method === 'instant' ? '$backgroundStrong' : '$placeholderColor'}
                          opacity={method === 'instant' ? 0.8 : 1}
                          mt="$0.5"
                        >
                          Within minutes {'\u2022'} Small fee applies
                        </Text>
                      </YStack>
                    </XStack>
                  </Button>
                </YStack>
              </YStack>

              {/* Submit Button */}
              <Button
                unstyled
                bg="$primary"
                borderRadius={10}
                height={52}
                alignItems="center"
                justifyContent="center"
                onPress={handleWithdraw}
                disabled={!isValidAmount || withdrawMutation.isPending}
                opacity={!isValidAmount || withdrawMutation.isPending ? 0.5 : 1}
                {...PressPresets.primary}
              >
                <XStack
                  alignItems="center"
                  gap="$2"
                >
                  {withdrawMutation.isPending ? (
                    <Spinner
                      size="small"
                      color="$backgroundStrong"
                    />
                  ) : (
                    <ArrowDownCircle
                      size={20}
                      color="$backgroundStrong"
                    />
                  )}
                  <Text
                    color="$backgroundStrong"
                    fontSize={16}
                    fontWeight="700"
                  >
                    {withdrawMutation.isPending
                      ? 'Processing...'
                      : `Withdraw ${enteredAmount > 0 ? formatCurrency(enteredAmount) : ''}`}
                  </Text>
                </XStack>
              </Button>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    padding: 0,
  },
})
