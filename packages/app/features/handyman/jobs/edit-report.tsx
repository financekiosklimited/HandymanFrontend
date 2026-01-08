'use client'

import { useState, useMemo, useEffect } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image, TextArea } from '@my/ui'
import { GradientBackground } from '@my/ui'
import {
  useHandymanJobDetail,
  useHandymanDailyReport,
  useUpdateDailyReport,
} from '@my/api'
import {
  ArrowLeft,
  Clock,
  Plus,
  Minus,
  Camera,
  CheckCircle2,
  Circle,
  Save,
  AlertCircle,
} from '@tamagui/lucide-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'

interface TaskItem {
  public_id: string
  title: string
  description: string
  is_completed: boolean
  marked_complete: boolean
  notes: string
}

export function EditReportScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { jobId, reportId } = useLocalSearchParams<{ jobId: string; reportId: string }>()

  const [summary, setSummary] = useState('')
  const [workHours, setWorkHours] = useState(0)
  const [workMinutes, setWorkMinutes] = useState(0)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch job details to get all tasks (to cross-ref with report tasks)
  const { data: job, isLoading: jobLoading } = useHandymanJobDetail(jobId || '')
  
  // Fetch existing report
  const { data: report, isLoading: reportLoading, isError: reportError } = useHandymanDailyReport(jobId || '', reportId || '')

  const updateReportMutation = useUpdateDailyReport()

  // Initialize form state from report data
  useEffect(() => {
    if (report && !isInitialized) {
      setSummary(report.summary)
      
      const totalSeconds = report.total_work_duration_seconds || 0
      setWorkHours(Math.floor(totalSeconds / 3600))
      setWorkMinutes(Math.floor((totalSeconds % 3600) / 60))
      
      if (job?.tasks && report.tasks_worked) {
        const reportTaskMap = new Map(report.tasks_worked.map(t => [t.public_id, t]))
        
        const initializedTasks = job.tasks.map(jobTask => {
          const reportTask = reportTaskMap.get(jobTask.public_id)
          return {
            public_id: jobTask.public_id,
            title: jobTask.title,
            description: jobTask.description,
            is_completed: jobTask.is_completed,
            marked_complete: reportTask ? reportTask.marked_complete : jobTask.is_completed,
            notes: reportTask ? reportTask.notes || '' : '',
          }
        })
        setTasks(initializedTasks)
      }
      
      setIsInitialized(true)
    }
  }, [report, job, isInitialized])

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.public_id === taskId
          ? { ...task, marked_complete: !task.marked_complete }
          : task
      )
    )
  }

  const handleSubmit = async () => {
    if (!jobId || !reportId) return

    if (!summary.trim()) {
      toast.show('Summary required', {
        message: 'Please add a summary of your work',
        native: false,
      })
      return
    }

    setIsSubmitting(true)
    try {
      const totalSeconds = workHours * 3600 + workMinutes * 60

      await updateReportMutation.mutateAsync({
        jobId,
        reportId,
        data: {
          summary: summary.trim(),
          total_work_duration_seconds: totalSeconds,
          tasks: tasks.map((task) => ({
            task_id: task.public_id,
            notes: task.notes || undefined,
            marked_complete: task.marked_complete,
          })),
        },
      })

      toast.show('Report updated', {
        message: 'Your daily report has been updated',
        native: false,
      })
      router.back()
    } catch (error: any) {
      toast.show('Failed to update report', {
        message: error?.message || 'Please try again',
        native: false,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!jobId || !reportId) {
    return (
      <GradientBackground>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text color="$error">Invalid parameters</Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (jobLoading || reportLoading) {
    return (
      <GradientBackground>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$md">
          <Spinner size="large" color="$primary" />
          <Text color="$colorSubtle">Loading report...</Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (reportError || !report) {
    return (
      <GradientBackground>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$md">
          <AlertCircle size={48} color="$error" />
          <Text color="$color" fontSize="$5" fontWeight="600">Report not found</Text>
          <Button mt="$sm" bg="$primary" borderRadius="$lg" px="$xl" onPress={() => router.back()}><Text color="white">Go Back</Text></Button>
        </YStack>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground>
      <YStack flex={1} pt={insets.top}>
        {/* Header */}
        <XStack px="$5" py="$4" alignItems="center" gap="$3">
          <Button
            unstyled
            onPress={() => router.back()}
            p="$2"
            hitSlop={12}
            pressStyle={{ opacity: 0.7 }}
          >
            <ArrowLeft size={22} color="$color" />
          </Button>
          <Text
            flex={1}
            fontSize={17}
            fontWeight="700"
            color="$color"
            textAlign="center"
          >
            Edit Daily Report
          </Text>
          <View width={38} />
        </XStack>

        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack px="$lg" pb="$2xl" gap="$lg">
            {/* Rejection Notice */}
            {report.status === 'rejected' && report.homeowner_comment && (
              <YStack bg="$errorBackground" borderRadius={16} p="$md" gap="$xs" borderWidth={1} borderColor="$error">
                <XStack alignItems="center" gap="$xs">
                  <AlertCircle size={14} color="$error" />
                  <Text fontSize="$2" fontWeight="700" color="$error">REVISION REQUIRED</Text>
                </XStack>
                <Text fontSize="$3" color="$color">Feedback: {report.homeowner_comment}</Text>
              </YStack>
            )}

            {/* Date Display */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
            >
              <Text fontSize="$2" color="$colorSubtle" mb="$xs">
                Report Date
              </Text>
              <Text fontSize="$4" fontWeight="600" color="$color">
                {new Date(report.report_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </YStack>

            {/* Work Duration */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$md"
            >
              <XStack alignItems="center" gap="$sm">
                <Clock size={18} color="$primary" />
                <Text fontSize="$4" fontWeight="600" color="$color">
                  Work Duration
                </Text>
              </XStack>

              <XStack justifyContent="center" alignItems="center" gap="$lg">
                {/* Hours */}
                <YStack alignItems="center" gap="$sm">
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
                    <Plus size={20} color="$primary" />
                  </Button>
                  <YStack alignItems="center">
                    <Text fontSize="$8" fontWeight="700" color="$color">
                      {workHours.toString().padStart(2, '0')}
                    </Text>
                    <Text fontSize="$2" color="$colorSubtle">
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
                    <Minus size={20} color="$colorSubtle" />
                  </Button>
                </YStack>

                <Text fontSize="$6" fontWeight="700" color="$colorSubtle">
                  :
                </Text>

                {/* Minutes */}
                <YStack alignItems="center" gap="$sm">
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
                    <Plus size={20} color="$primary" />
                  </Button>
                  <YStack alignItems="center">
                    <Text fontSize="$8" fontWeight="700" color="$color">
                      {workMinutes.toString().padStart(2, '0')}
                    </Text>
                    <Text fontSize="$2" color="$colorSubtle">
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
                    <Minus size={20} color="$colorSubtle" />
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
              <Text fontSize="$4" fontWeight="600" color="$color">
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
                <Text fontSize="$4" fontWeight="600" color="$color">
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
                      <XStack alignItems="center" gap="$md">
                        {task.marked_complete ? (
                          <CheckCircle2 size={22} color="$success" />
                        ) : (
                          <Circle size={22} color="$colorSubtle" />
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
                            <Text fontSize="$2" color="$colorSubtle" numberOfLines={1}>
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
          </YStack>
        </ScrollView>

        {/* Update Button */}
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
              <XStack alignItems="center" gap="$sm">
                <Spinner size="small" color="white" />
                <Text color="white" fontWeight="600">
                  Updating...
                </Text>
              </XStack>
            ) : (
              <XStack alignItems="center" gap="$sm">
                <Save size={18} color="white" />
                <Text color="white" fontWeight="600">
                  Update Report
                </Text>
              </XStack>
            )}
          </Button>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
