'use client'

import { useState, useMemo } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  View,
  Image,
  TextArea,
  PageHeader,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import {
  useJobDashboard,
  useHandymanWorkSessions,
  useCreateDailyReport,
  isUnsupportedImageFormat,
} from '@my/api'
import { Clock, Plus, Minus, Camera, CheckCircle2, Circle, Save } from '@tamagui/lucide-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import {
  showReportSubmittedToast,
  showSubmissionErrorToast,
  showValidationErrorToast,
} from 'app/utils/toast-messages'
import * as ImagePicker from 'expo-image-picker'

interface TaskItem {
  public_id: string
  title: string
  description: string
  is_completed: boolean
  marked_complete: boolean
  notes: string
}

export function CreateReportScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { jobId } = useLocalSearchParams<{ jobId: string }>()

  const [summary, setSummary] = useState('')
  const [workHours, setWorkHours] = useState(1)
  const [workMinutes, setWorkMinutes] = useState(0)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch job dashboard to get tasks
  const { data: dashboard, isLoading: dashboardLoading } = useJobDashboard(jobId || '')

  // Fetch sessions to calculate total work time
  const { data: sessions } = useHandymanWorkSessions(jobId || '')

  // Initialize tasks when dashboard loads
  useMemo(() => {
    if (dashboard?.tasks_progress?.tasks && tasks.length === 0) {
      const initialTasks = dashboard.tasks_progress.tasks.map((task) => ({
        public_id: task.public_id,
        title: task.title,
        description: task.description,
        is_completed: task.is_completed,
        marked_complete: task.is_completed,
        notes: '',
      }))
      setTasks(initialTasks)
    }
  }, [dashboard?.tasks_progress?.tasks])

  // Calculate total session time for today
  useMemo(() => {
    if (sessions) {
      const today = new Date().toDateString()
      const todaySessions = sessions.filter((s) => new Date(s.started_at).toDateString() === today)
      const totalSeconds = todaySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0)
      if (totalSeconds > 0) {
        setWorkHours(Math.floor(totalSeconds / 3600))
        setWorkMinutes(Math.floor((totalSeconds % 3600) / 60))
      }
    }
  }, [sessions])

  const createReportMutation = useCreateDailyReport()

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.public_id === taskId ? { ...task, marked_complete: !task.marked_complete } : task
      )
    )
  }

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
    })

    if (!result.canceled) {
      // Filter out unsupported RAW formats
      const supportedAssets = result.assets.filter((asset) => {
        const fileName = asset.fileName || ''
        if (isUnsupportedImageFormat(fileName, asset.mimeType ?? undefined)) {
          return false
        }
        return true
      })
      setPhotos((prev) => [...prev, ...supportedAssets.map((a) => a.uri)])
    }
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!jobId) return

    if (!summary.trim()) {
      showValidationErrorToast(toast, 'summary')
      return
    }

    setIsSubmitting(true)
    try {
      const totalSeconds = workHours * 3600 + workMinutes * 60

      await createReportMutation.mutateAsync({
        jobId,
        data: {
          report_date: new Date().toISOString().split('T')[0] as string,
          summary: summary.trim(),
          total_work_duration_seconds: totalSeconds,
          tasks: tasks.map((task) => ({
            task_id: task.public_id,
            notes: task.notes || undefined,
            marked_complete: task.marked_complete,
          })),
        },
      })

      // Navigate back with toast param
      router.back()
      // Note: For router.back(), we can't pass params easily
      // The toast will be handled differently or shown before navigation
    } catch (error: any) {
      showSubmissionErrorToast(toast, error?.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!jobId) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <Text color="$error">Invalid job ID</Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (dashboardLoading) {
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
  }

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="Create Daily Report"
          description={PAGE_DESCRIPTIONS['daily-report']}
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
            {/* Date Display */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
            >
              <Text
                fontSize="$2"
                color="$colorSubtle"
                mb="$xs"
              >
                Report Date
              </Text>
              <Text
                fontSize="$4"
                fontWeight="600"
                color="$color"
              >
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </YStack>

            {/* Work Hours */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$md"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Clock
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Work Duration
                </Text>
              </XStack>

              <XStack
                justifyContent="center"
                alignItems="center"
                gap="$lg"
              >
                {/* Hours */}
                <YStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Button
                    unstyled
                    onPress={() => setWorkHours((h) => Math.min(24, h + 1))}
                    bg="$primaryBackground"
                    width={48}
                    height={48}
                    borderRadius="$full"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <Plus
                      size={20}
                      color="$primary"
                    />
                  </Button>
                  <YStack alignItems="center">
                    <Text
                      fontSize="$8"
                      fontWeight="700"
                      color="$color"
                    >
                      {workHours.toString().padStart(2, '0')}
                    </Text>
                    <Text
                      fontSize="$2"
                      color="$colorSubtle"
                    >
                      hours
                    </Text>
                  </YStack>
                  <Button
                    unstyled
                    onPress={() => setWorkHours((h) => Math.max(0, h - 1))}
                    bg="$backgroundMuted"
                    width={48}
                    height={48}
                    borderRadius="$full"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <Minus
                      size={20}
                      color="$colorSubtle"
                    />
                  </Button>
                </YStack>

                <Text
                  fontSize="$6"
                  fontWeight="700"
                  color="$colorSubtle"
                >
                  :
                </Text>

                {/* Minutes */}
                <YStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Button
                    unstyled
                    onPress={() => setWorkMinutes((m) => (m + 15) % 60)}
                    bg="$primaryBackground"
                    width={48}
                    height={48}
                    borderRadius="$full"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <Plus
                      size={20}
                      color="$primary"
                    />
                  </Button>
                  <YStack alignItems="center">
                    <Text
                      fontSize="$8"
                      fontWeight="700"
                      color="$color"
                    >
                      {workMinutes.toString().padStart(2, '0')}
                    </Text>
                    <Text
                      fontSize="$2"
                      color="$colorSubtle"
                    >
                      minutes
                    </Text>
                  </YStack>
                  <Button
                    unstyled
                    onPress={() => setWorkMinutes((m) => Math.max(0, m - 15))}
                    bg="$backgroundMuted"
                    width={48}
                    height={48}
                    borderRadius="$full"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <Minus
                      size={20}
                      color="$colorSubtle"
                    />
                  </Button>
                </YStack>
              </XStack>
            </YStack>

            {/* Work Summary */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$sm"
            >
              <Text
                fontSize="$4"
                fontWeight="600"
                color="$color"
              >
                Work Summary
              </Text>
              <TextArea
                placeholder="Describe what you accomplished today..."
                value={summary}
                onChangeText={setSummary}
                minHeight={120}
                bg="$backgroundMuted"
                borderRadius={12}
                borderWidth={1}
                borderColor="$borderColor"
                p="$md"
              />
            </YStack>

            {/* Tasks Completed */}
            {tasks.length > 0 && (
              <YStack
                bg="rgba(255,255,255,0.95)"
                borderRadius={16}
                p="$md"
                borderWidth={1}
                borderColor="rgba(0,0,0,0.08)"
                gap="$md"
              >
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Tasks Completed
                </Text>
                <YStack gap="$sm">
                  {tasks.map((task) => (
                    <Button
                      key={task.public_id}
                      unstyled
                      onPress={() => handleToggleTask(task.public_id)}
                      bg={task.marked_complete ? '$successBackground' : '$backgroundMuted'}
                      borderRadius={12}
                      p="$md"
                      pressStyle={{ opacity: 0.8 }}
                    >
                      <XStack
                        alignItems="center"
                        gap="$md"
                      >
                        {task.marked_complete ? (
                          <CheckCircle2
                            size={22}
                            color="$success"
                          />
                        ) : (
                          <Circle
                            size={22}
                            color="$colorSubtle"
                          />
                        )}
                        <YStack flex={1}>
                          <Text
                            fontSize="$3"
                            fontWeight="500"
                            color={task.marked_complete ? '$success' : '$color'}
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
                    </Button>
                  ))}
                </YStack>
              </YStack>
            )}

            {/* Evidence Photos */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$md"
            >
              <XStack
                justifyContent="space-between"
                alignItems="center"
              >
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Evidence Photos
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  {photos.length}/5
                </Text>
              </XStack>

              <XStack
                flexWrap="wrap"
                gap="$sm"
              >
                {photos.map((uri, index) => (
                  <Button
                    key={index}
                    unstyled
                    onPress={() => handleRemovePhoto(index)}
                    width={80}
                    height={80}
                    borderRadius={12}
                    overflow="hidden"
                  >
                    <Image
                      source={{ uri }}
                      width={80}
                      height={80}
                      resizeMode="cover"
                    />
                    <View
                      position="absolute"
                      top={4}
                      right={4}
                      bg="rgba(0,0,0,0.5)"
                      borderRadius="$full"
                      width={20}
                      height={20}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        color="white"
                        fontSize={12}
                      >
                        ✕
                      </Text>
                    </View>
                  </Button>
                ))}

                {photos.length < 5 && (
                  <Button
                    unstyled
                    onPress={handleAddPhoto}
                    width={80}
                    height={80}
                    borderRadius={12}
                    bg="$backgroundMuted"
                    borderWidth={2}
                    borderColor="$borderColor"
                    borderStyle="dashed"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <Camera
                      size={24}
                      color="$colorSubtle"
                    />
                  </Button>
                )}
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Submit Button */}
        <YStack
          px="$lg"
          py="$md"
          bg="rgba(255,255,255,0.95)"
          borderTopWidth={1}
          borderTopColor="$borderColor"
          pb={insets.bottom + 16}
        >
          <Button
            bg="$primary"
            borderRadius="$lg"
            py="$md"
            onPress={handleSubmit}
            disabled={isSubmitting}
            pressStyle={{ opacity: 0.9 }}
          >
            {isSubmitting ? (
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
                  Submitting...
                </Text>
              </XStack>
            ) : (
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Save
                  size={18}
                  color="white"
                />
                <Text
                  color="white"
                  fontWeight="600"
                >
                  Submit Report
                </Text>
              </XStack>
            )}
          </Button>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
