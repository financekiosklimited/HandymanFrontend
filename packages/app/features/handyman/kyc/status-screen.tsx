'use client'

import { useState, useCallback } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, PressPresets } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { PageHeader } from '@my/ui'
import {
  useKycStatus,
  useCreateConnectOnboardingLink,
  useCreateIdentitySession,
  formatErrorMessage,
} from '@my/api'
import { useRouter, useNavigation } from 'expo-router'
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  CreditCard,
  UserCheck,
} from '@tamagui/lucide-icons'
import { colors } from '@my/config'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import * as WebBrowser from 'expo-web-browser'
import { Alert } from 'react-native'
import type { IdentityVerificationStatus } from '@my/api'

// ── Helpers ──

function getIdentityStatusConfig(status: IdentityVerificationStatus) {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified',
        color: '$success' as const,
        bgColor: '$successBackground' as const,
        icon: CheckCircle,
        iconColor: '$success' as const,
      }
    case 'pending':
      return {
        label: 'Pending Review',
        color: '$accent' as const,
        bgColor: '$accentBackground' as const,
        icon: Clock,
        iconColor: '$accent' as const,
      }
    case 'requires_input':
      return {
        label: 'Action Required',
        color: '$warning' as const,
        bgColor: '$warningBackground' as const,
        icon: AlertCircle,
        iconColor: '$warning' as const,
      }
    case 'failed':
      return {
        label: 'Failed',
        color: '$error' as const,
        bgColor: '$errorBackground' as const,
        icon: XCircle,
        iconColor: '$error' as const,
      }
    default:
      return {
        label: 'Not Started',
        color: '$placeholderColor' as const,
        bgColor: '$backgroundMuted' as const,
        icon: Clock,
        iconColor: '$placeholderColor' as const,
      }
  }
}

function getConnectStatusConfig(kycData: {
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
}) {
  if (kycData.charges_enabled && kycData.payouts_enabled) {
    return {
      label: 'Active',
      color: '$success' as const,
      bgColor: '$successBackground' as const,
      icon: CheckCircle,
      iconColor: '$success' as const,
    }
  }
  if (kycData.details_submitted) {
    return {
      label: 'Under Review',
      color: '$accent' as const,
      bgColor: '$accentBackground' as const,
      icon: Clock,
      iconColor: '$accent' as const,
    }
  }
  return {
    label: 'Not Set Up',
    color: '$placeholderColor' as const,
    bgColor: '$backgroundMuted' as const,
    icon: AlertCircle,
    iconColor: '$placeholderColor' as const,
  }
}

// ── Stripe Requirement Labels ──

const REQUIREMENT_LABELS: Record<string, string> = {
  // Business / Company profile
  'business.profile.mcc': 'Business Category (MCC)',
  'business.profile.url': 'Business Website',
  'business.profile.name': 'Business Name',
  'business.profile.support_phone': 'Support Phone Number',
  'business.profile.support_email': 'Support Email',
  'business.profile.product_description': 'Business Description',
  'company.name': 'Company Legal Name',
  'company.tax_id': 'Company Tax ID (EIN)',
  'company.phone': 'Company Phone Number',
  'company.address.line1': 'Company Street Address',
  'company.address.line2': 'Company Address Line 2',
  'company.address.city': 'Company City',
  'company.address.state': 'Company State',
  'company.address.postal_code': 'Company ZIP / Postal Code',
  'company.address.country': 'Company Country',

  // Individual / Representative
  'individual.first_name': 'Legal First Name',
  'individual.last_name': 'Legal Last Name',
  'individual.email': 'Email Address',
  'individual.phone': 'Phone Number',
  'individual.dob.day': 'Date of Birth',
  'individual.dob.month': 'Date of Birth',
  'individual.dob.year': 'Date of Birth',
  'individual.address.line1': 'Street Address',
  'individual.address.line2': 'Address Line 2',
  'individual.address.city': 'City',
  'individual.address.state': 'State',
  'individual.address.postal_code': 'ZIP / Postal Code',
  'individual.address.country': 'Country',
  'individual.ssn_last_4': 'Last 4 Digits of SSN',
  'individual.id_number': 'Full SSN or Tax ID',
  'individual.verification.document': 'Identity Document',
  'individual.verification.additional_document': 'Additional Identity Document',

  // External account
  external_account: 'Bank Account or Debit Card',

  // Terms of service
  'tos_acceptance.date': 'Terms of Service Acceptance',
  'tos_acceptance.ip': 'Terms of Service Acceptance',

  // Representative
  'representative.first_name': 'Representative First Name',
  'representative.last_name': 'Representative Last Name',
  'representative.email': 'Representative Email',
  'representative.dob.day': 'Representative Date of Birth',
  'representative.dob.month': 'Representative Date of Birth',
  'representative.dob.year': 'Representative Date of Birth',

  // Owners
  'owners.first_name': 'Business Owner Information',
  'owners.last_name': 'Business Owner Information',
  'relationship.owner': 'Business Ownership Details',
  'relationship.executive': 'Executive Details',
}

