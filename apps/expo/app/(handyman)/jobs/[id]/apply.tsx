import { useLocalSearchParams } from 'expo-router'
import { ApplyFormScreen } from 'app/features/handyman/jobs/apply-form-screen'

export default function ApplyPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <ApplyFormScreen jobId={id} />
}
