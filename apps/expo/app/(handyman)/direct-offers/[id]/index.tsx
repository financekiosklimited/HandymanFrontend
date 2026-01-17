import { HandymanDirectOfferDetailScreen } from 'app/features/handyman/direct-offers'
import { useLocalSearchParams } from 'expo-router'

export default function HandymanDirectOfferDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <HandymanDirectOfferDetailScreen offerId={id!} />
}
