import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type {
  ChatConversation,
  ChatMessage,
  ChatConversationResponse,
  ChatMessagesResponse,
  SendMessageResponse,
  MarkAsReadResponse,
  ChatUnreadCountResponse,
  GeneralConversationListItem,
  ConversationListResponse,
  TotalUnreadCountResponse,
} from '../../types/chat'
import type { RNFile } from '../../types/handyman'
import type { AttachmentUpload } from '../../types/attachment'

type ChatRole = 'homeowner' | 'handyman'

// ========== Query Keys ==========
export const chatQueryKeys = {
  // Job chat keys
  conversation: (role: ChatRole, jobId: string) => ['chat', 'conversation', role, jobId] as const,
  messages: (role: ChatRole, conversationId: string) =>
    ['chat', 'messages', role, conversationId] as const,
  unreadCount: (role: ChatRole, jobId: string) => ['chat', 'unread', role, jobId] as const,
  // General chat keys
  conversationList: (role: ChatRole) => ['chat', 'list', role] as const,
  totalUnread: (role: ChatRole) => ['chat', 'totalUnread', role] as const,
  userChat: (role: ChatRole, userId: string) => ['chat', 'user', role, userId] as const,
  generalConversation: (role: ChatRole, conversationId: string) =>
    ['chat', 'general', role, conversationId] as const,
}

// ========== Job Chat Hooks ==========

/**
 * Hook to open/create job chat conversation.
 * GET /{role}/jobs/{job_id}/chat/
 */
