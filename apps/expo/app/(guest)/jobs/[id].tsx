import { Stack } from 'expo-router'
import { useLocalSearchParams } from 'expo-router'
import { JobDetailScreen } from 'app/features/guest/jobs'

export default function JobDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <JobDetailScreen jobId={id} />
    </>
  )
}