/** Known abbreviations for the fallback formatter */
const ABBREVIATIONS: Record<string, string> = {
  mcc: 'Business Category',
  dob: 'Date of Birth',
  tos: 'Terms of Service',
  ssn: 'SSN',
  ein: 'EIN',
  url: 'Website URL',
  id: 'ID',
  ip: 'IP Address',
}

/**
 * Convert a Stripe requirement key to a human-readable label.
 * Uses the static map first, then falls back to smart formatting.
 */
function formatRequirement(key: string): string {
  // Direct lookup
  const mapped = REQUIREMENT_LABELS[key]
  if (mapped) return mapped

  // Fallback: take the last meaningful segment(s) and humanize
  const segments = key.split('.')
  const last = segments[segments.length - 1] ?? key

  // Check abbreviations
  if (ABBREVIATIONS[last]) return ABBREVIATIONS[last]

  // Title-case: replace underscores, capitalize each word
  return last.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Main Screen ──

export function KycStatusScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeArea()
  const { data: kycStatus, isLoading, error, refetch } = useKycStatus()
  const connectOnboardingMutation = useCreateConnectOnboardingLink()
  const identitySessionMutation = useCreateIdentitySession()
  const [actionLoading, setActionLoading] = useState<'identity' | 'connect' | null>(null)

  const handleStartIdentityVerification = useCallback(async () => {
    setActionLoading('identity')
    try {
      const session = await identitySessionMutation.mutateAsync()
      if (session.url) {
        await WebBrowser.openAuthSessionAsync(session.url, 'handymankiosk://kyc/identity/return')
        // Refetch status after returning from browser
        refetch()
      } else {
        Alert.alert(
          'Verification Unavailable',
          'Unable to start identity verification at this time. Please try again later.'
        )
      }
    } catch (err) {
      Alert.alert('Error', formatErrorMessage(err))
    } finally {
      setActionLoading(null)
    }
  }, [identitySessionMutation, refetch])

  const handleStartConnectOnboarding = useCallback(async () => {
    setActionLoading('connect')
    try {
      const link = await connectOnboardingMutation.mutateAsync()
      if (link.url) {
        await WebBrowser.openAuthSessionAsync(link.url, 'handymankiosk://kyc/connect/return')
        // Refetch status after returning from browser
        refetch()
      }
    } catch (err) {
      Alert.alert('Error', formatErrorMessage(err))
    } finally {
      setActionLoading(null)
    }
  }, [connectOnboardingMutation, refetch])

  const identityConfig = kycStatus ? getIdentityStatusConfig(kycStatus.identity_status) : null
  const connectConfig = kycStatus ? getConnectStatusConfig(kycStatus) : null

  const canRetryIdentity =
    kycStatus?.identity_status === 'not_started' ||
    kycStatus?.identity_status === 'requires_input' ||
    kycStatus?.identity_status === 'failed'

  const canSetupConnect = !kycStatus?.charges_enabled || !kycStatus?.payouts_enabled

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="Verification Status"
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
          {isLoading ? (
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
                Loading verification status...
              </Text>
            </YStack>
          ) : error ? (
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
                Failed to load verification status
              </Text>
              <Button
                unstyled
                mt="$4"
                bg="$primary"
                borderRadius={8}
                height={48}
                px="$6"
                onPress={() => refetch()}
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
          ) : kycStatus ? (
            <YStack
              px="$5"
              gap="$5"
            >
              {/* Overall Eligibility Banner */}
              <YStack
                bg={kycStatus.is_eligible ? '$successBackground' : '$warningBackground'}
                borderRadius={12}
                px="$4"
                py="$4"
                borderWidth={1}
                borderColor={kycStatus.is_eligible ? '$success' : '$warning'}
              >
                <XStack
                  alignItems="center"
                  gap="$3"
                >
                  <View
                    width={40}
                    height={40}
                    borderRadius={20}
                    bg={kycStatus.is_eligible ? '$success' : '$warning'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {kycStatus.is_eligible ? (
                      <CheckCircle
                        size={22}
                        color="white"
                      />
                    ) : (
                      <AlertCircle
                        size={22}
                        color="white"
                      />
                    )}
                  </View>
                  <YStack flex={1}>
                    <Text
                      fontSize={16}
                      fontWeight="700"
                      color={kycStatus.is_eligible ? '$success' : '$warning'}
                    >
                      {kycStatus.is_eligible ? 'Eligible for Payments' : 'Verification Incomplete'}
                    </Text>
                    <Text
                      fontSize={13}
                      color={kycStatus.is_eligible ? '$success' : '$warning'}
                      mt="$1"
                      opacity={0.8}
                    >
                      {kycStatus.is_eligible
                        ? 'Your account is fully verified and ready to receive payments.'
                        : 'Complete the steps below to start receiving payments.'}
                    </Text>
                  </YStack>
                </XStack>
              </YStack>

              {/* Identity Verification Card */}
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
                  <UserCheck
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                    flex={1}
                  >
                    Identity Verification
                  </Text>
                  {identityConfig && (
                    <View
                      bg={identityConfig.bgColor}
                      px="$2.5"
                      py="$1"
                      borderRadius={12}
                    >
                      <Text
                        fontSize={11}
                        fontWeight="600"
                        color={identityConfig.color}
                      >
                        {identityConfig.label}
                      </Text>
                    </View>
                  )}
                </XStack>

                {/* Status Details */}
                <YStack
                  px="$4"
                  py="$3.5"
                  gap="$2"
                >
                  <Text
                    fontSize={13}
                    color="$placeholderColor"
                    lineHeight={20}
                  >
                    Verify your identity with a government-issued ID and a selfie. This helps
                    protect both you and homeowners.
                  </Text>

                  {/* Status Row */}
                  {identityConfig && (
                    <XStack
                      alignItems="center"
                      gap="$2"
                      mt="$1"
                    >
                      <identityConfig.icon
                        size={16}
                        color={identityConfig.iconColor}
                      />
                      <Text
                        fontSize={14}
                        color={identityConfig.color}
                        fontWeight="500"
                      >
                        {identityConfig.label}
                      </Text>
                    </XStack>
                  )}
                </YStack>

                {/* Action Button */}
                {canRetryIdentity && (
                  <YStack
                    px="$4"
                    pb="$4"
                  >
                    <Button
                      unstyled
                      bg="$primary"
                      borderRadius={8}
                      height={44}
                      alignItems="center"
                      justifyContent="center"
                      onPress={handleStartIdentityVerification}
                      disabled={actionLoading === 'identity'}
                      opacity={actionLoading === 'identity' ? 0.7 : 1}
                      {...PressPresets.primary}
                    >
                      <XStack
                        alignItems="center"
                        gap="$2"
                      >
                        {actionLoading === 'identity' ? (
                          <Spinner
                            size="small"
                            color="$backgroundStrong"
                          />
                        ) : (
                          <ExternalLink
                            size={16}
                            color="$backgroundStrong"
                          />
                        )}
                        <Text
                          color="$backgroundStrong"
                          fontSize={14}
                          fontWeight="600"
                        >
                          {kycStatus.identity_status === 'not_started'
                            ? 'Start Verification'
                            : 'Retry Verification'}
                        </Text>
                      </XStack>
                    </Button>
                  </YStack>
                )}
              </YStack>

              {/* Payment Account Card */}
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
                  <CreditCard
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                    flex={1}
                  >
                    Payment Account
                  </Text>
                  {connectConfig && (
                    <View
                      bg={connectConfig.bgColor}
                      px="$2.5"
                      py="$1"
                      borderRadius={12}
                    >
                      <Text
                        fontSize={11}
                        fontWeight="600"
                        color={connectConfig.color}
                      >
                        {connectConfig.label}
                      </Text>
                    </View>
                  )}
                </XStack>

                {/* Status Details */}
                <YStack
                  px="$4"
                  py="$3.5"
                  gap="$3"
                >
                  <Text
                    fontSize={13}
                    color="$placeholderColor"
                    lineHeight={20}
                  >
                    Set up your payment account to receive earnings from completed jobs. This
                    includes adding your bank details and personal information.
                  </Text>

                  {/* Detail Rows */}
                  <YStack gap="$2">
                    <XStack
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Text
                        fontSize={14}
                        color="$placeholderColor"
                      >
                        Details Submitted
                      </Text>
                      <XStack
                        alignItems="center"
                        gap="$1.5"
                      >
                        {kycStatus.details_submitted ? (
                          <CheckCircle
                            size={14}
                            color="$success"
                          />
                        ) : (
                          <XCircle
                            size={14}
                            color="$error"
                          />
                        )}
                        <Text
                          fontSize={14}
                          fontWeight="500"
                          color={kycStatus.details_submitted ? '$success' : '$error'}
                        >
                          {kycStatus.details_submitted ? 'Yes' : 'No'}
                        </Text>
                      </XStack>
                    </XStack>

                    <XStack
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Text
                        fontSize={14}
                        color="$placeholderColor"
                      >
                        Can Receive Charges
                      </Text>
                      <XStack
                        alignItems="center"
                        gap="$1.5"
                      >
                        {kycStatus.charges_enabled ? (
                          <CheckCircle
                            size={14}
                            color="$success"
                          />
                        ) : (
                          <XCircle
                            size={14}
                            color="$error"
                          />
                        )}
                        <Text
                          fontSize={14}
                          fontWeight="500"
                          color={kycStatus.charges_enabled ? '$success' : '$error'}
                        >
                          {kycStatus.charges_enabled ? 'Yes' : 'No'}
                        </Text>
                      </XStack>
                    </XStack>

                    <XStack
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Text
                        fontSize={14}
                        color="$placeholderColor"
                      >
                        Can Receive Payouts
                      </Text>
                      <XStack
                        alignItems="center"
                        gap="$1.5"
                      >
                        {kycStatus.payouts_enabled ? (
                          <CheckCircle
                            size={14}
                            color="$success"
                          />
                        ) : (
                          <XCircle
                            size={14}
                            color="$error"
                          />
                        )}
                        <Text
                          fontSize={14}
                          fontWeight="500"
                          color={kycStatus.payouts_enabled ? '$success' : '$error'}
                        >
                          {kycStatus.payouts_enabled ? 'Yes' : 'No'}
                        </Text>
                      </XStack>
                    </XStack>
                  </YStack>

                  {/* Requirements Due */}
                  {kycStatus.requirements_due.length > 0 && (
                    <YStack
                      bg="$warningBackground"
                      borderRadius={8}
                      px="$3"
                      py="$2.5"
                      gap="$1"
                    >
                      <Text
                        fontSize={12}
                        fontWeight="600"
                        color="$warning"
                      >
                        Outstanding Requirements:
                      </Text>
                      {kycStatus.requirements_due.map((req) => (
                        <Text
                          key={req}
                          fontSize={12}
                          color="$warning"
                          opacity={0.8}
                        >
                          {'\u2022'} {formatRequirement(req)}
                        </Text>
                      ))}
                    </YStack>
                  )}
                </YStack>

                {/* Action Button */}
                {canSetupConnect && (
                  <YStack
                    px="$4"
                    pb="$4"
                  >
                    <Button
                      unstyled
                      bg="$primary"
                      borderRadius={8}
                      height={44}
                      alignItems="center"
                      justifyContent="center"
                      onPress={handleStartConnectOnboarding}
                      disabled={actionLoading === 'connect'}
                      opacity={actionLoading === 'connect' ? 0.7 : 1}
                      {...PressPresets.primary}
                    >
                      <XStack
                        alignItems="center"
                        gap="$2"
                      >
                        {actionLoading === 'connect' ? (
                          <Spinner
                            size="small"
                            color="$backgroundStrong"
                          />
                        ) : (
                          <ExternalLink
                            size={16}
                            color="$backgroundStrong"
                          />
                        )}
                        <Text
                          color="$backgroundStrong"
                          fontSize={14}
                          fontWeight="600"
                        >
                          {kycStatus.details_submitted
                            ? 'Update Account Details'
                            : 'Set Up Payment Account'}
                        </Text>
                      </XStack>
                    </Button>
                  </YStack>
                )}
              </YStack>
            </YStack>
          ) : null}
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
