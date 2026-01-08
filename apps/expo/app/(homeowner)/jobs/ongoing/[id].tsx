import { useLocalSearchParams } from 'expo-router'
import { HomeownerJobDashboard } from 'app/features/homeowner/jobs/ongoing-dashboard'

export default function OngoingJobPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  
  if (!id) {
    return null
  }
  
  return <HomeownerJobDashboard jobId={id} />
}
