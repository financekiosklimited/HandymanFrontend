import { HomeownerDirectOfferDetailScreen } from 'app/features/homeowner/direct-offers'
import { useLocalSearchParams } from 'expo-router'

export default function DirectOfferDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <HomeownerDirectOfferDetailScreen offerId={id!} />
}
