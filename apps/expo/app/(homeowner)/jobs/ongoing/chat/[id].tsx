import { useLocalSearchParams } from 'expo-router'
import { ChatScreen } from 'app/features/common/chat-screen'

export default function HomeownerChatPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return (
    <ChatScreen
      jobId={id}
      chatRole="homeowner"
    />
  )
}
