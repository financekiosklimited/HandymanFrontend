'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  View,
  Image,
  Input,
  TextArea,
} from '@my/ui'
import { GradientBackground, ImageViewer, AttachmentGrid } from '@my/ui'
import {
  useJobDashboard,
  useHandymanDailyReports,
  useHandymanWorkSessions,
  useStartWorkSession,
  useStopWorkSession,
  useUploadSessionMedia,
  useRequestJobCompletion,
  useCreateHomeownerReview,
  useJobChatUnreadCount,
  useHandymanReimbursements,
} from '@my/api'
import type {
  DashboardTask,
  DailyReport,
  DailyReportStatus,
  WorkSession,
  SessionMediaItem,
  HomeownerReview,
  JobReimbursement,
  ReimbursementStatus,
} from '@my/api'
import {
  ArrowLeft,
  Play,
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  DollarSign,
  Timer,
  ListChecks,
  Award,
  Edit3,
  Briefcase,
  Camera,
  Image as ImageIcon,
  Video,
  X,
  History,
  ChevronDown,
  ChevronUp,
  Eye,
  Star,
  Hourglass,
  MessageCircle,
  Receipt,
} from '@tamagui/lucide-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import { colors } from '@my/config'
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'
import {
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
} from 'react-native'

interface OngoingJobDashboardProps {
  jobId: string
  applicationId?: string
}

