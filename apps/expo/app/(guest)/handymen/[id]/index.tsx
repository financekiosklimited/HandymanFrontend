import { Stack } from 'expo-router'
import { useLocalSearchParams } from 'expo-router'
import { HandymanDetailScreen } from 'app/features/guest/handymen'

export default function HandymanDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <HandymanDetailScreen handymanId={id} />
    </>
  )
}
