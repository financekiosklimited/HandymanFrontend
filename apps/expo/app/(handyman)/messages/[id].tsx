import { useLocalSearchParams } from 'expo-router'
import { GeneralChatScreen } from 'app/features/common'

export default function ChatScreen() {
  const { id, userId, name, avatar } = useLocalSearchParams<{
    id: string
    userId?: string
    name?: string
    avatar?: string
  }>()

  if (!id) return null

  return (
    <GeneralChatScreen
      conversationId={id === 'new' ? undefined : id}
      recipientId={userId}
      recipientName={name}
      recipientAvatar={avatar}
      userRole="handyman"
    />
  )
}
