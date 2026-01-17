import { useLocalSearchParams } from 'expo-router'
import { GeneralChatScreen } from 'app/features/common'

export default function ChatScreen() {
  const { id, userId, name, avatar, otherPartyName, otherPartyAvatar } = useLocalSearchParams<{
    id: string
    userId?: string
    name?: string
    avatar?: string
    otherPartyName?: string
    otherPartyAvatar?: string
  }>()

  if (!id) return null

  return (
    <GeneralChatScreen
      conversationId={id === 'new' ? undefined : id}
      recipientId={userId}
      recipientName={name}
      recipientAvatar={avatar}
      otherPartyName={otherPartyName}
      otherPartyAvatar={otherPartyAvatar}
      userRole="homeowner"
    />
  )
}
