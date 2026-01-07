import { useLocalSearchParams } from 'expo-router'
import { HandymanJobDetailScreen } from 'app/features/handyman'

export default function HandymanJobDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  
  if (!id) {
    return null
  }
  
  return <HandymanJobDetailScreen jobId={id} />
}
