'use client'

import { useState, useCallback } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image, TextArea } from '@my/ui'
import { GradientBackground, ImageViewer } from '@my/ui'
import {
  useHomeownerJobDashboard,
  useHomeownerDailyReports,
  useHomeownerWorkSessions,
  useApproveJobCompletion,
  useRejectJobCompletion,
  useReviewDailyReport,
  useCreateDispute,
  useCreateHandymanReview,
  useJobChatUnreadCount,
  useHomeownerReimbursements,
  useReviewReimbursement,
} from '@my/api'
import type {
  DashboardTask,
  DailyReport,
  DailyReportStatus,
  WorkSession,
  SessionMediaItem,
  HandymanReview,
  JobReimbursement,
  ReimbursementStatus,
} from '@my/api'
import {
  ArrowLeft,
  Play,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Timer,
  ListChecks,
  Award,
  Briefcase,
  X,
  History,
  ChevronDown,
  ChevronUp,
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MapPin,
  User,
  Hourglass,
  MessageCircle,
  Receipt,
  ExternalLink,
} from '@tamagui/lucide-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import {
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
} from 'react-native'

interface HomeownerJobDashboardProps {
  jobId: string
}

// Chat Button Component with Unread Badge
function ChatButton({ jobId }: { jobId: string }) {
  const router = useRouter()
  const { data: unreadCount = 0 } = useJobChatUnreadCount('homeowner', jobId)

  const handlePress = () => {
    router.push({
      pathname: '/(homeowner)/jobs/ongoing/chat/[id]',
      params: { id: jobId },
    } as any)
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{ padding: 8, position: 'relative' }}
    >
      <MessageCircle
        size={22}
        color="#0C9A5C"
      />
      {unreadCount > 0 && (
        <View
          position="absolute"
          top={2}
          right={2}
          minWidth={18}
          height={18}
          borderRadius={9}
          bg="#EF4444"
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Text
            fontSize={10}
            fontWeight="700"
            color="white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

// Star Rating Component
function StarRating({
  rating,
  setRating,
  size = 32,
  interactive = true,
}: {
  rating: number
  setRating?: (r: number) => void
  size?: number
  interactive?: boolean
}) {
  return (
    <XStack
      gap="$sm"
      justifyContent="center"
      py="$md"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => interactive && setRating?.(star)}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}
        >
          <Star
            size={size}
            color={star <= rating ? '#F59E0B' : '#E5E7EB'}
            fill={star <= rating ? '#F59E0B' : 'transparent'}
            strokeWidth={1.5}
          />
        </Pressable>
      ))}
    </XStack>
  )
}

// Review Display for Homeowner's review of Handyman
function HandymanReviewDisplay({ review }: { review: HandymanReview | null }) {
  if (!review) return null

  return (
    <YStack
      bg="rgba(255,255,255,0.98)"
      borderRadius={24}
      p="$lg"
      gap="$md"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.08)"
      shadowColor="black"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.04}
      shadowRadius={12}
    >
      <XStack
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <YStack gap={2}>
          <Text
            fontSize="$4"
            fontWeight="700"
            color="$color"
          >
            Your Review
          </Text>
          <Text
            fontSize="$1"
            color="$colorSubtle"
          >
            {new Date(review.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </YStack>
        <XStack
          bg="rgba(245, 158, 11, 0.12)"
          px="$md"
          py="$xs"
          borderRadius="$full"
          alignItems="center"
          gap="$xs"
        >
          <Star
            size={14}
            color="#F59E0B"
            fill="#F59E0B"
          />
          <Text
            fontSize="$4"
            fontWeight="800"
            color="#F59E0B"
          >
            {review.rating.toFixed(1)}
          </Text>
        </XStack>
      </XStack>

      {review.comment && (
        <YStack
          bg="$backgroundMuted"
          p="$md"
          borderRadius={18}
          borderWidth={1}
          borderColor="rgba(0,0,0,0.03)"
        >
          <Text
            fontSize="$3"
            color="$color"
            lineHeight={22}
            fontStyle="italic"
          >
            "{review.comment}"
          </Text>
        </YStack>
      )}

      <XStack
        alignItems="center"
        gap="$xs"
        mt="$xs"
      >
        <View
          bg="$success"
          width={6}
          height={6}
          borderRadius={3}
        />
        <Text
          fontSize="$1"
          fontWeight="600"
          color="$colorSubtle"
          letterSpacing={0.5}
        >
          VISIBLE TO THE HANDYMAN
        </Text>
      </XStack>
    </YStack>
  )
}

// Review Section for completed jobs
function ReviewSection({ jobId, onSubmitted }: { jobId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createReviewMutation = useCreateHandymanReview()
  const toast = useToastController()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.show('Please select a rating', { native: false })
      return
    }
    setIsSubmitting(true)
    try {
      await createReviewMutation.mutateAsync({
        jobId,
        data: { rating, comment: comment || undefined },
      })
      toast.show('Review submitted!', { native: false })
      onSubmitted()
    } catch (error: any) {
      console.error('DEBUG: Review submission error:', error)
      toast.show('Failed to submit review', { message: error?.message, native: false })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <YStack
      bg="rgba(255,255,255,0.98)"
      borderRadius={24}
      p="$lg"
      gap="$md"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.08)"
    >
      <YStack
        alignItems="center"
        gap="$xs"
      >
        <Text
          fontSize="$4"
          fontWeight="700"
          color="$color"
        >
          Rate the Handyman
        </Text>
        <Text
          fontSize="$2"
          color="$colorSubtle"
          textAlign="center"
        >
          Share your experience
        </Text>
      </YStack>

      <StarRating
        rating={rating}
        setRating={setRating}
        size={36}
      />

      <TextArea
        placeholder="Add a comment (optional)"
        placeholderTextColor="$colorMuted"
        value={comment}
        onChangeText={setComment}
        minHeight={80}
        borderRadius={16}
        bg="$backgroundMuted"
        borderWidth={1.5}
        borderColor="rgba(0,0,0,0.05)"
        p="$md"
        color="$color"
        focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
      />

      <Button
        bg={rating > 0 ? '$primary' : '$backgroundMuted'}
        borderRadius="$lg"
        py="$md"
        onPress={handleSubmit}
        disabled={isSubmitting || rating === 0}
        opacity={rating > 0 ? 1 : 0.7}
      >
        {isSubmitting ? (
          <Spinner
            size="small"
            color="white"
          />
        ) : (
          <XStack
            alignItems="center"
            gap="$sm"
          >
            <Star
              size={18}
              color={rating > 0 ? 'white' : '$colorMuted'}
            />
            <Text
              color={rating > 0 ? 'white' : '$colorMuted'}
              fontWeight="600"
            >
              Submit Review
            </Text>
          </XStack>
        )}
      </Button>
    </YStack>
  )
}

const reportStatusColors: Record<
  DailyReportStatus,
  { bg: string; text: string; label: string; dot: string }
> = {
  pending: { bg: '$warningBackground', text: '$warning', label: 'Pending', dot: '#F59E0B' },
  approved: { bg: '$successBackground', text: '$success', label: 'Approved', dot: '#22C55E' },
  rejected: { bg: '$errorBackground', text: '$error', label: 'Rejected', dot: '#EF4444' },
}

const reimbursementStatusColors: Record<
  ReimbursementStatus,
  { bg: string; text: string; label: string; dot: string }
> = {
  pending: { bg: '$warningBackground', text: '$warning', label: 'Pending', dot: '#F59E0B' },
  approved: { bg: '$successBackground', text: '$success', label: 'Approved', dot: '#22C55E' },
  rejected: { bg: '$errorBackground', text: '$error', label: 'Rejected', dot: '#EF4444' },
}