export function useJobChat(role: ChatRole, jobId: string) {
  return useQuery({
    queryKey: chatQueryKeys.conversation(role, jobId),
    queryFn: async (): Promise<ChatConversation> => {
      const response = await apiClient
        .get(`${role}/jobs/${jobId}/chat/`)
        .json<ChatConversationResponse>()
      return response.data
    },
    enabled: !!jobId,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Hook to get unread count for a job's chat.
 * GET /{role}/jobs/{job_id}/chat/unread-count/
 */
export function useJobChatUnreadCount(role: ChatRole, jobId: string, enabled = true) {
  return useQuery({
    queryKey: chatQueryKeys.unreadCount(role, jobId),
    queryFn: async (): Promise<number> => {
      const response = await apiClient
        .get(`${role}/jobs/${jobId}/chat/unread-count/`)
        .json<ChatUnreadCountResponse>()
      return response.data.unread_count
    },
    enabled: !!jobId && enabled,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute for badge updates
  })
}

// ========== General Chat Hooks ==========

/**
 * Hook to list all general conversations.
 * GET /{role}/conversations/
 */
export function useConversationList(role: ChatRole) {
  return useQuery({
    queryKey: chatQueryKeys.conversationList(role),
    queryFn: async (): Promise<GeneralConversationListItem[]> => {
      const response = await apiClient
        .get(`${role}/conversations/`)
        .json<ConversationListResponse>()
      return response.data
    },
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to get total unread count across all general chats.
 * GET /{role}/conversations/unread-count/
 */
export function useTotalUnreadCount(role: ChatRole, enabled = true) {
  return useQuery({
    queryKey: chatQueryKeys.totalUnread(role),
    queryFn: async (): Promise<number> => {
      const response = await apiClient
        .get(`${role}/conversations/unread-count/`)
        .json<TotalUnreadCountResponse>()
      return response.data.unread_count
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute for badge updates
  })
}

/**
 * Hook to open/create a general chat with a specific user.
 * GET /{role}/users/{user_id}/chat/
 */
export function useOpenUserChat(role: ChatRole, userId: string, enabled = true) {
  return useQuery({
    queryKey: chatQueryKeys.userChat(role, userId),
    queryFn: async (): Promise<ChatConversation> => {
      const response = await apiClient
        .get(`${role}/users/${userId}/chat/`)
        .json<ChatConversationResponse>()
      return response.data
    },
    enabled: !!userId && enabled,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Hook to get a general conversation by ID.
 * Uses the same endpoint structure but for general chats.
 */
export function useGeneralChat(role: ChatRole, conversationId: string | undefined) {
  return useQuery({
    queryKey: chatQueryKeys.generalConversation(role, conversationId || ''),
    queryFn: async (): Promise<ChatConversation> => {
      // For general chat, we need to fetch from the conversation itself
      // The conversation should already be in the list or opened via user chat
      const response = await apiClient
        .get(`${role}/conversations/`)
        .json<ConversationListResponse>()
      const conv = response.data.find((c) => c.public_id === conversationId)
      if (!conv) {
        throw new Error('Conversation not found')
      }
      // Convert list item to full conversation format
      return {
        public_id: conv.public_id,
        conversation_type: 'general',
        job: null,
        homeowner:
          role === 'homeowner'
            ? { public_id: '', display_name: '', avatar_url: null }
            : conv.other_party,
        handyman:
          role === 'handyman'
            ? { public_id: '', display_name: '', avatar_url: null }
            : conv.other_party,
        status: conv.status,
        homeowner_unread_count: role === 'homeowner' ? conv.unread_count : 0,
        handyman_unread_count: role === 'handyman' ? conv.unread_count : 0,
        last_message_at: conv.last_message_at,
        created_at: conv.created_at,
      }
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60, // 1 minute
  })
}

// ========== Shared Chat Hooks ==========

/**
 * Hook to load chat messages with infinite scroll.
 * GET /{role}/conversations/{conv_id}/messages/
 */
export function useChatMessages(role: ChatRole, conversationId: string | undefined) {
  return useInfiniteQuery({
    queryKey: chatQueryKeys.messages(role, conversationId || ''),
    queryFn: async ({ pageParam }): Promise<{ messages: ChatMessage[]; hasMore: boolean }> => {
      const params = new URLSearchParams({ limit: '50' })
      if (pageParam) {
        params.set('before_id', pageParam)
      }

      const response = await apiClient
        .get(`${role}/conversations/${conversationId}/messages/`, { searchParams: params })
        .json<ChatMessagesResponse>()

      return {
        messages: response.data,
        hasMore: response.meta?.has_more ?? false,
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.messages.length === 0) return undefined
      // Get the oldest message ID for cursor-based pagination
      return lastPage.messages[0]?.public_id
    },
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
    initialPageParam: undefined as string | undefined,
  })
}

/**
 * Hook to send a message.
 * POST /{role}/conversations/{conv_id}/messages/
 * Supports multipart/form-data for attachments (images/videos).
 * Uses indexed format: attachments[0].file, attachments[1].file, etc.
 */
export function useSendMessage(role: ChatRole) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      attachments,
    }: {
      conversationId: string
      content?: string
      attachments?: AttachmentUpload[]
    }): Promise<ChatMessage> => {
      const formData = new FormData()

      if (content) {
        formData.append('content', content)
      }

      // Add attachments using indexed format
      if (attachments && attachments.length > 0) {
        attachments.forEach((attachment, index) => {
          // Main file
          formData.append(`attachments[${index}].file`, attachment.file as any)

          // Thumbnail for videos (required)
          if (attachment.thumbnail) {
            formData.append(`attachments[${index}].thumbnail`, attachment.thumbnail as any)
          }

          // Duration for videos (required)
          if (attachment.duration_seconds !== undefined) {
            formData.append(
              `attachments[${index}].duration_seconds`,
              attachment.duration_seconds.toString()
            )
          }
        })
      }

      const response = await apiClient
        .post(`${role}/conversations/${conversationId}/messages/`, {
          body: formData,
          headers: {
            // Let the browser set the Content-Type with boundary
            'Content-Type': undefined as any,
          },
        })
        .json<SendMessageResponse>()

      return response.data
    },
    onSuccess: (newMessage, { conversationId }) => {
      // Invalidate messages to refetch
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(role, conversationId),
      })
      // Also invalidate conversation list to update last_message
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversationList(role),
      })
    },
  })
}

/**
 * Hook to mark messages as read.
 * POST /{role}/conversations/{conv_id}/read/
 */
export function useMarkAsRead(role: ChatRole) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId: string): Promise<number> => {
      const response = await apiClient
        .post(`${role}/conversations/${conversationId}/read/`)
        .json<MarkAsReadResponse>()
      return response.data.messages_read
    },
    onSuccess: (_, conversationId) => {
      // Invalidate unread counts
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'chat' &&
          (query.queryKey[1] === 'unread' ||
            query.queryKey[1] === 'totalUnread' ||
            query.queryKey[1] === 'list') &&
          query.queryKey[2] === role,
      })
    },
  })
}
