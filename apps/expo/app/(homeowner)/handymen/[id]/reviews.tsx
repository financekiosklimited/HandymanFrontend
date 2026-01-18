import { useLocalSearchParams } from 'expo-router'
import { HandymanReviewsScreen } from 'app/features/homeowner/handymen'

export default function HandymanReviewsPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) return null

  return (
    <HandymanReviewsScreen
      handymanId={id}
      mode="homeowner"
    />
  )
}