// Job Progress Bar - Premium horizontal stepper design
function JobProgressBar({
  completedTasks,
  totalTasks,
  completionPercentage,
}: {
  completedTasks: number
  totalTasks: number
  completionPercentage: number
}) {
  const clampedProgress = Math.min(100, Math.max(0, completionPercentage))

  // Define progress stages
  const stages = [
    { icon: Play, label: 'Started', threshold: 0 },
    { icon: ListChecks, label: 'In Progress', threshold: 25 },
    { icon: Clock, label: 'Halfway', threshold: 50 },
    { icon: Award, label: 'Almost Done', threshold: 75 },
    { icon: CheckCircle2, label: 'Complete', threshold: 100 },
  ]

  const getStageStatus = (threshold: number) => {
    if (clampedProgress >= threshold) return 'completed'
    if (clampedProgress >= threshold - 25 && threshold > 0) return 'current'
    return 'pending'
  }

  return (
    <YStack
      bg="rgba(255,255,255,0.98)"
      borderRadius={24}
      p="$lg"
      gap="$lg"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.06)"
      shadowColor="black"
      shadowOffset={{ width: 0, height: 8 }}
      shadowOpacity={0.04}
      shadowRadius={16}
    >
      {/* Header */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
      >
        <YStack gap={2}>
          <Text
            fontSize="$4"
            fontWeight="700"
            color="$color"
          >
            Job Progress
          </Text>
          <Text
            fontSize="$2"
            color="$colorSubtle"
          >
            {completedTasks} of {totalTasks} tasks completed
          </Text>
        </YStack>
        <View
          bg={clampedProgress >= 100 ? '$successBackground' : '$primaryBackground'}
          px="$md"
          py="$xs"
          borderRadius="$full"
        >
          <Text
            fontSize="$5"
            fontWeight="800"
            color={clampedProgress >= 100 ? '$success' : '$primary'}
          >
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      </XStack>

      {/* Progress Bar */}
      <YStack gap="$sm">
        <View
          height={8}
          borderRadius={4}
          bg="rgba(0,0,0,0.06)"
          overflow="hidden"
        >
          <View
            height={8}
            borderRadius={4}
            width={`${clampedProgress}%` as any}
            bg={clampedProgress >= 100 ? '$success' : '$primary'}
          />
        </View>

        {/* Stage Icons */}
        <XStack
          justifyContent="space-between"
          alignItems="flex-start"
          mt="$sm"
        >
          {stages.map((stage, index) => {
            const status = getStageStatus(stage.threshold)
            const IconComponent = stage.icon
            const isCompleted = status === 'completed'
            const isCurrent = status === 'current'

            return (
              <YStack
                key={index}
                alignItems="center"
                gap="$xs"
                flex={1}
              >
                <View
                  width={40}
                  height={40}
                  borderRadius={20}
                  bg={
                    isCompleted
                      ? clampedProgress >= 100
                        ? '$successBackground'
                        : '$primaryBackground'
                      : isCurrent
                        ? 'rgba(12, 154, 92, 0.15)'
                        : 'rgba(0,0,0,0.04)'
                  }
                  borderWidth={2}
                  borderColor={
                    isCompleted
                      ? clampedProgress >= 100
                        ? '$success'
                        : '$primary'
                      : isCurrent
                        ? '$primary'
                        : 'rgba(0,0,0,0.08)'
                  }
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconComponent
                    size={18}
                    color={
                      isCompleted
                        ? clampedProgress >= 100
                          ? '#22C55E'
                          : '#0C9A5C'
                        : isCurrent
                          ? '#0C9A5C'
                          : '#9CA3AF'
                    }
                  />
                </View>
                <Text
                  fontSize={10}
                  fontWeight={isCompleted || isCurrent ? '600' : '400'}
                  color={isCompleted || isCurrent ? '$color' : '$colorMuted'}
                  textAlign="center"
                  numberOfLines={1}
                >
                  {stage.label}
                </Text>
              </YStack>
            )
          })}
        </XStack>
      </YStack>
    </YStack>
  )
}

// Stat Card
function StatCard({
  icon,
  value,
  label,
  color = '$primary',
}: { icon: React.ReactNode; value: string | number; label: string; color?: string }) {
  return (
    <YStack
      flex={1}
      bg="rgba(255,255,255,0.98)"
      borderRadius={16}
      p="$sm"
      alignItems="center"
      gap="$xs"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.05)"
    >
      <View
        width={32}
        height={32}
        borderRadius={8}
        bg={`${color}15` as any}
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </View>
      <Text
        fontSize="$4"
        fontWeight="800"
        color="$color"
      >
        {value}
      </Text>
      <Text
        fontSize="$1"
        color="$colorSubtle"
        textAlign="center"
      >
        {label}
      </Text>
    </YStack>
  )
}

