import { EditJobScreen } from 'app/features/homeowner/jobs/edit'
import { useLocalSearchParams } from 'expo-router'

export default function EditJobRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <EditJobScreen jobId={id!} />
}
