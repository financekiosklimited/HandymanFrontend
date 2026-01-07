import { useLocalSearchParams } from 'expo-router'
import { ApplicationDetailScreen } from 'app/features/handyman/jobs/applied'

export default function ApplicationDetailPage() {
  const { id, jobId } = useLocalSearchParams<{ id: string; jobId: string }>()
  
  if (!id || !jobId) {
    return null
  }
  
  return <ApplicationDetailScreen applicationId={id} jobId={jobId} />
}