// Task Item
function TaskItem({ task, index }: { task: DashboardTask; index: number }) {
  return (
    <XStack
      bg={task.is_completed ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.95)'}
      borderRadius={12}
      p="$md"
      alignItems="center"
      gap="$md"
      borderWidth={1}
      borderColor={task.is_completed ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.05)'}
    >
      <View
        width={32}
        height={32}
        borderRadius={16}
        bg={task.is_completed ? '$success' : '$backgroundMuted'}
        alignItems="center"
        justifyContent="center"
      >
        {task.is_completed ? (
          <CheckCircle2
            size={18}
            color="white"
          />
        ) : (
          <Text
            fontSize="$2"
            fontWeight="700"
            color="$colorSubtle"
          >
            {index + 1}
          </Text>
        )}
      </View>
      <YStack
        flex={1}
        gap={2}
      >
        <Text
          fontSize="$3"
          fontWeight="600"
          color={task.is_completed ? '$success' : '$color'}
          textDecorationLine={task.is_completed ? 'line-through' : 'none'}
        >
          {task.title}
        </Text>
        {task.description && (
          <Text
            fontSize="$2"
            color="$colorSubtle"
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}
      </YStack>
    </XStack>
  )
}

// Media Gallery
function MediaGallery({
  media,
  onMediaPress,
}: { media: SessionMediaItem[]; onMediaPress: (item: SessionMediaItem) => void }) {
  if (!media || media.length === 0) return null
  return (
    <YStack gap="$sm">
      <Text
        fontSize="$2"
        fontWeight="600"
        color="$color"
      >
        Session Media ({media.length})
      </Text>
      <XStack
        flexWrap="wrap"
        gap="$sm"
      >
        {media.map((item) => (
          <Pressable
            key={item.public_id}
            onPress={() => onMediaPress(item)}
          >
            <View
              width={72}
              height={72}
              borderRadius={12}
              overflow="hidden"
              bg="$backgroundMuted"
            >
              <Image
                source={{ uri: item.thumbnail || item.file }}
                width={72}
                height={72}
                resizeMode="cover"
              />
              {item.media_type === 'video' && (
                <View
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(0,0,0,0.3)"
                >
                  <Play
                    size={24}
                    color="white"
                  />
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </XStack>
    </YStack>
  )
}

// Image Viewer Modal
function ImageViewerModal({
  visible,
  item,
  onClose,
}: { visible: boolean; item: SessionMediaItem | null; onClose: () => void }) {
  if (!item) return null
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View
        flex={1}
        bg="rgba(0,0,0,0.95)"
        justifyContent="center"
        alignItems="center"
      >
        <Button
          unstyled
          position="absolute"
          top={60}
          right={20}
          zIndex={10}
          onPress={onClose}
          p="$md"
        >
          <X
            size={28}
            color="white"
          />
        </Button>
        <Image
          source={{ uri: item.file }}
          width="100%"
          height="80%"
          resizeMode="contain"
        />
        {item.description && (
          <Text
            color="white"
            fontSize="$3"
            textAlign="center"
            p="$md"
            mt="$md"
          >
            {item.description}
          </Text>
        )}
      </View>
    </Modal>
  )
}

// Report Review Modal
function ReportReviewModal({
  visible,
  report,
  onApprove,
  onReject,
  onClose,
  isLoading,
}: {
  visible: boolean
  report: DailyReport | null
  onApprove: (feedback?: string) => void
  onReject: (feedback?: string) => void
  onClose: () => void
  isLoading: boolean
}) {
  const [feedback, setFeedback] = useState('')

  if (!report) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            flex={1}
            bg="rgba(0,0,0,0.85)"
            justifyContent="center"
            alignItems="center"
            p="$lg"
          >
            <YStack
              bg="$background"
              borderRadius={32}
              p="$xl"
              width="100%"
              maxWidth={420}
              gap="$lg"
            >
              <YStack
                gap="$xs"
                alignItems="center"
              >
                <View
                  bg="$primaryBackground"
                  p="$sm"
                  borderRadius="$full"
                  mb="$xs"
                >
                  <FileText
                    size={24}
                    color="$primary"
                  />
                </View>
                <Text
                  fontSize="$6"
                  fontWeight="800"
                  color="$color"
                >
                  Review Report
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                  textAlign="center"
                >
                  Day {new Date(report.report_date).toLocaleDateString()}
                </Text>
              </YStack>

              <YStack
                bg="$backgroundMuted"
                p="$md"
                borderRadius={16}
                gap="$sm"
              >
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$color"
                >
                  Summary
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  {report.summary}
                </Text>
              </YStack>

              <YStack gap="$xs">
                <Text
                  fontSize="$2"
                  fontWeight="700"
                  color="$colorSubtle"
                  ml="$xs"
                >
                  Feedback (optional)
                </Text>
                <TextArea
                  placeholder="Add feedback for the handyman..."
                  placeholderTextColor="$colorMuted"
                  value={feedback}
                  onChangeText={setFeedback}
                  minHeight={80}
                  borderRadius={16}
                  bg="$backgroundMuted"
                  borderWidth={1.5}
                  borderColor="rgba(0,0,0,0.05)"
                  p="$md"
                  color="$color"
                />
              </YStack>

              <XStack gap="$md">
                <Button
                  flex={1}
                  bg="$error"
                  borderRadius={16}
                  height={54}
                  onPress={() => onReject(feedback)}
                  disabled={isLoading}
                >
                  <XStack
                    alignItems="center"
                    gap="$xs"
                  >
                    <ThumbsDown
                      size={18}
                      color="white"
                    />
                    <Text
                      color="white"
                      fontWeight="700"
                    >
                      Reject
                    </Text>
                  </XStack>
                </Button>
                <Button
                  flex={1}
                  bg="$success"
                  borderRadius={16}
                  height={54}
                  onPress={() => onApprove(feedback)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Spinner
                      size="small"
                      color="white"
                    />
                  ) : (
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      <ThumbsUp
                        size={18}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontWeight="700"
                      >
                        Approve
                      </Text>
                    </XStack>
                  )}
                </Button>
              </XStack>

              <Button
                bg="$backgroundMuted"
                borderRadius={16}
                height={48}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text
                  color="$color"
                  fontWeight="600"
                >
                  Cancel
                </Text>
              </Button>
            </YStack>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// Expandable Report Card for Homeowner (with review action)
function ExpandableReportCard({
  report,
  dayNumber,
  onReview,
}: { report: DailyReport; dayNumber: number; onReview: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const statusStyle = reportStatusColors[report.status]
  const hours = Math.floor(report.total_work_duration_seconds / 3600)
  const minutes = Math.floor((report.total_work_duration_seconds % 3600) / 60)
  const canReview = report.status === 'pending'
  const tasksCompleted = report.tasks_worked?.filter((t) => t.marked_complete).length || 0

  return (
    <XStack>
      <YStack
        alignItems="center"
        width={32}
      >
        <View
          width={14}
          height={14}
          borderRadius={7}
          bg={statusStyle.dot as any}
          borderWidth={3}
          borderColor="white"
          zIndex={1}
        />
        <View
          width={2}
          flex={1}
          bg="rgba(0,0,0,0.1)"
          marginTop={-2}
        />
      </YStack>
      <YStack
        flex={1}
        ml="$sm"
        mb="$md"
      >
        <Pressable onPress={() => setExpanded(!expanded)}>
          <YStack
            bg="rgba(255,255,255,0.98)"
            borderRadius={14}
            p="$md"
            borderWidth={1}
            borderColor="rgba(0,0,0,0.06)"
            gap="$sm"
          >
            <XStack
              justifyContent="space-between"
              alignItems="center"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <View
                  bg="$primaryBackground"
                  px="$xs"
                  py={2}
                  borderRadius={6}
                >
                  <Text
                    fontSize={9}
                    fontWeight="800"
                    color="$primary"
                  >
                    DAY {dayNumber}
                  </Text>
                </View>
                <Text
                  fontSize="$1"
                  color="$colorSubtle"
                >
                  {new Date(report.report_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </XStack>
              <XStack
                alignItems="center"
                gap="$xs"
              >
                <View
                  bg={statusStyle.bg as any}
                  px="$xs"
                  py={2}
                  borderRadius="$full"
                >
                  <Text
                    fontSize={9}
                    fontWeight="700"
                    color={statusStyle.text as any}
                  >
                    {statusStyle.label.toUpperCase()}
                  </Text>
                </View>
                {expanded ? (
                  <ChevronUp
                    size={16}
                    color="$colorSubtle"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    color="$colorSubtle"
                  />
                )}
              </XStack>
            </XStack>
            <Text
              fontSize="$2"
              color="$color"
              numberOfLines={expanded ? undefined : 2}
            >
              {report.summary}
            </Text>
            <XStack
              gap="$md"
              pt="$xs"
              borderTopWidth={1}
              borderTopColor="rgba(0,0,0,0.04)"
            >
              <XStack
                alignItems="center"
                gap="$xs"
              >
                <Clock
                  size={12}
                  color="$primary"
                />
                <Text
                  fontSize="$1"
                  fontWeight="600"
                  color="$color"
                >
                  {hours}h {minutes}m
                </Text>
              </XStack>
              {tasksCompleted > 0 && (
                <XStack
                  alignItems="center"
                  gap="$xs"
                >
                  <CheckCircle2
                    size={12}
                    color="$success"
                  />
                  <Text
                    fontSize="$1"
                    fontWeight="600"
                    color="$color"
                  >
                    {tasksCompleted} tasks
                  </Text>
                </XStack>
              )}
            </XStack>

            {expanded && (
              <YStack
                gap="$sm"
                pt="$sm"
                borderTopWidth={1}
                borderTopColor="rgba(0,0,0,0.04)"
              >
                {report.tasks_worked && report.tasks_worked.length > 0 && (
                  <YStack gap="$xs">
                    <Text
                      fontSize="$2"
                      fontWeight="600"
                      color="$colorSubtle"
                    >
                      Tasks Worked
                    </Text>
                    {report.tasks_worked.map((item) => (
                      <XStack
                        key={item.public_id}
                        alignItems="center"
                        gap="$xs"
                      >
                        <CheckCircle2
                          size={12}
                          color={item.marked_complete ? '$success' : '$colorMuted'}
                        />
                        <Text
                          fontSize="$2"
                          color="$color"
                        >
                          {item.task.title}
                          {item.notes ? `: ${item.notes}` : ''}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>
                )}
                {report.homeowner_comment && (
                  <View
                    bg="$primaryBackground"
                    p="$sm"
                    borderRadius={8}
                  >
                    <Text
                      fontSize="$1"
                      color="$primary"
                    >
                      Your feedback: {report.homeowner_comment}
                    </Text>
                  </View>
                )}
                {canReview && (
                  <Button
                    bg="$primary"
                    borderRadius="$lg"
                    py="$sm"
                    onPress={onReview}
                  >
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      <ThumbsUp
                        size={14}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontWeight="600"
                      >
                        Review Report
                      </Text>
                    </XStack>
                  </Button>
                )}
              </YStack>
            )}
          </YStack>
        </Pressable>
      </YStack>
    </XStack>
  )
}

// Helper function to check if file is an image
function isImageFile(fileName: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic', '.heif']
  const lowerFileName = fileName.toLowerCase()
  return imageExtensions.some((ext) => lowerFileName.endsWith(ext))
}

// Reimbursement Review Modal
function ReimbursementReviewModal({
  visible,
  reimbursement,
  onApprove,
  onReject,
  onClose,
  isLoading,
}: {
  visible: boolean
  reimbursement: JobReimbursement | null
  onApprove: (comment: string) => void
  onReject: (comment: string) => void
  onClose: () => void
  isLoading: boolean
}) {
  const [comment, setComment] = useState('')
  const insets = useSafeArea()

  if (!reimbursement) return null

  const imageAttachments = reimbursement.attachments.filter((a) => isImageFile(a.file_name))
  const otherAttachments = reimbursement.attachments.filter((a) => !isImageFile(a.file_name))

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err))
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            flex={1}
            bg="rgba(0,0,0,0.5)"
            justifyContent="flex-end"
          >
            <View
              bg="$background"
              borderTopLeftRadius={24}
              borderTopRightRadius={24}
              p="$lg"
              pb={insets.bottom + 20}
              maxHeight="85%"
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <YStack gap="$md">
                  <XStack
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Text
                      fontSize="$5"
                      fontWeight="700"
                      color="$color"
                    >
                      Review Reimbursement
                    </Text>
                    <Button
                      unstyled
                      onPress={onClose}
                      p="$sm"
                    >
                      <X
                        size={22}
                        color="$colorSubtle"
                      />
                    </Button>
                  </XStack>

                  {/* Reimbursement Details */}
                  <YStack
                    bg="$backgroundMuted"
                    p="$md"
                    borderRadius={12}
                    gap="$sm"
                  >
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color="$color"
                    >
                      {reimbursement.name}
                    </Text>
                    <XStack
                      gap="$md"
                      alignItems="center"
                    >
                      <XStack
                        alignItems="center"
                        gap="$xs"
                      >
                        <Receipt
                          size={14}
                          color="$colorSubtle"
                        />
                        <Text
                          fontSize="$2"
                          color="$colorSubtle"
                        >
                          {reimbursement.category.name}
                        </Text>
                      </XStack>
                      <XStack
                        alignItems="center"
                        gap="$xs"
                        bg="$primaryBackground"
                        px="$sm"
                        py={2}
                        borderRadius="$full"
                      >
                        <DollarSign
                          size={14}
                          color="$primary"
                        />
                        <Text
                          fontSize="$3"
                          fontWeight="700"
                          color="$primary"
                        >
                          {Number.parseFloat(String(reimbursement.amount)).toFixed(2)}
                        </Text>
                      </XStack>
                    </XStack>
                    {reimbursement.notes && (
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                      >
                        {reimbursement.notes}
                      </Text>
                    )}
                  </YStack>

                  {/* Attachments */}
                  {reimbursement.attachments.length > 0 && (
                    <YStack gap="$sm">
                      <Text
                        fontSize="$3"
                        fontWeight="600"
                        color="$colorSubtle"
                      >
                        Attachments
                      </Text>
                      {imageAttachments.length > 0 && (
                        <XStack
                          flexWrap="wrap"
                          gap="$sm"
                        >
                          {imageAttachments.map((attachment) => (
                            <Pressable
                              key={attachment.public_id}
                              onPress={() => handleOpenLink(attachment.file)}
                            >
                              <Image
                                source={{ uri: attachment.file }}
                                width={80}
                                height={80}
                                borderRadius={8}
                              />
                            </Pressable>
                          ))}
                        </XStack>
                      )}
                      {otherAttachments.map((attachment) => (
                        <Pressable
                          key={attachment.public_id}
                          onPress={() => handleOpenLink(attachment.file)}
                        >
                          <XStack
                            bg="$backgroundMuted"
                            p="$sm"
                            borderRadius={8}
                            alignItems="center"
                            gap="$sm"
                          >
                            <FileText
                              size={16}
                              color="$primary"
                            />
                            <Text
                              fontSize="$2"
                              color="$primary"
                              flex={1}
                              numberOfLines={1}
                            >
                              {attachment.file_name}
                            </Text>
                            <ExternalLink
                              size={14}
                              color="$colorSubtle"
                            />
                          </XStack>
                        </Pressable>
                      ))}
                    </YStack>
                  )}

                  {/* Comment */}
                  <YStack gap="$sm">
                    <Text
                      fontSize="$3"
                      fontWeight="600"
                      color="$color"
                    >
                      Comment (Optional)
                    </Text>
                    <TextArea
                      placeholder="Add a comment..."
                      placeholderTextColor="$colorMuted"
                      value={comment}
                      onChangeText={setComment}
                      color="$color"
                      bg="$backgroundMuted"
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderRadius={12}
                      px="$md"
                      py="$sm"
                      minHeight={80}
                    />
                  </YStack>

                  {/* Action Buttons */}
                  <XStack
                    gap="$md"
                    pt="$sm"
                  >
                    <Button
                      flex={1}
                      bg="$error"
                      borderRadius="$lg"
                      py="$md"
                      onPress={() => onReject(comment)}
                      disabled={isLoading}
                      opacity={isLoading ? 0.7 : 1}
                    >
                      <XStack
                        alignItems="center"
                        gap="$xs"
                      >
                        <ThumbsDown
                          size={16}
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
                    <Button
                      flex={1}
                      bg="$success"
                      borderRadius="$lg"
                      py="$md"
                      onPress={() => onApprove(comment)}
                      disabled={isLoading}
                      opacity={isLoading ? 0.7 : 1}
                    >
                      <XStack
                        alignItems="center"
                        gap="$xs"
                      >
                        <ThumbsUp
                          size={16}
                          color="white"
                        />
                        <Text
                          color="white"
                          fontWeight="600"
                        >
                          Approve
                        </Text>
                      </XStack>
                    </Button>
                  </XStack>
                </YStack>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// Expandable Reimbursement Card for Homeowner (with review action)
function ExpandableReimbursementCard({
  reimbursement,
  index,
  onReview,
  onImagePress,
}: {
  reimbursement: JobReimbursement
  index: number
  onReview: () => void
  onImagePress: (images: string[], startIndex: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const statusStyle = reimbursementStatusColors[reimbursement.status]
  const canReview = reimbursement.status === 'pending'

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err))
  }

  const imageAttachments = reimbursement.attachments.filter((a) => isImageFile(a.file_name))
  const otherAttachments = reimbursement.attachments.filter((a) => !isImageFile(a.file_name))

  return (
    <XStack>
      <YStack
        alignItems="center"
        width={32}
      >
        <View
          width={14}
          height={14}
          borderRadius={7}
          bg={statusStyle.dot as any}
          borderWidth={3}
          borderColor="white"
          zIndex={1}
        />
        <View
          width={2}
          flex={1}
          bg="rgba(0,0,0,0.1)"
          marginTop={-2}
        />
      </YStack>
      <YStack
        flex={1}
        ml="$sm"
        mb="$md"
      >
        <Pressable onPress={() => setExpanded(!expanded)}>
          <YStack
            bg="rgba(255,255,255,0.98)"
            borderRadius={14}
            p="$md"
            borderWidth={1}
            borderColor="rgba(0,0,0,0.06)"
            gap="$sm"
          >
            <XStack
              justifyContent="space-between"
              alignItems="center"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <View
                  bg="$accentBackground"
                  px="$xs"
                  py={2}
                  borderRadius={6}
                >
                  <Text
                    fontSize={9}
                    fontWeight="800"
                    color="$accent"
                  >
                    #{index}
                  </Text>
                </View>
                <Text
                  fontSize="$1"
                  color="$colorSubtle"
                >
                  {new Date(reimbursement.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </XStack>
              <XStack
                alignItems="center"
                gap="$xs"
              >
                <View
                  bg={statusStyle.bg as any}
                  px="$xs"
                  py={2}
                  borderRadius="$full"
                >
                  <Text
                    fontSize={9}
                    fontWeight="700"
                    color={statusStyle.text as any}
                  >
                    {statusStyle.label.toUpperCase()}
                  </Text>
                </View>
                {expanded ? (
                  <ChevronUp
                    size={16}
                    color="$colorSubtle"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    color="$colorSubtle"
                  />
                )}
              </XStack>
            </XStack>
            <Text
              fontSize="$3"
              fontWeight="600"
              color="$color"
              numberOfLines={expanded ? undefined : 1}
            >
              {reimbursement.name}
            </Text>
            <XStack
              gap="$md"
              pt="$xs"
              borderTopWidth={1}
              borderTopColor="rgba(0,0,0,0.04)"
              alignItems="center"
            >
              <XStack
                alignItems="center"
                gap="$xs"
              >
                <Receipt
                  size={12}
                  color="$primary"
                />
                <Text
                  fontSize="$1"
                  color="$colorSubtle"
                >
                  {reimbursement.category.name}
                </Text>
              </XStack>
              <XStack
                alignItems="center"
                gap="$xs"
                bg="$primaryBackground"
                px="$sm"
                py={2}
                borderRadius="$full"
              >
                <DollarSign
                  size={12}
                  color="$primary"
                />
                <Text
                  fontSize="$2"
                  fontWeight="700"
                  color="$primary"
                >
                  {Number.parseFloat(String(reimbursement.amount)).toFixed(2)}
                </Text>
              </XStack>
            </XStack>

            {expanded && (
              <YStack
                gap="$sm"
                pt="$sm"
                borderTopWidth={1}
                borderTopColor="rgba(0,0,0,0.04)"
              >
                {reimbursement.notes && (
                  <YStack gap="$xs">
                    <Text
                      fontSize="$2"
                      fontWeight="600"
                      color="$colorSubtle"
                    >
                      Notes
                    </Text>
                    <Text
                      fontSize="$2"
                      color="$color"
                    >
                      {reimbursement.notes}
                    </Text>
                  </YStack>
                )}

                {/* Image Attachments */}
                {imageAttachments.length > 0 && (
                  <YStack gap="$xs">
                    <Text
                      fontSize="$2"
                      fontWeight="600"
                      color="$colorSubtle"
                    >
                      Attachments
                    </Text>
                    <XStack
                      flexWrap="wrap"
                      gap="$sm"
                    >
                      {imageAttachments.map((attachment, idx) => (
                        <Pressable
                          key={attachment.public_id}
                          onPress={() =>
                            onImagePress(
                              imageAttachments.map((a) => a.file),
                              idx
                            )
                          }
                        >
                          <Image
                            source={{ uri: attachment.file }}
                            width={60}
                            height={60}
                            borderRadius={8}
                          />
                        </Pressable>
                      ))}
                    </XStack>
                  </YStack>
                )}

                {/* Other Attachments */}
                {otherAttachments.length > 0 && (
                  <YStack gap="$xs">
                    {imageAttachments.length === 0 && (
                      <Text
                        fontSize="$2"
                        fontWeight="600"
                        color="$colorSubtle"
                      >
                        Attachments
                      </Text>
                    )}
                    {otherAttachments.map((attachment) => (
                      <Pressable
                        key={attachment.public_id}
                        onPress={() => handleOpenLink(attachment.file)}
                      >
                        <XStack
                          bg="$backgroundMuted"
                          p="$sm"
                          borderRadius={8}
                          alignItems="center"
                          gap="$sm"
                        >
                          <FileText
                            size={16}
                            color="$primary"
                          />
                          <Text
                            fontSize="$2"
                            color="$primary"
                            flex={1}
                            numberOfLines={1}
                          >
                            {attachment.file_name}
                          </Text>
                          <ExternalLink
                            size={14}
                            color="$colorSubtle"
                          />
                        </XStack>
                      </Pressable>
                    ))}
                  </YStack>
                )}

                {reimbursement.homeowner_comment && (
                  <View
                    bg="$primaryBackground"
                    p="$sm"
                    borderRadius={8}
                  >
                    <Text
                      fontSize="$1"
                      color="$primary"
                    >
                      Your comment: {reimbursement.homeowner_comment}
                    </Text>
                  </View>
                )}

                {canReview && (
                  <Button
                    bg="$primary"
                    borderRadius="$lg"
                    py="$sm"
                    onPress={onReview}
                  >
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      <ThumbsUp
                        size={14}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontWeight="600"
                      >
                        Review Request
                      </Text>
                    </XStack>
                  </Button>
                )}
              </YStack>
            )}
          </YStack>
        </Pressable>
      </YStack>
    </XStack>
  )
}

// Expandable Session Card
function ExpandableSessionCard({
  session,
  index,
  onMediaPress,
}: { session: WorkSession; index: number; onMediaPress: (item: any) => void }) {
  const [expanded, setExpanded] = useState(false)
  const isSessionActive = !session.ended_at
  const startTime = new Date(session.started_at)
  const endTime = session.ended_at ? new Date(session.ended_at) : null
  const durationSeconds = session.duration_seconds || 0
  const hours = Math.floor(durationSeconds / 3600)
  const minutes = Math.floor((durationSeconds % 3600) / 60)

  return (
    <XStack>
      <YStack
        alignItems="center"
        width={32}
      >
        <View
          width={12}
          height={12}
          borderRadius={6}
          bg={isSessionActive ? '#22C55E' : '#6B7280'}
          borderWidth={2}
          borderColor="white"
          zIndex={1}
        />
        <View
          width={2}
          flex={1}
          bg="rgba(0,0,0,0.08)"
          marginTop={-2}
        />
      </YStack>
      <YStack
        flex={1}
        ml="$sm"
        mb="$sm"
      >
        <Pressable onPress={() => setExpanded(!expanded)}>
          <YStack
            bg="rgba(255,255,255,0.95)"
            borderRadius={12}
            p="$sm"
            borderWidth={1}
            borderColor="rgba(0,0,0,0.05)"
            gap="$xs"
          >
            <XStack
              justifyContent="space-between"
              alignItems="center"
            >
              <Text
                fontSize="$2"
                fontWeight="600"
                color="$color"
              >
                Session #{index}
              </Text>
              <XStack
                alignItems="center"
                gap="$xs"
              >
                <View
                  bg={isSessionActive ? '$successBackground' : '$backgroundMuted'}
                  px="$xs"
                  py={2}
                  borderRadius="$full"
                >
                  <Text
                    fontSize={9}
                    fontWeight="700"
                    color={isSessionActive ? '$success' : '$colorSubtle'}
                  >
                    {isSessionActive ? 'SESSION ACTIVE' : 'COMPLETED'}
                  </Text>
                </View>
                {expanded ? (
                  <ChevronUp
                    size={14}
                    color="$colorSubtle"
                  />
                ) : (
                  <ChevronDown
                    size={14}
                    color="$colorSubtle"
                  />
                )}
              </XStack>
            </XStack>
            <XStack
              alignItems="center"
              gap="$sm"
            >
              <Text
                fontSize="$1"
                color="$colorSubtle"
              >
                {startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              {!isSessionActive && (
                <Text
                  fontSize="$1"
                  fontWeight="600"
                  color="$primary"
                >
                  {hours}h {minutes}m
                </Text>
              )}
            </XStack>

            {expanded && (
              <YStack
                gap="$sm"
                pt="$sm"
                borderTopWidth={1}
                borderTopColor="rgba(0,0,0,0.04)"
              >
                <XStack gap="$lg">
                  <YStack gap={2}>
                    <Text
                      fontSize="$1"
                      color="$colorSubtle"
                    >
                      Start
                    </Text>
                    <Text
                      fontSize="$2"
                      fontWeight="600"
                      color="$color"
                    >
                      {startTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </YStack>
                  {endTime && (
                    <YStack gap={2}>
                      <Text
                        fontSize="$1"
                        color="$colorSubtle"
                      >
                        End
                      </Text>
                      <Text
                        fontSize="$2"
                        fontWeight="600"
                        color="$color"
                      >
                        {endTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </YStack>
                  )}
                </XStack>

                {/* Start & End Photos */}
                <XStack gap="$md">
                  {session.start_photo && (
                    <YStack
                      gap={4}
                      alignItems="center"
                    >
                      <Text
                        fontSize={10}
                        color="$colorSubtle"
                      >
                        Start Photo
                      </Text>
                      <Pressable
                        onPress={() =>
                          onMediaPress({ file: session.start_photo, media_type: 'photo' })
                        }
                      >
                        <View
                          width={64}
                          height={64}
                          borderRadius={10}
                          overflow="hidden"
                          borderWidth={2}
                          borderColor="$success"
                        >
                          <Image
                            source={{ uri: session.start_photo }}
                            width={64}
                            height={64}
                            resizeMode="cover"
                          />
                        </View>
                      </Pressable>
                    </YStack>
                  )}
                  {session.end_photo && (
                    <YStack
                      gap={4}
                      alignItems="center"
                    >
                      <Text
                        fontSize={10}
                        color="$colorSubtle"
                      >
                        End Photo
                      </Text>
                      <Pressable
                        onPress={() =>
                          onMediaPress({ file: session.end_photo, media_type: 'photo' })
                        }
                      >
                        <View
                          width={64}
                          height={64}
                          borderRadius={10}
                          overflow="hidden"
                          borderWidth={2}
                          borderColor="$error"
                        >
                          <Image
                            source={{ uri: session.end_photo }}
                            width={64}
                            height={64}
                            resizeMode="cover"
                          />
                        </View>
                      </Pressable>
                    </YStack>
                  )}
                </XStack>

                {session.media && session.media.length > 0 && (
                  <YStack gap="$xs">
                    <Text
                      fontSize="$1"
                      color="$colorSubtle"
                    >
                      Evidence Media ({session.media.length})
                    </Text>
                    <XStack
                      flexWrap="wrap"
                      gap="$xs"
                    >
                      {session.media.slice(0, 4).map((m: any) => (
                        <Pressable
                          key={m.public_id}
                          onPress={() => onMediaPress(m)}
                        >
                          <View
                            width={48}
                            height={48}
                            borderRadius={8}
                            overflow="hidden"
                            bg="$backgroundMuted"
                          >
                            <Image
                              source={{ uri: m.thumbnail || m.file }}
                              width={48}
                              height={48}
                              resizeMode="cover"
                            />
                          </View>
                        </Pressable>
                      ))}
                    </XStack>
                  </YStack>
                )}
              </YStack>
            )}
          </YStack>
        </Pressable>
      </YStack>
    </XStack>
  )
}

// Main Dashboard Component
export function HomeownerJobDashboard({ jobId }: HomeownerJobDashboardProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()

  // Queries
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch,
  } = useHomeownerJobDashboard(jobId)
  const {
    data: reports,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useHomeownerDailyReports(jobId)
  const { data: sessions, refetch: refetchSessions } = useHomeownerWorkSessions(jobId)
  const {
    data: reimbursements,
    isLoading: reimbursementsLoading,
    refetch: refetchReimbursements,
  } = useHomeownerReimbursements(jobId)

  // Mutations
  const approveCompletionMutation = useApproveJobCompletion()
  const rejectCompletionMutation = useRejectJobCompletion()
  const reviewReportMutation = useReviewDailyReport()
  const createDisputeMutation = useCreateDispute()
  const reviewReimbursementMutation = useReviewReimbursement()

  // State
  const [viewerItem, setViewerItem] = useState<SessionMediaItem | null>(null)
  const [reportToReview, setReportToReview] = useState<DailyReport | null>(null)
  const [reimbursementToReview, setReimbursementToReview] = useState<JobReimbursement | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isReviewingReimbursement, setIsReviewingReimbursement] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  // Reimbursement image viewer state
  const [reimbursementImages, setReimbursementImages] = useState<string[]>([])
  const [reimbursementImageIndex, setReimbursementImageIndex] = useState(0)
  const [showReimbursementViewer, setShowReimbursementViewer] = useState(false)

  const handleReimbursementImagePress = (images: string[], startIndex: number) => {
    setReimbursementImages(images)
    setReimbursementImageIndex(startIndex)
    setShowReimbursementViewer(true)
  }

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      refetch()
      refetchReports()
      refetchSessions()
      refetchReimbursements()
    }, [refetch, refetchReports, refetchSessions, refetchReimbursements])
  )

  // Handlers
  const handleApproveReport = async (feedback?: string) => {
    if (!reportToReview) return
    setIsReviewing(true)
    try {
      await reviewReportMutation.mutateAsync({
        jobId,
        reportId: reportToReview.public_id,
        data: { decision: 'approved', comment: feedback },
      })
      toast.show('Report approved!', { native: false })
      setReportToReview(null)
      refetchReports()
      refetch()
    } catch (error: any) {
      toast.show('Failed to approve', { message: error?.message, native: false })
    } finally {
      setIsReviewing(false)
    }
  }

  const handleRejectReport = async (feedback?: string) => {
    if (!reportToReview) return
    setIsReviewing(true)
    try {
      await reviewReportMutation.mutateAsync({
        jobId,
        reportId: reportToReview.public_id,
        data: { decision: 'rejected', comment: feedback },
      })
      toast.show('Report rejected', { native: false })
      setReportToReview(null)
      refetchReports()
      refetch()
    } catch (error: any) {
      toast.show('Failed to reject', { message: error?.message, native: false })
    } finally {
      setIsReviewing(false)
    }
  }

  // Reimbursement review handlers
  const handleApproveReimbursement = async (comment: string) => {
    if (!reimbursementToReview) return
    setIsReviewingReimbursement(true)
    try {
      await reviewReimbursementMutation.mutateAsync({
        jobId,
        reimbursementId: reimbursementToReview.public_id,
        data: { decision: 'approved', comment: comment || undefined },
      })
      toast.show('Reimbursement approved!', { native: false })
      setReimbursementToReview(null)
      refetchReimbursements()
    } catch (error: any) {
      toast.show('Failed to approve', { message: error?.message, native: false })
    } finally {
      setIsReviewingReimbursement(false)
    }
  }

  const handleRejectReimbursement = async (comment: string) => {
    if (!reimbursementToReview) return
    setIsReviewingReimbursement(true)
    try {
      await reviewReimbursementMutation.mutateAsync({
        jobId,
        reimbursementId: reimbursementToReview.public_id,
        data: { decision: 'rejected', comment: comment || undefined },
      })
      toast.show('Reimbursement rejected', { native: false })
      setReimbursementToReview(null)
      refetchReimbursements()
    } catch (error: any) {
      toast.show('Failed to reject', { message: error?.message, native: false })
    } finally {
      setIsReviewingReimbursement(false)
    }
  }

  const handleApproveCompletion = async () => {
    setIsApproving(true)
    try {
      await approveCompletionMutation.mutateAsync(jobId)
      toast.show('Job completed!', { native: false })
      refetch()
    } catch (error: any) {
      toast.show('Failed', { message: error?.message, native: false })
    } finally {
      setIsApproving(false)
    }
  }

  const handleRejectCompletion = async () => {
    setIsRejecting(true)
    try {
      await rejectCompletionMutation.mutateAsync({ jobId })
      toast.show('Completion rejected', { native: false })
      refetch()
    } catch (error: any) {
      toast.show('Failed', { message: error?.message, native: false })
    } finally {
      setIsRejecting(false)
    }
  }

  if (dashboardLoading)
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
          <Text color="$colorSubtle">Loading...</Text>
        </YStack>
      </GradientBackground>
    )
  if (dashboardError || !dashboard)
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
            Error
          </Text>
          <Button
            mt="$sm"
            bg="$primary"
            borderRadius="$lg"
            px="$xl"
            onPress={() => router.back()}
          >
            <Text color="white">Go Back</Text>
          </Button>
        </YStack>
      </GradientBackground>
    )

  const {
    job,
    tasks_progress,
    time_stats,
    session_stats,
    active_session,
    report_stats,
    my_review,
  } = dashboard
  const isPendingCompletion = job.status === 'pending_completion'
  const isCompleted = job.status === 'completed'

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <XStack
          px="$5"
          py="$3"
          alignItems="center"
          gap="$3"
        >
          <Button
            unstyled
            onPress={() => router.back()}
            p="$2"
            hitSlop={12}
          >
            <ArrowLeft
              size={22}
              color="$color"
            />
          </Button>
          <Text
            flex={1}
            fontSize={17}
            fontWeight="700"
            color="$color"
            textAlign="center"
          >
            Job Progress
          </Text>
          {/* Chat Button */}
          <ChatButton jobId={jobId} />
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            pb="$2xl"
            gap="$lg"
          >
            {/* Pending Completion Banner - Premium Design */}
            {isPendingCompletion && (
              <YStack
                bg="rgba(251, 191, 36, 0.12)"
                borderRadius={20}
                p="$lg"
                borderWidth={1.5}
                borderColor="rgba(245, 158, 11, 0.3)"
                shadowColor="rgba(245, 158, 11, 0.2)"
                shadowOffset={{ width: 0, height: 8 }}
                shadowOpacity={0.15}
                shadowRadius={16}
                position="relative"
                overflow="hidden"
                gap="$md"
              >
                {/* Decorative background elements */}
                <View
                  position="absolute"
                  top={-20}
                  right={-20}
                  width={100}
                  height={100}
                  borderRadius={50}
                  bg="rgba(245, 158, 11, 0.08)"
                />
                <View
                  position="absolute"
                  bottom={-30}
                  left={-30}
                  width={80}
                  height={80}
                  borderRadius={40}
                  bg="rgba(245, 158, 11, 0.05)"
                />

                <XStack
                  alignItems="center"
                  gap="$md"
                >
                  <View
                    width={52}
                    height={52}
                    borderRadius={16}
                    bg="rgba(245, 158, 11, 0.2)"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={1}
                    borderColor="rgba(245, 158, 11, 0.3)"
                  >
                    <Hourglass
                      size={26}
                      color="#F59E0B"
                    />
                  </View>
                  <YStack
                    flex={1}
                    gap={4}
                  >
                    <Text
                      fontSize="$4"
                      fontWeight="700"
                      color="#B45309"
                    >
                      Completion Requested
                    </Text>
                    <Text
                      fontSize="$2"
                      color="#D97706"
                      opacity={0.9}
                    >
                      Handyman has requested job completion approval
                    </Text>
                  </YStack>
                </XStack>

                <XStack gap="$sm">
                  <Button
                    flex={1}
                    bg="$error"
                    borderRadius="$lg"
                    py="$md"
                    onPress={handleRejectCompletion}
                    disabled={isRejecting}
                    pressStyle={{ opacity: 0.9, scale: 0.98 }}
                  >
                    {isRejecting ? (
                      <Spinner
                        size="small"
                        color="white"
                      />
                    ) : (
                      <XStack
                        alignItems="center"
                        gap="$xs"
                      >
                        <ThumbsDown
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
                    )}
                  </Button>
                  <Button
                    flex={1}
                    bg="$success"
                    borderRadius="$lg"
                    py="$md"
                    onPress={handleApproveCompletion}
                    disabled={isApproving}
                    pressStyle={{ opacity: 0.9, scale: 0.98 }}
                  >
                    {isApproving ? (
                      <Spinner
                        size="small"
                        color="white"
                      />
                    ) : (
                      <XStack
                        alignItems="center"
                        gap="$xs"
                      >
                        <ThumbsUp
                          size={18}
                          color="white"
                        />
                        <Text
                          color="white"
                          fontWeight="600"
                        >
                          Approve
                        </Text>
                      </XStack>
                    )}
                  </Button>
                </XStack>
              </YStack>
            )}

            {/* Job Card */}
            <Pressable onPress={() => router.push(`/(homeowner)/jobs/${jobId}`)}>
              <YStack
                bg="rgba(255,255,255,0.98)"
                borderRadius={24}
                p="$lg"
                gap="$md"
                borderWidth={1}
                borderColor="rgba(0,0,0,0.06)"
              >
              <YStack gap="$xs">
                <Text
                  fontSize="$5"
                  fontWeight="700"
                  color="$color"
                  numberOfLines={2}
                >
                  {job.title}
                </Text>
                {job.category && (
                  <XStack
                    alignItems="center"
                    gap="$xs"
                  >
                    <Briefcase
                      size={12}
                      color="$primary"
                    />
                    <Text
                      fontSize="$2"
                      color="$primary"
                      fontWeight="500"
                    >
                      {job.category.name}
                    </Text>
                  </XStack>
                )}
                {job.address && (
                  <XStack
                    alignItems="center"
                    gap="$xs"
                  >
                    <MapPin
                      size={12}
                      color="$colorSubtle"
                    />
                    <Text
                      fontSize="$2"
                      color="$colorSubtle"
                      numberOfLines={1}
                    >
                      {job.address}
                    </Text>
                  </XStack>
                )}
              </YStack>
              <XStack
                justifyContent="space-between"
                alignItems="center"
                pt="$sm"
                borderTopWidth={1}
                borderTopColor="rgba(0,0,0,0.05)"
              >
                {job.handyman && (
                  <XStack
                    alignItems="center"
                    gap="$xs"
                  >
                    {job.handyman.avatar_url ? (
                      <Image
                        source={{ uri: job.handyman.avatar_url }}
                        width={20}
                        height={20}
                        borderRadius={10}
                      />
                    ) : (
                      <View
                        width={20}
                        height={20}
                        borderRadius={10}
                        bg="$backgroundMuted"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <User
                          size={12}
                          color="$colorMuted"
                        />
                      </View>
                    )}
                    <Text
                      fontSize="$3"
                      color="$colorSubtle"
                    >
                      {job.handyman.display_name}
                    </Text>
                  </XStack>
                )}
                <XStack
                  alignItems="center"
                  gap="$xs"
                  bg="$primaryBackground"
                  px="$md"
                  py="$xs"
                  borderRadius="$full"
                >
                  <DollarSign
                    size={16}
                    color="$primary"
                  />
                  <Text
                    fontSize="$4"
                    fontWeight="800"
                    color="$primary"
                  >
                    {job.estimated_budget}
                  </Text>
                </XStack>
              </XStack>
            </YStack>
            </Pressable>

            {job.description && (
              <YStack
                bg="rgba(255,255,255,0.98)"
                borderRadius={16}
                p="$md"
                gap="$sm"
                borderWidth={1}
                borderColor="rgba(0,0,0,0.06)"
              >
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$color"
                >
                  About
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                  lineHeight={20}
                >
                  {job.description}
                </Text>
              </YStack>
            )}

            {/* Job Progress Section */}
            <JobProgressBar
              completedTasks={tasks_progress.completed_tasks}
              totalTasks={tasks_progress.total_tasks}
              completionPercentage={tasks_progress.completion_percentage}
            />

            <XStack gap="$sm">
              <StatCard
                icon={
                  <Timer
                    size={18}
                    color="$primary"
                  />
                }
                value={time_stats.total_time_formatted.substring(0, 5)}
                label="Total Time"
              />
              <StatCard
                icon={
                  <ListChecks
                    size={18}
                    color="$success"
                  />
                }
                value={`${tasks_progress.completed_tasks}/${tasks_progress.total_tasks}`}
                label="Tasks"
                color="$success"
              />
              <StatCard
                icon={
                  <Award
                    size={18}
                    color="$warning"
                  />
                }
                value={report_stats.approved_reports}
                label="Approved"
                color="$warning"
              />
            </XStack>

            {/* Tasks */}
            {tasks_progress.tasks.length > 0 && (
              <YStack gap="$md">
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <ListChecks
                    size={20}
                    color="$primary"
                  />
                  <Text
                    fontSize="$4"
                    fontWeight="600"
                    color="$color"
                  >
                    Tasks
                  </Text>
                  <View
                    bg="$primaryBackground"
                    px="$sm"
                    py={2}
                    borderRadius="$full"
                  >
                    <Text
                      fontSize={10}
                      fontWeight="700"
                      color="$primary"
                    >
                      {tasks_progress.completed_tasks}/{tasks_progress.total_tasks}
                    </Text>
                  </View>
                </XStack>
                <YStack gap="$sm">
                  {tasks_progress.tasks.map((task, i) => (
                    <TaskItem
                      key={task.public_id}
                      task={task}
                      index={i}
                    />
                  ))}
                </YStack>
              </YStack>
            )}

            {/* Sessions */}
            <YStack gap="$md">
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <History
                  size={20}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Work Sessions
                </Text>
                {sessions && sessions.length > 0 && (
                  <View
                    bg="$primaryBackground"
                    px="$sm"
                    py={2}
                    borderRadius="$full"
                  >
                    <Text
                      fontSize={10}
                      fontWeight="700"
                      color="$primary"
                    >
                      {sessions.length}
                    </Text>
                  </View>
                )}
              </XStack>
              {sessions && sessions.length > 0 ? (
                <YStack>
                  {sessions.slice(0, 5).map((session, i) => (
                    <ExpandableSessionCard
                      key={session.public_id}
                      session={session}
                      index={sessions.length - i}
                      onMediaPress={setViewerItem}
                    />
                  ))}
                </YStack>
              ) : (
                <YStack
                  bg="rgba(255,255,255,0.9)"
                  borderRadius={16}
                  p="$xl"
                  alignItems="center"
                  gap="$md"
                  borderWidth={1}
                  borderStyle="dashed"
                  borderColor="$borderColor"
                >
                  <View
                    width={56}
                    height={56}
                    borderRadius={28}
                    bg="$primaryBackground"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <History
                      size={26}
                      color="$primary"
                    />
                  </View>
                  <Text
                    color="$color"
                    fontSize="$4"
                    fontWeight="600"
                  >
                    No Sessions Yet
                  </Text>
                </YStack>
              )}
            </YStack>

            {/* Reports */}
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
                {report_stats.pending_reports > 0 && (
                  <View
                    bg="$warning"
                    px={8}
                    py={2}
                    borderRadius={10}
                  >
                    <Text
                      fontSize={10}
                      fontWeight="700"
                      color="white"
                    >
                      {report_stats.pending_reports} pending
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
                <YStack mt="$sm">
                  {reports.map((report, i) => (
                    <ExpandableReportCard
                      key={report.public_id}
                      report={report}
                      dayNumber={reports.length - i}
                      onReview={() => setReportToReview(report)}
                    />
                  ))}
                </YStack>
              ) : (
                <YStack
                  bg="rgba(255,255,255,0.9)"
                  borderRadius={16}
                  p="$xl"
                  alignItems="center"
                  gap="$md"
                  borderWidth={1}
                  borderStyle="dashed"
                  borderColor="$borderColor"
                >
                  <View
                    width={56}
                    height={56}
                    borderRadius={28}
                    bg="$primaryBackground"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FileText
                      size={26}
                      color="$primary"
                    />
                  </View>
                  <Text
                    color="$color"
                    fontSize="$4"
                    fontWeight="600"
                  >
                    No Reports Yet
                  </Text>
                </YStack>
              )}
            </YStack>

            {/* Reimbursements Section */}
            <YStack gap="$md">
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Receipt
                  size={20}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Reimbursements
                </Text>
                {reimbursements &&
                  reimbursements.filter((r) => r.status === 'pending').length > 0 && (
                    <View
                      bg="$warning"
                      px={8}
                      py={2}
                      borderRadius={10}
                    >
                      <Text
                        fontSize={10}
                        fontWeight="700"
                        color="white"
                      >
                        {reimbursements.filter((r) => r.status === 'pending').length} pending
                      </Text>
                    </View>
                  )}
              </XStack>
              {reimbursementsLoading ? (
                <YStack
                  py="$lg"
                  alignItems="center"
                >
                  <Spinner
                    size="small"
                    color="$primary"
                  />
                </YStack>
              ) : reimbursements && reimbursements.length > 0 ? (
                <YStack mt="$sm">
                  {reimbursements.map((reimbursement, i) => (
                    <ExpandableReimbursementCard
                      key={reimbursement.public_id}
                      reimbursement={reimbursement}
                      index={reimbursements.length - i}
                      onReview={() => setReimbursementToReview(reimbursement)}
                      onImagePress={handleReimbursementImagePress}
                    />
                  ))}
                </YStack>
              ) : (
                <YStack
                  bg="rgba(255,255,255,0.9)"
                  borderRadius={16}
                  p="$xl"
                  alignItems="center"
                  gap="$md"
                  borderWidth={1}
                  borderStyle="dashed"
                  borderColor="$borderColor"
                >
                  <View
                    width={56}
                    height={56}
                    borderRadius={28}
                    bg="$primaryBackground"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Receipt
                      size={26}
                      color="$primary"
                    />
                  </View>
                  <Text
                    color="$color"
                    fontSize="$4"
                    fontWeight="600"
                  >
                    No Reimbursements
                  </Text>
                  <Text
                    color="$colorSubtle"
                    fontSize="$2"
                    textAlign="center"
                  >
                    Handyman hasn&apos;t submitted any reimbursement requests
                  </Text>
                </YStack>
              )}
            </YStack>

            {/* Review Section */}
            {isCompleted && (
              <YStack
                gap="$md"
                pt="$md"
                borderTopWidth={1}
                borderTopColor="rgba(0,0,0,0.05)"
              >
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Award
                    size={20}
                    color="$warning"
                  />
                  <Text
                    fontSize="$4"
                    fontWeight="700"
                    color="$color"
                  >
                    Rate the Handyman
                  </Text>
                </XStack>
                {my_review ? (
                  <HandymanReviewDisplay review={my_review} />
                ) : (
                  <ReviewSection
                    jobId={jobId}
                    onSubmitted={refetch}
                  />
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>

        <ImageViewerModal
          visible={viewerItem !== null}
          item={viewerItem}
          onClose={() => setViewerItem(null)}
        />
        <ReportReviewModal
          visible={reportToReview !== null}
          report={reportToReview}
          onApprove={handleApproveReport}
          onReject={handleRejectReport}
          onClose={() => setReportToReview(null)}
          isLoading={isReviewing}
        />
        <ReimbursementReviewModal
          visible={reimbursementToReview !== null}
          reimbursement={reimbursementToReview}
          onApprove={handleApproveReimbursement}
          onReject={handleRejectReimbursement}
          onClose={() => setReimbursementToReview(null)}
          isLoading={isReviewingReimbursement}
        />
        <ImageViewer
          images={reimbursementImages}
          initialIndex={reimbursementImageIndex}
          visible={showReimbursementViewer}
          onClose={() => setShowReimbursementViewer(false)}
        />
      </YStack>
    </GradientBackground>
  )
}
