'use client'

import { useState, useCallback } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image, TextArea } from '@my/ui'
import { GradientBackground } from '@my/ui'
import {
  useHomeownerJobDashboard,
  useHomeownerDailyReports,
  useHomeownerWorkSessions,
  useApproveJobCompletion,
  useRejectJobCompletion,
  useReviewDailyReport,
  useCreateDispute,
  useCreateHandymanReview,
} from '@my/api'
import type {
  DashboardTask,
  DailyReport,
  DailyReportStatus,
  WorkSession,
  SessionMediaItem,
  HandymanReview,
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
} from 'react-native'

interface HomeownerJobDashboardProps {
  jobId: string
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

// Circular Progress
function CircularProgress({
  progress,
  size = 100,
  strokeWidth = 8,
  color = '#0C9A5C',
}: { progress: number; size?: number; strokeWidth?: number; color?: string }) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  return (
    <View
      width={size}
      height={size}
      alignItems="center"
      justifyContent="center"
    >
      <View
        position="absolute"
        width={size}
        height={size}
        borderRadius={size / 2}
        borderWidth={strokeWidth}
        borderColor="rgba(0,0,0,0.08)"
      />
      <View
        position="absolute"
        width={size}
        height={size}
        borderRadius={size / 2}
        borderWidth={strokeWidth}
        borderColor={color as any}
        borderTopColor={(clampedProgress < 25 ? 'transparent' : color) as any}
        borderRightColor={(clampedProgress < 50 ? 'transparent' : color) as any}
        borderBottomColor={(clampedProgress < 75 ? 'transparent' : color) as any}
        borderLeftColor={(clampedProgress < 100 ? 'transparent' : color) as any}
        transform={[{ rotate: '-90deg' }]}
      />
      <YStack alignItems="center">
        <Text
          fontSize="$6"
          fontWeight="800"
          color="$color"
        >
          {Math.round(clampedProgress)}%
        </Text>
        <Text
          fontSize="$1"
          color="$colorSubtle"
        >
          Complete
        </Text>
      </YStack>
    </View>
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

  // Mutations
  const approveCompletionMutation = useApproveJobCompletion()
  const rejectCompletionMutation = useRejectJobCompletion()
  const reviewReportMutation = useReviewDailyReport()
  const createDisputeMutation = useCreateDispute()

  // State
  const [viewerItem, setViewerItem] = useState<SessionMediaItem | null>(null)
  const [reportToReview, setReportToReview] = useState<DailyReport | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      refetch()
      refetchReports()
      refetchSessions()
    }, [refetch, refetchReports, refetchSessions])
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
          <View width={38} />
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
            {/* Job Card */}
            <YStack
              bg="rgba(255,255,255,0.98)"
              borderRadius={24}
              p="$lg"
              gap="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.06)"
            >
              <XStack
                gap="$md"
                alignItems="flex-start"
              >
                <CircularProgress
                  progress={tasks_progress.completion_percentage}
                  size={80}
                  strokeWidth={6}
                  color={tasks_progress.completion_percentage >= 100 ? '#22C55E' : '#0C9A5C'}
                />
                <YStack
                  flex={1}
                  gap="$xs"
                >
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
              </XStack>
              <XStack
                justifyContent="space-between"
                alignItems="center"
                pt="$sm"
                borderTopWidth={1}
                borderTopColor="rgba(0,0,0,0.05)"
              >
                <XStack
                  alignItems="center"
                  gap="$xs"
                >
                  <User
                    size={14}
                    color="$colorSubtle"
                  />
                  <Text
                    fontSize="$3"
                    color="$colorSubtle"
                  >
                    {job.handyman_display_name}
                  </Text>
                </XStack>
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

            {/* Pending Completion Banner */}
            {isPendingCompletion && (
              <YStack
                bg="rgba(245, 158, 11, 0.1)"
                borderRadius={20}
                p="$lg"
                gap="$md"
                borderWidth={2}
                borderColor="$warning"
              >
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <AlertCircle
                    size={24}
                    color="$warning"
                  />
                  <YStack flex={1}>
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color="$color"
                    >
                      Completion Requested
                    </Text>
                    <Text
                      fontSize="$2"
                      color="$colorSubtle"
                    >
                      Handyman submitted for completion
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
            {sessions && sessions.length > 0 && (
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
                </XStack>
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
              </YStack>
            )}

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
      </YStack>
    </GradientBackground>
  )
}
