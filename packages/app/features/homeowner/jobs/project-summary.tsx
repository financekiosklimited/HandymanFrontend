'use client'

import { useMemo } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  View,
  Image,
  PageHeader,
  useConfirmDialog,
  PressPresets,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import {
  useHomeownerJob,
  useHomeownerDailyReports,
  useHomeownerWorkSessions,
  useReviewDailyReport,
  useApproveJobCompletion,
  useRejectJobCompletion,
} from '@my/api'
import type { DailyReport, DailyReportStatus } from '@my/api'
import {
  FileText,
  Clock,
  MapPin,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  ThumbsUp,
  ThumbsDown,
} from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import { showJobCompletedToast, showSubmissionErrorToast } from 'app/utils/toast-messages'
import { colors } from '@my/config'
import { Alert } from 'react-native'

interface ProjectSummaryScreenProps {
  jobId: string
}

const reportStatusColors: Record<DailyReportStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: '$warningBackground', text: '$warning', label: 'Pending Review' },
  approved: { bg: '$successBackground', text: '$success', label: 'Approved' },
  rejected: { bg: '$errorBackground', text: '$error', label: 'Rejected' },
}

interface ReportTimelineCardProps {
  report: DailyReport
  dayNumber: number
  onApprove: () => void
  onReject: () => void
  isReviewing: boolean
}