// Chat Button Component with Unread Badge
function ChatButton({ jobId }: { jobId: string }) {
  const router = useRouter()
  const { data: unreadCount = 0 } = useJobChatUnreadCount('handyman', jobId)

  const handlePress = () => {
    router.push({
      pathname: '/(handyman)/jobs/ongoing/chat/[id]',
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

function ProfessionalReviewDisplay({ review }: { review: HomeownerReview | null }) {
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
      position="relative"
    >
      <View
        position="absolute"
        top={-10}
        right={20}
        opacity={0.05}
      >
        <Award
          size={60}
          color={colors.warning as any}
        />
      </View>

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
            Your Review for Homeowner
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
          position="relative"
        >
          <Text
            fontSize="$3"
            color="$color"
            lineHeight={22}
            fontStyle="italic"
            opacity={0.8}
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
          VISIBLE TO OTHER PROFESSIONALS
        </Text>
      </XStack>
    </YStack>
  )
}

function HomeownerReviewDisplay({ review }: { review: HomeownerReview | null }) {
  if (!review) return null

  return (
    <YStack
      bg="$primaryBackground"
      borderRadius={24}
      p="$lg"
      gap="$md"
      borderWidth={1}
      borderColor="rgba(12, 154, 92, 0.15)"
      shadowColor="rgba(12, 154, 92, 0.2)"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.1}
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
            color="$primary"
          >
            Review from Homeowner
          </Text>
          <Text
            fontSize="$1"
            color="$primary"
            opacity={0.7}
          >
            Received{' '}
            {new Date(review.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </YStack>
        <XStack
          bg="white"
          px="$md"
          py="$xs"
          borderRadius="$full"
          alignItems="center"
          gap="$xs"
          shadowColor="black"
          shadowOpacity={0.05}
          shadowRadius={4}
        >
          <Star
            size={14}
            color="#F59E0B"
            fill="#F59E0B"
          />
          <Text
            fontSize="$4"
            fontWeight="800"
            color="$primary"
          >
            {review.rating.toFixed(1)}
          </Text>
        </XStack>
      </XStack>

      {review.comment && (
        <YStack
          bg="white"
          p="$md"
          borderRadius={18}
          borderWidth={1}
          borderColor="rgba(0,0,0,0.05)"
        >
          <Text
            fontSize="$3"
            color="$color"
            lineHeight={22}
            fontWeight="500"
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
        <CheckCircle2
          size={12}
          color="$primary"
        />
        <Text
          fontSize="$1"
          fontWeight="700"
          color="$primary"
          letterSpacing={0.5}
          opacity={0.8}
        >
          INFLUENCES YOUR PUBLIC RATING
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
  const createReviewMutation = useCreateHomeownerReview()
  const toast = useToastController()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.show('Please select a rating', { native: false })
      return
    }
    setIsSubmitting(true)
    try {
      const response = await createReviewMutation.mutateAsync({
        jobId,
        data: { rating, comment: comment || undefined },
      })
      toast.show('Review submitted!', { native: false })
      onSubmitted()
    } catch (error: any) {
      console.error('DEBUG: Review submission error:', error)
      if (error.response) {
        try {
          const errorData = await error.response.json()
          console.error('DEBUG: Review submission error body:', errorData)
        } catch (e) {}
      }
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
      gap="$lg"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.08)"
      shadowColor="black"
      shadowOffset={{ width: 0, height: 10 }}
      shadowOpacity={0.03}
      shadowRadius={20}
    >
      <YStack
        gap="$xs"
        alignItems="center"
      >
        <Text
          fontSize="$4"
          fontWeight="700"
          color="$color"
        >
          Rate your Experience
        </Text>
        <Text
          fontSize="$2"
          color="$colorSubtle"
          textAlign="center"
        >
          Help other professionals by sharing your thoughts
        </Text>
      </YStack>

      <StarRating
        rating={rating}
        setRating={setRating}
        size={36}
      />

      <YStack gap="$xs">
        <Text
          fontSize="$2"
          fontWeight="700"
          color="$colorSubtle"
          ml="$xs"
        >
          How was the job?
        </Text>
        <TextArea
          placeholder="Communication, site access, payment, etc..."
          placeholderTextColor="$colorMuted"
          value={comment}
          onChangeText={setComment}
          minHeight={100}
          borderRadius={16}
          bg="$backgroundMuted"
          borderWidth={1.5}
          borderColor="rgba(0,0,0,0.05)"
          p="$md"
          color="$color"
          focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
        />
      </YStack>

      <Button
        bg={rating === 0 ? '$backgroundMuted' : '$primary'}
        borderRadius={16}
        height={54}
        onPress={handleSubmit}
        disabled={isSubmitting || rating === 0}
        pressStyle={{ opacity: 0.9, scale: 0.98 }}
      >
        {isSubmitting ? (
          <Spinner
            size="small"
            color="white"
          />
        ) : (
          <XStack
            gap="$xs"
            alignItems="center"
          >
            <Send
              size={18}
              color="white"
            />
            <Text
              color={rating === 0 ? '$colorMuted' : '$white'}
              fontWeight="700"
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
  rejected: { bg: '$errorBackground', text: '$error', label: 'Revision', dot: '#EF4444' },
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

// Upload Preview Modal
function UploadPreviewModal({
  visible,
  imageUri,
  mediaType,
  onConfirm,
  onCancel,
  isLoading,
  duration,
}: {
  visible: boolean
  imageUri: string | null
  mediaType: 'photo' | 'video'
  onConfirm: (description: string) => void
  onCancel: () => void
  isLoading: boolean
  duration?: number
}) {
  const [description, setDescription] = useState('')

  // Format duration for display
  const formatDuration = (s?: number) => {
    if (!s) return null
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
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
              shadowColor="black"
              shadowOffset={{ width: 0, height: 20 }}
              shadowOpacity={0.3}
              shadowRadius={40}
              elevation={20}
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
                  {mediaType === 'photo' ? (
                    <ImageIcon
                      size={24}
                      color="$primary"
                    />
                  ) : (
                    <Video
                      size={24}
                      color="$primary"
                    />
                  )}
                </View>
                <Text
                  fontSize="$6"
                  fontWeight="800"
                  color="$color"
                >
                  Review {mediaType === 'photo' ? 'Photo' : 'Video'}
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  Add a description before uploading
                </Text>
              </YStack>

              {imageUri && (
                <View
                  borderRadius={20}
                  overflow="hidden"
                  bg="$backgroundMuted"
                  height={220}
                  position="relative"
                  borderWidth={1}
                  borderColor="rgba(0,0,0,0.05)"
                >
                  {mediaType === 'photo' ? (
                    <Image
                      source={{ uri: imageUri }}
                      width="100%"
                      height={220}
                      resizeMode="cover"
                    />
                  ) : (
                    <YStack
                      flex={1}
                      justifyContent="center"
                      alignItems="center"
                      gap="$sm"
                    >
                      <View
                        bg="rgba(0,0,0,0.4)"
                        p="$md"
                        borderRadius="$full"
                      >
                        <Play
                          size={32}
                          color="white"
                          fill="white"
                        />
                      </View>
                      <Text
                        color="$color"
                        fontWeight="700"
                      >
                        Video Preview
                      </Text>
                      {duration && (
                        <View
                          bg="rgba(0,0,0,0.6)"
                          px="$sm"
                          py={2}
                          borderRadius="$full"
                        >
                          <Text
                            color="white"
                            fontSize={10}
                            fontWeight="700"
                          >
                            {formatDuration(duration)}
                          </Text>
                        </View>
                      )}
                    </YStack>
                  )}
                </View>
              )}

              <YStack gap="$xs">
                <Text
                  fontSize="$2"
                  fontWeight="700"
                  color="$colorSubtle"
                  ml="$xs"
                >
                  Description
                </Text>
                <TextArea
                  placeholder="What is this evidence for?"
                  placeholderTextColor="$colorMuted"
                  value={description}
                  onChangeText={setDescription}
                  minHeight={80}
                  borderRadius={16}
                  bg="$backgroundMuted"
                  borderWidth={1.5}
                  borderColor="rgba(0,0,0,0.05)"
                  p="$md"
                  color="$color"
                  focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
                />
              </YStack>

              <XStack
                gap="$md"
                mt="$sm"
              >
                <Button
                  flex={1}
                  bg="$backgroundMuted"
                  borderRadius={16}
                  height={54}
                  onPress={onCancel}
                  disabled={isLoading}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text
                    color="$color"
                    fontWeight="700"
                  >
                    Cancel
                  </Text>
                </Button>
                <Button
                  flex={1}
                  bg="$primary"
                  borderRadius={16}
                  height={54}
                  onPress={() => onConfirm(description)}
                  disabled={isLoading}
                  pressStyle={{ opacity: 0.9, scale: 0.98 }}
                >
                  {isLoading ? (
                    <Spinner
                      size="small"
                      color="white"
                    />
                  ) : (
                    <XStack
                      gap="$xs"
                      alignItems="center"
                    >
                      <Send
                        size={18}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontWeight="700"
                      >
                        Upload Now
                      </Text>
                    </XStack>
                  )}
                </Button>
              </XStack>
            </YStack>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// Expandable Report Card
function ExpandableReportCard({
  report,
  dayNumber,
  onEdit,
}: { report: DailyReport; dayNumber: number; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const statusStyle = reportStatusColors[report.status]
  const hours = Math.floor(report.total_work_duration_seconds / 3600)
  const minutes = Math.floor((report.total_work_duration_seconds % 3600) / 60)
  const canEdit = report.status === 'pending' || report.status === 'rejected'
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
                    bg="$errorBackground"
                    p="$sm"
                    borderRadius={8}
                  >
                    <Text
                      fontSize="$1"
                      color="$error"
                    >
                      Feedback: {report.homeowner_comment}
                    </Text>
                  </View>
                )}
                {canEdit && (
                  <Button
                    bg="$primary"
                    borderRadius="$lg"
                    py="$sm"
                    onPress={onEdit}
                  >
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      <Edit3
                        size={14}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontWeight="600"
                      >
                        Edit Report
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

// Expandable Reimbursement Card
function ExpandableReimbursementCard({
  reimbursement,
  index,
  onEdit,
}: {
  reimbursement: JobReimbursement
  index: number
  onEdit: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const statusStyle = reimbursementStatusColors[reimbursement.status]
  const canEdit = reimbursement.status === 'pending'

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

                {/* Attachments */}
                {reimbursement.attachments.length > 0 && (
                  <YStack gap="$xs">
                    <Text
                      fontSize="$2"
                      fontWeight="600"
                      color="$colorSubtle"
                    >
                      Attachments
                    </Text>
                    <AttachmentGrid
                      attachments={reimbursement.attachments}
                      itemSize={60}
                      gap={8}
                    />
                  </YStack>
                )}

                {reimbursement.homeowner_comment && (
                  <View
                    bg={
                      reimbursement.status === 'rejected'
                        ? '$errorBackground'
                        : '$primaryBackground'
                    }
                    p="$sm"
                    borderRadius={8}
                  >
                    <Text
                      fontSize="$1"
                      color={reimbursement.status === 'rejected' ? '$error' : '$primary'}
                    >
                      Feedback: {reimbursement.homeowner_comment}
                    </Text>
                  </View>
                )}

                {canEdit && (
                  <Button
                    bg="$primary"
                    borderRadius="$lg"
                    py="$sm"
                    onPress={onEdit}
                  >
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      <Edit3
                        size={14}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontWeight="600"
                      >
                        Edit Request
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

// Live Timer
function LiveTimer({
  startTime,
  initialSeconds = 0,
}: { startTime: string; initialSeconds?: number }) {
  const [elapsed, setElapsed] = useState(initialSeconds)
  useEffect(() => {
    const updateTimer = () => {
      const start = new Date(startTime).getTime()
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startTime])
  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60
  return (
    <Text
      fontSize="$8"
      fontWeight="800"
      color="$success"
    >
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
      {seconds.toString().padStart(2, '0')}
    </Text>
  )
}

// Camera Preview Modal
function CameraPreviewModal({
  visible,
  imageUri,
  onConfirm,
  onRetake,
  onCancel,
  isLoading,
  title,
}: {
  visible: boolean
  imageUri: string | null
  onConfirm: () => void
  onRetake: () => void
  onCancel: () => void
  isLoading: boolean
  title: string
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View
        flex={1}
        bg="rgba(0,0,0,0.9)"
        justifyContent="center"
        alignItems="center"
        p="$lg"
      >
        <YStack
          bg="$background"
          borderRadius={24}
          p="$lg"
          width="100%"
          maxWidth={400}
          gap="$md"
        >
          <Text
            fontSize="$5"
            fontWeight="700"
            color="$color"
            textAlign="center"
          >
            {title}
          </Text>
          {imageUri && (
            <View
              borderRadius={16}
              overflow="hidden"
              height={300}
            >
              <Image
                source={{ uri: imageUri }}
                width="100%"
                height={300}
                resizeMode="cover"
              />
            </View>
          )}
          <XStack gap="$md">
            <Button
              flex={1}
              bg="$backgroundMuted"
              borderRadius="$lg"
              py="$md"
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text
                color="$color"
                fontWeight="600"
              >
                Cancel
              </Text>
            </Button>
            <Button
              flex={1}
              bg="$warning"
              borderRadius="$lg"
              py="$md"
              onPress={onRetake}
              disabled={isLoading}
            >
              <XStack
                alignItems="center"
                gap="$xs"
              >
                <Camera
                  size={16}
                  color="white"
                />
                <Text
                  color="white"
                  fontWeight="600"
                >
                  Retake
                </Text>
              </XStack>
            </Button>
          </XStack>
          <Button
            bg="$primary"
            borderRadius="$lg"
            py="$md"
            onPress={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Spinner
                  size="small"
                  color="white"
                />
                <Text
                  color="white"
                  fontWeight="600"
                >
                  Processing...
                </Text>
              </XStack>
            ) : (
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <CheckCircle2
                  size={18}
                  color="white"
                />
                <Text
                  color="white"
                  fontWeight="600"
                >
                  Confirm & Continue
                </Text>
              </XStack>
            )}
          </Button>
        </YStack>
      </View>
    </Modal>
  )
}

export function OngoingJobDashboard({ jobId }: OngoingJobDashboardProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()

  // State
  const [isStartingSession, setIsStartingSession] = useState(false)
  const [isStoppingSession, setIsStoppingSession] = useState(false)
  const [isRequestingCompletion, setIsRequestingCompletion] = useState(false)
  const [showStartPreview, setShowStartPreview] = useState(false)
  const [showStopPreview, setShowStopPreview] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [showUploadPreview, setShowUploadPreview] = useState(false)
  const [uploadAsset, setUploadAsset] = useState<{
    uri: string
    type: 'photo' | 'video'
    duration?: number
  } | null>(null)
  const [viewerItem, setViewerItem] = useState<SessionMediaItem | null>(null)

  // Queries
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch,
  } = useJobDashboard(jobId)
  const {
    data: reports,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useHandymanDailyReports(jobId)
  const { data: sessions, refetch: refetchSessions } = useHandymanWorkSessions(jobId)
  const {
    data: reimbursements,
    isLoading: reimbursementsLoading,
    refetch: refetchReimbursements,
  } = useHandymanReimbursements(jobId)

  // Refetch all data when screen is focused (e.g., coming back from report creation)
  useFocusEffect(
    useCallback(() => {
      refetch()
      refetchReports()
      refetchSessions()
      refetchReimbursements()
    }, [refetch, refetchReports, refetchSessions, refetchReimbursements])
  )

  // Mutations
  const startSessionMutation = useStartWorkSession()
  const stopSessionMutation = useStopWorkSession()
  const uploadMediaMutation = useUploadSessionMedia()
  const requestCompletionMutation = useRequestJobCompletion()

  const openCamera = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      toast.show('Camera permission required', { native: false })
      return null
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    })
    if (result.canceled || !result.assets?.[0]) return null
    return result.assets[0].uri
  }

  const handleStartWorkCamera = async () => {
    const imageUri = await openCamera()
    if (imageUri) {
      setCapturedImage(imageUri)
      setShowStartPreview(true)
    }
  }

  const confirmStartSession = async () => {
    if (!capturedImage) return
    setIsStartingSession(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        toast.show('Location required', { native: false })
        setIsStartingSession(false)
        return
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const photoFile = {
        uri: capturedImage,
        type: 'image/jpeg',
        name: `start_photo_${Date.now()}.jpg`,
      }
      await startSessionMutation.mutateAsync({
        jobId,
        data: {
          started_at: new Date().toISOString(),
          start_latitude: location.coords.latitude,
          start_longitude: location.coords.longitude,
          start_accuracy: location.coords.accuracy || undefined,
          start_photo: photoFile,
        },
      })
      toast.show('Session started', { native: false })
      setShowStartPreview(false)
      setCapturedImage(null)
      refetch()
    } catch (error: any) {
      toast.show('Failed', { message: error?.message, native: false })
    } finally {
      setIsStartingSession(false)
    }
  }

  const handleStopWorkCamera = async () => {
    const imageUri = await openCamera()
    if (imageUri) {
      setCapturedImage(imageUri)
      setShowStopPreview(true)
    }
  }

  const confirmStopSession = async () => {
    if (!dashboard?.active_session || !capturedImage) return
    setIsStoppingSession(true)
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const endPhotoFile = {
        uri: capturedImage,
        type: 'image/jpeg',
        name: `end_photo_${Date.now()}.jpg`,
      }

      await stopSessionMutation.mutateAsync({
        jobId,
        sessionId: dashboard.active_session.public_id,
        data: {
          ended_at: new Date().toISOString(),
          end_latitude: location.coords.latitude,
          end_longitude: location.coords.longitude,
          end_accuracy: location.coords.accuracy || undefined,
          end_photo: endPhotoFile,
        },
      })
      toast.show('Session ended', { native: false })
      setShowStopPreview(false)
      setCapturedImage(null)
      refetch()
    } catch (error: any) {
      toast.show('Failed', { message: error?.message, native: false })
    } finally {
      setIsStoppingSession(false)
    }
  }

  const handleSelectMedia = async (type: 'photo' | 'video') => {
    const result =
      type === 'photo'
        ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] })
    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]
    setUploadAsset({
      uri: asset.uri,
      type,
      duration: asset.duration ? Math.round(asset.duration / 1000) : undefined,
    })
    setShowUploadPreview(true)
  }

  const confirmUploadMedia = async (description: string) => {
    if (!uploadAsset || !dashboard?.active_session) return
    setIsUploadingMedia(true)
    try {
      const file = {
        uri: uploadAsset.uri,
        type: uploadAsset.type === 'photo' ? 'image/jpeg' : 'video/mp4',
        name: `${uploadAsset.type}_${Date.now()}.${uploadAsset.type === 'photo' ? 'jpg' : 'mp4'}`,
      }
      await uploadMediaMutation.mutateAsync({
        jobId,
        sessionId: dashboard.active_session.public_id,
        data: {
          media_type: uploadAsset.type,
          file,
          file_size: 0,
          caption: description || undefined,
          duration_seconds: uploadAsset.duration || undefined,
        },
      })
      toast.show('Uploaded', { native: false })
      setShowUploadPreview(false)
      setUploadAsset(null)
      refetch()
    } catch (error: any) {
      toast.show('Failed', { message: error?.message, native: false })
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleCreateReport = () =>
    router.push({ pathname: '/(handyman)/jobs/ongoing/reports/create', params: { jobId } } as any)
  const handleEditReport = (reportId: string) =>
    router.push({
      pathname: '/(handyman)/jobs/ongoing/reports/[reportId]/edit',
      params: { jobId, reportId },
    } as any)

  // Reimbursement handlers
  const handleCreateReimbursement = () =>
    router.push({
      pathname: '/(handyman)/jobs/ongoing/reimbursements/create',
      params: { jobId },
    } as any)
  const handleEditReimbursement = (reimbursementId: string) =>
    router.push({
      pathname: '/(handyman)/jobs/ongoing/reimbursements/[reimbursementId]/edit',
      params: { jobId, reimbursementId },
    } as any)

  const handleRequestCompletion = async () => {
    setIsRequestingCompletion(true)
    try {
      await requestCompletionMutation.mutateAsync(jobId)
      toast.show('Completion requested', { native: false })
      refetch()
    } catch (error: any) {
      toast.show('Failed', { message: error?.message, native: false })
    } finally {
      setIsRequestingCompletion(false)
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
    homeowner_review,
    my_review,
  } = dashboard
  const isSessionActive = active_session !== null
  const canComplete =
    job.status === 'in_progress' && !isSessionActive && tasks_progress.completion_percentage == 100
  const isPending = job.status === 'pending_completion'
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
            Job Dashboard
          </Text>
          {/* Chat Button */}
          <ChatButton jobId={jobId} />
        </XStack>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <ScrollView
            flex={1}
            showsVerticalScrollIndicator={false}
          >
            <YStack
              px="$lg"
              pb="$2xl"
              gap="$lg"
            >
              {/* Pending Approval Banner */}
              {isPending && (
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
                >
                  {/* Decorative background element */}
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
                        Waiting for Approval
                      </Text>
                      <Text
                        fontSize="$2"
                        color="#D97706"
                        opacity={0.9}
                      >
                        Your job completion request is pending homeowner review
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              )}

              {/* Job Card */}
              <Pressable onPress={() => router.push(`/(handyman)/jobs/${jobId}`)}>
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
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      {job.homeowner.avatar_url ? (
                        <Image
                          source={{ uri: job.homeowner.avatar_url }}
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
                          <Briefcase
                            size={12}
                            color="$colorMuted"
                          />
                        </View>
                      )}
                      <Text
                        fontSize="$3"
                        color="$colorSubtle"
                      >
                        {job.homeowner.display_name}
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
                      color={colors.warning as any}
                    />
                  }
                  value={report_stats.approved_reports}
                  label="Approved"
                  color="$warning"
                />
              </XStack>

              {/* Session Card */}
              <YStack
                bg={isSessionActive ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.98)'}
                borderRadius={20}
                p="$lg"
                borderWidth={2}
                borderColor={isSessionActive ? '$success' : 'rgba(0,0,0,0.06)'}
                gap="$md"
              >
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <XStack
                    alignItems="center"
                    gap="$sm"
                  >
                    <View
                      width={12}
                      height={12}
                      borderRadius={6}
                      bg={isSessionActive ? '$success' : '$colorMuted'}
                    />
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color="$color"
                    >
                      {isSessionActive ? 'Session Active' : 'Work Session'}
                    </Text>
                  </XStack>
                  {isSessionActive && (
                    <View
                      bg="$successBackground"
                      px="$sm"
                      py={3}
                      borderRadius="$full"
                    >
                      <Text
                        fontSize={10}
                        fontWeight="700"
                        color="$success"
                      >
                        TRACKING
                      </Text>
                    </View>
                  )}
                </XStack>

                {isSessionActive && active_session ? (
                  <YStack gap="$md">
                    <YStack
                      alignItems="center"
                      py="$md"
                    >
                      <LiveTimer
                        startTime={active_session.started_at}
                        initialSeconds={active_session.current_duration_seconds}
                      />
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                        mt="$xs"
                      >
                        Session #{session_stats.total_sessions}
                      </Text>
                    </YStack>

                    {active_session.media && active_session.media.length > 0 && (
                      <MediaGallery
                        media={active_session.media}
                        onMediaPress={setViewerItem}
                      />
                    )}

                    <YStack
                      gap="$sm"
                      p="$md"
                      bg="rgba(255,255,255,0.9)"
                      borderRadius={12}
                    >
                      <Text
                        fontSize="$3"
                        fontWeight="600"
                        color="$color"
                      >
                        Upload Evidence
                      </Text>
                      <XStack gap="$sm">
                        <Button
                          flex={1}
                          bg="$primaryBackground"
                          borderRadius="$lg"
                          py="$sm"
                          onPress={() => handleSelectMedia('photo')}
                        >
                          <XStack
                            alignItems="center"
                            gap="$xs"
                          >
                            <ImageIcon
                              size={16}
                              color="$primary"
                            />
                            <Text
                              color="$primary"
                              fontWeight="600"
                            >
                              Photo
                            </Text>
                          </XStack>
                        </Button>
                        <Button
                          flex={1}
                          bg="$primaryBackground"
                          borderRadius="$lg"
                          py="$sm"
                          onPress={() => handleSelectMedia('video')}
                        >
                          <XStack
                            alignItems="center"
                            gap="$xs"
                          >
                            <Video
                              size={16}
                              color="$primary"
                            />
                            <Text
                              color="$primary"
                              fontWeight="600"
                            >
                              Video
                            </Text>
                          </XStack>
                        </Button>
                      </XStack>
                    </YStack>

                    <Button
                      bg="$error"
                      borderRadius="$lg"
                      py="$md"
                      onPress={handleStopWorkCamera}
                    >
                      <XStack
                        alignItems="center"
                        gap="$sm"
                      >
                        <Camera
                          size={18}
                          color="white"
                        />
                        <Text
                          color="white"
                          fontWeight="600"
                        >
                          Stop Session
                        </Text>
                      </XStack>
                    </Button>
                  </YStack>
                ) : !isCompleted ? (
                  <Button
                    bg="$primary"
                    borderRadius="$lg"
                    py="$md"
                    onPress={handleStartWorkCamera}
                    disabled={isPending}
                    opacity={isPending ? 0.5 : 1}
                  >
                    <XStack
                      alignItems="center"
                      gap="$sm"
                    >
                      <Camera
                        size={18}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontWeight="600"
                      >
                        Start Session
                      </Text>
                    </XStack>
                  </Button>
                ) : null}
              </YStack>

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

              <YStack gap="$md">
                <XStack
                  justifyContent="space-between"
                  alignItems="center"
                >
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
                          {report_stats.pending_reports}
                        </Text>
                      </View>
                    )}
                  </XStack>
                  {!isCompleted && (
                    <Button
                      unstyled
                      onPress={handleCreateReport}
                      bg="$primary"
                      px="$md"
                      py="$sm"
                      borderRadius={20}
                    >
                      <XStack
                        alignItems="center"
                        gap="$xs"
                      >
                        <Plus
                          size={14}
                          color="white"
                        />
                        <Text
                          color="white"
                          fontSize="$2"
                          fontWeight="600"
                        >
                          New
                        </Text>
                      </XStack>
                    </Button>
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
                        onEdit={() => handleEditReport(report.public_id)}
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
                      No Reports
                    </Text>
                  </YStack>
                )}
              </YStack>

              {/* Reimbursements Section */}
              <YStack gap="$md">
                <XStack
                  justifyContent="space-between"
                  alignItems="center"
                >
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
                            {reimbursements.filter((r) => r.status === 'pending').length}
                          </Text>
                        </View>
                      )}
                  </XStack>
                  {!isCompleted && (
                    <Button
                      unstyled
                      onPress={handleCreateReimbursement}
                      bg="$primary"
                      px="$md"
                      py="$sm"
                      borderRadius={20}
                    >
                      <XStack
                        alignItems="center"
                        gap="$xs"
                      >
                        <Plus
                          size={14}
                          color="white"
                        />
                        <Text
                          color="white"
                          fontSize="$2"
                          fontWeight="600"
                        >
                          New
                        </Text>
                      </XStack>
                    </Button>
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
                        onEdit={() => handleEditReimbursement(reimbursement.public_id)}
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
                      Request reimbursement for materials or expenses
                    </Text>
                  </YStack>
                )}
              </YStack>

              {canComplete && (
                <YStack
                  bg="rgba(34,197,94,0.1)"
                  borderRadius={20}
                  p="$lg"
                  gap="$md"
                  borderWidth={2}
                  borderColor="$success"
                >
                  <XStack
                    alignItems="center"
                    gap="$sm"
                  >
                    <CheckCircle2
                      size={24}
                      color="$success"
                    />
                    <YStack flex={1}>
                      <Text
                        fontSize="$4"
                        fontWeight="600"
                        color="$color"
                      >
                        Ready to Complete
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                      >
                        All requirements met
                      </Text>
                    </YStack>
                  </XStack>
                  <Button
                    bg="$success"
                    borderRadius="$lg"
                    py="$md"
                    onPress={handleRequestCompletion}
                    disabled={isRequestingCompletion}
                  >
                    {isRequestingCompletion ? (
                      <XStack
                        alignItems="center"
                        gap="$sm"
                      >
                        <Spinner
                          size="small"
                          color="white"
                        />
                        <Text
                          color="white"
                          fontWeight="600"
                        >
                          Requesting...
                        </Text>
                      </XStack>
                    ) : (
                      <XStack
                        alignItems="center"
                        gap="$sm"
                      >
                        <Send
                          size={18}
                          color="white"
                        />
                        <Text
                          color="white"
                          fontWeight="600"
                        >
                          Request Completion
                        </Text>
                      </XStack>
                    )}
                  </Button>
                </YStack>
              )}

              {/* Review Sections */}
              {isCompleted && (
                <YStack
                  gap="$lg"
                  pt="$md"
                  borderTopWidth={1}
                  borderTopColor="rgba(0,0,0,0.05)"
                >
                  {/* Handyman's review of Homeowner */}
                  <YStack gap="$md">
                    <XStack
                      alignItems="center"
                      gap="$sm"
                    >
                      <Award
                        size={20}
                        color={colors.warning as any}
                      />
                      <Text
                        fontSize="$4"
                        fontWeight="700"
                        color="$color"
                      >
                        Review for Homeowner
                      </Text>
                    </XStack>
                    {my_review ? (
                      <ProfessionalReviewDisplay review={my_review} />
                    ) : (
                      <ReviewSection
                        jobId={jobId}
                        onSubmitted={refetch}
                      />
                    )}
                  </YStack>

                  {/* Homeowner's review of Handyman */}
                  {homeowner_review && (
                    <YStack gap="$md">
                      <XStack
                        alignItems="center"
                        gap="$sm"
                      >
                        <Star
                          size={20}
                          color="$primary"
                        />
                        <Text
                          fontSize="$4"
                          fontWeight="700"
                          color="$color"
                        >
                          Review from Homeowner
                        </Text>
                      </XStack>
                      <HomeownerReviewDisplay review={homeowner_review} />
                    </YStack>
                  )}
                </YStack>
              )}
            </YStack>
          </ScrollView>
        </KeyboardAvoidingView>

        <CameraPreviewModal
          visible={showStartPreview}
          imageUri={capturedImage}
          onConfirm={confirmStartSession}
          onRetake={handleStartWorkCamera}
          onCancel={() => {
            setShowStartPreview(false)
            setCapturedImage(null)
          }}
          isLoading={isStartingSession}
          title="Start Session Photo"
        />
        <CameraPreviewModal
          visible={showStopPreview}
          imageUri={capturedImage}
          onConfirm={confirmStopSession}
          onRetake={handleStopWorkCamera}
          onCancel={() => {
            setShowStopPreview(false)
            setCapturedImage(null)
          }}
          isLoading={isStoppingSession}
          title="End Session Photo"
        />
        <UploadPreviewModal
          visible={showUploadPreview}
          imageUri={uploadAsset?.uri || null}
          mediaType={uploadAsset?.type || 'photo'}
          duration={uploadAsset?.duration}
          onConfirm={confirmUploadMedia}
          onCancel={() => {
            setShowUploadPreview(false)
            setUploadAsset(null)
          }}
          isLoading={isUploadingMedia}
        />
        <ImageViewerModal
          visible={viewerItem !== null}
          item={viewerItem}
          onClose={() => setViewerItem(null)}
        />
      </YStack>
    </GradientBackground>
  )
}
