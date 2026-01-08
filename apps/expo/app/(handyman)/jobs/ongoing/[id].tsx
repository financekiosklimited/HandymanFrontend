import { useLocalSearchParams } from 'expo-router'
import { OngoingJobDashboard } from 'app/features/handyman/jobs/ongoing-dashboard'

export default function OngoingJobPage() {
  const { id, applicationId } = useLocalSearchParams<{ id: string; applicationId?: string }>()
  
  if (!id) {
    return null
  }
  
  return <OngoingJobDashboard jobId={id} applicationId={applicationId} />
}
