import { useLocalSearchParams } from 'expo-router'
import { ChatScreen } from 'app/features/common/chat-screen'

export default function HandymanChatPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <ChatScreen jobId={id} role="handyman" />
}
