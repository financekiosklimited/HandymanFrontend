import { useLocalSearchParams } from 'expo-router'
import { HomeownerHandymanDetailScreen } from 'app/features/homeowner/handymen'

export default function HandymanDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) return null

  return <HomeownerHandymanDetailScreen handymanId={id} />
}
