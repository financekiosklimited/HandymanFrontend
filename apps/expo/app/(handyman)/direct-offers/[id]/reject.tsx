import { HandymanDirectOfferRejectScreen } from 'app/features/handyman/direct-offers'
import { useLocalSearchParams } from 'expo-router'

export default function HandymanDirectOfferRejectRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <HandymanDirectOfferRejectScreen offerId={id!} />
}
