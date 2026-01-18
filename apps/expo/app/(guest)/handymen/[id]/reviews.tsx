import { useLocalSearchParams } from 'expo-router'
import { HandymanReviewsScreen } from 'app/features/homeowner/handymen'

export default function GuestHandymanReviewsPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) return null

  return (
    <HandymanReviewsScreen
      handymanId={id}
      mode="guest"
    />
  )
}
