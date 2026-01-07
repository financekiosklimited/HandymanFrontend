import { HomeownerJobDetailScreen } from 'app/features/homeowner/jobs'
import { useLocalSearchParams } from 'expo-router'

export default function JobDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <HomeownerJobDetailScreen jobId={id!} />
}