function ReportTimelineCard({
  report,
  dayNumber,
  onApprove,
  onReject,
  isReviewing,
}: ReportTimelineCardProps) {
  const statusStyle = reportStatusColors[report.status]
  const hours = Math.floor(report.total_work_duration_seconds / 3600)
  const minutes = Math.floor((report.total_work_duration_seconds % 3600) / 60)

  return (
    <YStack
      bg="rgba(255,255,255,0.95)"
      borderRadius={16}
      p="$md"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.08)"
      gap="$sm"
    >
      {/* Header */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
      >
        <XStack
          alignItems="center"
          gap="$sm"
        >
          <YStack
            width={40}
            height={40}
            borderRadius={10}
            bg="$primaryBackground"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontSize={10}
              color="$colorSubtle"
              fontWeight="500"
            >
              DAY
            </Text>
            <Text
              fontSize="$4"
              fontWeight="700"
              color="$primary"
            >
              {dayNumber}
            </Text>
          </YStack>
          <YStack>
            <Text
              fontSize="$3"
              fontWeight="600"
              color="$color"
            >
              {new Date(report.report_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <XStack
              alignItems="center"
              gap="$xs"
            >
              <Clock
                size={12}
                color="$colorSubtle"
              />
              <Text
                fontSize="$2"
                color="$colorSubtle"
              >
                {hours}h {minutes}m worked
              </Text>
            </XStack>
          </YStack>
        </XStack>
        <XStack
          bg={statusStyle.bg as any}
          px="$sm"
          py={4}
          borderRadius="$full"
        >
          <Text
            fontSize={10}
            fontWeight="600"
            color={statusStyle.text as any}
            textTransform="uppercase"
          >
            {statusStyle.label}
          </Text>
        </XStack>
      </XStack>

      {/* Summary */}
      <Text
        fontSize="$3"
        color="$color"
        numberOfLines={3}
      >
        {report.summary}
      </Text>

      {/* Tasks */}
      {report.tasks_worked && report.tasks_worked.length > 0 && (
        <YStack gap="$xs">
          <Text
            fontSize="$2"
            color="$colorSubtle"
            fontWeight="500"
          >
            Tasks Worked:
          </Text>
          {report.tasks_worked.slice(0, 3).map((taskItem) => (
            <XStack
              key={taskItem.public_id}
              alignItems="center"
              gap="$xs"
            >
              {taskItem.marked_complete ? (
                <CheckCircle2
                  size={14}
                  color="$success"
                />
              ) : (
                <AlertCircle
                  size={14}
                  color="$colorSubtle"
                />
              )}
              <Text
                fontSize="$2"
                color={taskItem.marked_complete ? '$success' : '$color'}
                numberOfLines={1}
              >
                {taskItem.task.title}
              </Text>
            </XStack>
          ))}
          {report.tasks_worked.length > 3 && (
            <Text
              fontSize="$2"
              color="$colorSubtle"
            >
              +{report.tasks_worked.length - 3} more tasks
            </Text>
          )}
        </YStack>
      )}

      {/* Review feedback */}
      {report.homeowner_comment && (
        <YStack
          bg={report.status === 'rejected' ? '$errorBackground' : '$successBackground'}
          p="$sm"
          borderRadius={8}
        >
          <Text
            fontSize="$2"
            color={report.status === 'rejected' ? '$error' : '$success'}
          >
            Your feedback: {report.homeowner_comment}
          </Text>
        </YStack>
      )}

      {/* Action Buttons - Only for pending reports */}
      {report.status === 'pending' && (
        <XStack
          gap="$sm"
          mt="$xs"
        >
          <Button
            flex={1}
            bg="$successBackground"
            borderRadius="$md"
            py="$sm"
            onPress={onApprove}
            disabled={isReviewing}
            {...PressPresets.primary}
          >
            <XStack
              alignItems="center"
              gap="$xs"
            >
              <ThumbsUp
                size={16}
                color="$success"
              />
              <Text
                color="$success"
                fontWeight="600"
                fontSize="$2"
              >
                Approve
              </Text>
            </XStack>
          </Button>
          <Button
            flex={1}
            bg="$errorBackground"
            borderRadius="$md"
            py="$sm"
            onPress={onReject}
            disabled={isReviewing}
            {...PressPresets.primary}
          >
            <XStack
              alignItems="center"
              gap="$xs"
            >
              <ThumbsDown
                size={16}
                color="$error"
              />
              <Text
                color="$error"
                fontWeight="600"
                fontSize="$2"
              >
                Reject
              </Text>
            </XStack>
          </Button>
        </XStack>
      )}
    </YStack>
  )
}

export function ProjectSummaryScreen({ jobId }: ProjectSummaryScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { showConfirm, ConfirmDialogWrapper } = useConfirmDialog()

  // Fetch job details
  const { data: job, isLoading: jobLoading, refetch: refetchJob } = useHomeownerJob(jobId)

  // Fetch daily reports
  const {
    data: reports,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useHomeownerDailyReports(jobId)

  // Fetch work sessions
  const { data: sessions } = useHomeownerWorkSessions(jobId)

  // Mutations
  const reviewReportMutation = useReviewDailyReport()
  const approveCompletionMutation = useApproveJobCompletion()
  const rejectCompletionMutation = useRejectJobCompletion()

  // Calculate totals
  const stats = useMemo(() => {
    if (!reports) return { totalHours: 0, totalDays: 0, approvedReports: 0, pendingReports: 0 }

    const totalSeconds = reports.reduce((acc, r) => acc + r.total_work_duration_seconds, 0)
    const totalHours = Math.round(totalSeconds / 3600)
    const totalDays = reports.length
    const approvedReports = reports.filter((r) => r.status === 'approved').length
    const pendingReports = reports.filter((r) => r.status === 'pending').length

    return { totalHours, totalDays, approvedReports, pendingReports }
  }, [reports])

  const handleApproveReport = async (reportId: string) => {
    try {
      await reviewReportMutation.mutateAsync({
        jobId,
        reportId,
        data: { decision: 'approved' },
      })
      showSubmissionErrorToast(toast, 'Report approved successfully')
      refetchReports()
    } catch (error: any) {
      showSubmissionErrorToast(toast, error?.message)
    }
  }

  const handleRejectReport = (reportId: string) => {
    Alert.prompt(
      'Reject Report',
      'Please provide feedback for the handyman:',
      async (feedback) => {
        if (feedback !== null) {
          try {
            await reviewReportMutation.mutateAsync({
              jobId,
              reportId,
              data: { decision: 'rejected', comment: feedback || undefined },
            })
            showSubmissionErrorToast(toast, 'Report rejected')
            refetchReports()
          } catch (error: any) {
            showSubmissionErrorToast(toast, error?.message)
          }
        }
      },
      'plain-text',
      ''
    )
  }

  const handleApproveCompletion = () => {
    showConfirm({
      title: 'Approve Completion',
      description:
        'This will mark the job as completed and release payment to the handyman. This action cannot be undone.',
      type: 'success',
      confirmText: 'Approve & Release',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await approveCompletionMutation.mutateAsync(jobId)
          router.back()
        } catch (error: any) {
          showSubmissionErrorToast(toast, error?.message)
        }
      },
    })
  }

  const handleRejectCompletion = () => {
    Alert.prompt(
      'Reject Completion',
      'Please provide a reason for rejection:',
      async (reason) => {
        if (reason !== null) {
          try {
            await rejectCompletionMutation.mutateAsync({
              jobId,
              data: { reason: reason || undefined },
            })
            showSubmissionErrorToast(toast, 'Completion rejected')
            refetchJob()
          } catch (error: any) {
            showSubmissionErrorToast(toast, error?.message)
          }
        }
      },
      'plain-text',
      ''
    )
  }

  if (jobLoading) {
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
          <Text color="$colorSubtle">Loading project...</Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (!job) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          gap="$md"
          px="$xl"
        >
          <AlertCircle
            size={48}
            color="$error"
          />
          <Text
            color="$color"
            fontSize="$5"
            fontWeight="600"
          >
            Job Not Found
          </Text>
          <Button
            bg="$primary"
            borderRadius="$lg"
            px="$xl"
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </YStack>
      </GradientBackground>
    )
  }

  const attachments = 'attachments' in job ? job.attachments : undefined
  const firstAttachment = attachments?.[0]
  const isVideoAttachment = firstAttachment?.file_type === 'video'
  const isImageAttachment = firstAttachment?.file_type === 'image'
  const previewImage = isVideoAttachment
    ? firstAttachment?.thumbnail_url
    : isImageAttachment
      ? firstAttachment?.file_url
      : undefined
  const isPendingCompletion = job.status === 'pending_completion'
  const isCompleted = job.status === 'completed'

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="Project Summary"
          description={PAGE_DESCRIPTIONS['ongoing-dashboard']}
        />

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            pb="$2xl"
            gap="$lg"
          >
            {/* Job Info Card */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={20}
              overflow="hidden"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              position="relative"
            >
              {!!previewImage && (
                <Image
                  source={{ uri: previewImage }}
                  width="100%"
                  height={140}
                  resizeMode="cover"
                />
              )}

              {isVideoAttachment && previewImage && (
                <View
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height={140}
                  alignItems="center"
                  justifyContent="center"
                >
                  <View
                    bg="rgba(0, 0, 0, 0.45)"
                    borderRadius="$full"
                    p="$2"
                  >
                    <Play
                      size={20}
                      color="white"
                      fill="white"
                    />
                  </View>
                </View>
              )}
              <YStack
                p="$md"
                gap="$sm"
              >
                <Text
                  fontSize="$5"
                  fontWeight="700"
                  color="$color"
                >
                  {job.title}
                </Text>
                {job.assigned_handyman && (
                  <XStack
                    alignItems="center"
                    gap="$sm"
                  >
                    <View
                      width={32}
                      height={32}
                      borderRadius="$full"
                      bg="$primaryBackground"
                      alignItems="center"
                      justifyContent="center"
                      overflow="hidden"
                    >
                      {job.assigned_handyman.avatar_url ? (
                        <Image
                          source={{ uri: job.assigned_handyman.avatar_url }}
                          width={32}
                          height={32}
                        />
                      ) : (
                        <User
                          size={16}
                          color="$primary"
                        />
                      )}
                    </View>
                    <YStack>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                      >
                        Handyman
                      </Text>
                      <Text
                        fontSize="$3"
                        fontWeight="500"
                        color="$color"
                      >
                        {job.assigned_handyman.display_name}
                      </Text>
                    </YStack>
                  </XStack>
                )}
              </YStack>
            </YStack>

            {/* Stats */}
            <XStack gap="$sm">
              <YStack
                flex={1}
                bg="rgba(255,255,255,0.95)"
                borderRadius={16}
                p="$md"
                alignItems="center"
              >
                <Calendar
                  size={20}
                  color="$primary"
                />
                <Text
                  fontSize="$6"
                  fontWeight="700"
                  color="$color"
                >
                  {stats.totalDays}
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  Days
                </Text>
              </YStack>
              <YStack
                flex={1}
                bg="rgba(255,255,255,0.95)"
                borderRadius={16}
                p="$md"
                alignItems="center"
              >
                <Clock
                  size={20}
                  color="$primary"
                />
                <Text
                  fontSize="$6"
                  fontWeight="700"
                  color="$color"
                >
                  {stats.totalHours}
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  Hours
                </Text>
              </YStack>
              <YStack
                flex={1}
                bg="rgba(255,255,255,0.95)"
                borderRadius={16}
                p="$md"
                alignItems="center"
              >
                <CheckCircle2
                  size={20}
                  color="$success"
                />
                <Text
                  fontSize="$6"
                  fontWeight="700"
                  color="$color"
                >
                  {stats.approvedReports}
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  Approved
                </Text>
              </YStack>
            </XStack>

            {/* Pending Completion Actions */}
            {isPendingCompletion && (
              <YStack
                bg="$warningBackground"
                borderRadius={16}
                p="$md"
                borderWidth={1}
                borderColor="rgba(255,193,7,0.3)"
                gap="$md"
              >
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <AlertCircle
                    size={20}
                    color={colors.warning as any}
                  />
                  <Text
                    fontSize="$4"
                    fontWeight="600"
                    color="$warning"
                  >
                    Completion Requested
                  </Text>
                </XStack>
                <Text
                  fontSize="$3"
                  color="$color"
                >
                  The handyman has requested job completion. Review the work and approve to release
                  payment.
                </Text>
                <XStack gap="$sm">
                  <Button
                    flex={1}
                    bg="$success"
                    borderRadius="$md"
                    py="$md"
                    onPress={handleApproveCompletion}
                    {...PressPresets.primary}
                  >
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      <DollarSign
                        size={18}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontWeight="600"
                      >
                        Approve & Pay
                      </Text>
                    </XStack>
                  </Button>
                  <Button
                    flex={1}
                    bg="$error"
                    borderRadius="$md"
                    py="$md"
                    onPress={handleRejectCompletion}
                    {...PressPresets.primary}
                  >
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      <XCircle
                        size={18}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontWeight="600"
                      >
                        Reject
                      </Text>
                    </XStack>
                  </Button>
                </XStack>
              </YStack>
            )}

            {/* Completed Banner */}
            {isCompleted && (
              <YStack
                bg="$successBackground"
                borderRadius={16}
                p="$md"
                borderWidth={1}
                borderColor="rgba(34,197,94,0.3)"
              >
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <CheckCircle2
                    size={24}
                    color="$success"
                  />
                  <YStack>
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color="$success"
                    >
                      Job Completed
                    </Text>
                    <Text
                      fontSize="$2"
                      color="$success"
                    >
                      Payment has been released to the handyman
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            )}

            {/* Daily Reports Timeline */}
            <YStack gap="$md">
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <FileText
                  size={20}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Daily Reports
                </Text>
                {stats.pendingReports > 0 && (
                  <View
                    bg="$warning"
                    px="$sm"
                    py={2}
                    borderRadius="$full"
                  >
                    <Text
                      fontSize={10}
                      fontWeight="600"
                      color="white"
                    >
                      {stats.pendingReports} PENDING
                    </Text>
                  </View>
                )}
              </XStack>

              {reportsLoading ? (
                <YStack
                  py="$lg"
                  alignItems="center"
                >
                  <Spinner
                    size="small"
                    color="$primary"
                  />
                </YStack>
              ) : reports && reports.length > 0 ? (
                <YStack gap="$sm">
                  {reports.map((report, index) => (
                    <ReportTimelineCard
                      key={report.public_id}
                      report={report}
                      dayNumber={reports.length - index}
                      onApprove={() => handleApproveReport(report.public_id)}
                      onReject={() => handleRejectReport(report.public_id)}
                      isReviewing={reviewReportMutation.isPending}
                    />
                  ))}
                </YStack>
              ) : (
                <YStack
                  bg="rgba(255,255,255,0.7)"
                  borderRadius={16}
                  p="$lg"
                  alignItems="center"
                  gap="$sm"
                >
                  <FileText
                    size={32}
                    color="$colorSubtle"
                  />
                  <Text
                    color="$colorSubtle"
                    fontSize="$3"
                    textAlign="center"
                  >
                    No reports submitted yet
                  </Text>
                </YStack>
              )}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Confirm Dialog */}
        <ConfirmDialogWrapper />
      </YStack>
    </GradientBackground>
  )
}
