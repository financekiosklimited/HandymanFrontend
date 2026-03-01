System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  let react_query_1
  let client_1
  let CHAT_TIMEOUT_MS
  let chatQueryKeys
  const __moduleName = context_1 && context_1.id
  // ========== Job Chat Hooks ==========
  /**
   * Hook to open/create job chat conversation.
   * GET /{role}/jobs/{job_id}/chat/
   */
  function useJobChat(role, jobId) {
    return react_query_1.useQuery({
      queryKey: chatQueryKeys.conversation(role, jobId),
      queryFn: async () => {
        const response = await client_1.apiClient.get(`${role}/jobs/${jobId}/chat/`).json()
        return response.data
      },
      enabled: !!jobId,
      staleTime: 1000 * 60, // 1 minute
    })
  }
  exports_1('useJobChat', useJobChat)
  /**
   * Hook to get unread count for a job's chat.
   * GET /{role}/jobs/{job_id}/chat/unread-count/
   */
  function useJobChatUnreadCount(role, jobId, enabled = true) {
    return react_query_1.useQuery({
      queryKey: chatQueryKeys.unreadCount(role, jobId),
      queryFn: async () => {
        const response = await client_1.apiClient
          .get(`${role}/jobs/${jobId}/chat/unread-count/`)
          .json()
        return response.data.unread_count
      },
      enabled: !!jobId && enabled,
      staleTime: 1000 * 120, // 2 minutes - match refetchInterval to prevent unnecessary refetches
      refetchInterval: 1000 * 120, // Refetch every 2 minutes for badge updates
    })
  }
  exports_1('useJobChatUnreadCount', useJobChatUnreadCount)
  // ========== General Chat Hooks ==========
  /**
   * Hook to list all general conversations.
   * GET /{role}/conversations/
   */
  function useConversationList(role, enabled = true) {
    return react_query_1.useQuery({
      queryKey: chatQueryKeys.conversationList(role),
      queryFn: async () => {
        const response = await client_1.apiClient
          .get(`${role}/conversations/`, { timeout: CHAT_TIMEOUT_MS })
          .json()
        return response.data
      },
      enabled,
      staleTime: 1000 * 60, // 1 minute
    })
  }
  exports_1('useConversationList', useConversationList)
  /**
   * Hook to get total unread count across all general chats.
   * GET /{role}/conversations/unread-count/
   */
  function useTotalUnreadCount(role, enabled = true) {
    return react_query_1.useQuery({
      queryKey: chatQueryKeys.totalUnread(role),
      queryFn: async () => {
        const response = await client_1.apiClient.get(`${role}/conversations/unread-count/`).json()
        return response.data.unread_count
      },
      enabled,
      staleTime: 1000 * 120, // 2 minutes - match refetchInterval to prevent unnecessary refetches
      refetchInterval: 1000 * 120, // Refetch every 2 minutes for badge updates
    })
  }
  exports_1('useTotalUnreadCount', useTotalUnreadCount)
  /**
   * Hook to open/create a general chat with a specific user.
   * GET /{role}/users/{user_id}/chat/
   */
  function useOpenUserChat(role, userId, enabled = true) {
    return react_query_1.useQuery({
      queryKey: chatQueryKeys.userChat(role, userId),
      queryFn: async () => {
        const response = await client_1.apiClient
          .get(`${role}/users/${userId}/chat/`, { timeout: CHAT_TIMEOUT_MS })
          .json()
        return response.data
      },
      enabled: !!userId && enabled,
      staleTime: 1000 * 60, // 1 minute
    })
  }
  exports_1('useOpenUserChat', useOpenUserChat)
  /**
   * Hook to get a general conversation by ID.
   * Uses the same endpoint structure but for general chats.
   */
  function useGeneralChat(role, conversationId) {
    return react_query_1.useQuery({
      queryKey: chatQueryKeys.generalConversation(role, conversationId || ''),
      queryFn: async () => {
        // For general chat, we need to fetch from the conversation itself
        // The conversation should already be in the list or opened via user chat
        const response = await client_1.apiClient.get(`${role}/conversations/`).json()
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
  exports_1('useGeneralChat', useGeneralChat)
  // ========== Shared Chat Hooks ==========
  /**
   * Hook to load chat messages with infinite scroll.
   * GET /{role}/conversations/{conv_id}/messages/
   */
  function useChatMessages(role, conversationId) {
    return react_query_1.useInfiniteQuery({
      queryKey: chatQueryKeys.messages(role, conversationId || ''),
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({ limit: '50' })
        if (pageParam) {
          params.set('before_id', pageParam)
        }
        const response = await client_1.apiClient
          .get(`${role}/conversations/${conversationId}/messages/`, {
            searchParams: params,
            timeout: CHAT_TIMEOUT_MS,
          })
          .json()
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
      initialPageParam: undefined,
    })
  }
  exports_1('useChatMessages', useChatMessages)
  /**
   * Hook to send a message.
   * POST /{role}/conversations/{conv_id}/messages/
   * Supports multipart/form-data for attachments (images/videos).
   * Uses indexed format: attachments[0].file, attachments[1].file, etc.
   */
  function useSendMessage(role) {
    const queryClient = react_query_1.useQueryClient()
    return react_query_1.useMutation({
      mutationFn: async ({ conversationId, content, attachments }) => {
        const formData = new FormData()
        if (content) {
          formData.append('content', content)
        }
        // Add attachments using indexed format
        if (attachments && attachments.length > 0) {
          attachments.forEach((attachment, index) => {
            // Main file
            formData.append(`attachments[${index}].file`, attachment.file)
            // Thumbnail for videos (required)
            if (attachment.thumbnail) {
              formData.append(`attachments[${index}].thumbnail`, attachment.thumbnail)
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
        const response = await client_1.apiClient
          .post(`${role}/conversations/${conversationId}/messages/`, {
            body: formData,
            headers: {
              // Let the browser set the Content-Type with boundary
              'Content-Type': undefined,
            },
            timeout: CHAT_TIMEOUT_MS,
          })
          .json()
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
  exports_1('useSendMessage', useSendMessage)
  /**
   * Hook to mark messages as read.
   * POST /{role}/conversations/{conv_id}/read/
   */
  function useMarkAsRead(role) {
    const queryClient = react_query_1.useQueryClient()
    return react_query_1.useMutation({
      mutationFn: async (conversationId) => {
        const response = await client_1.apiClient
          .post(`${role}/conversations/${conversationId}/read/`)
          .json()
        return response.data.messages_read
      },
      onSuccess: (messagesRead) => {
        // Only invalidate if messages were actually marked as read
        // This prevents unnecessary refetches when there are no unread messages
        if (messagesRead > 0) {
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === 'chat' &&
              (query.queryKey[1] === 'unread' ||
                query.queryKey[1] === 'totalUnread' ||
                query.queryKey[1] === 'list') &&
              query.queryKey[2] === role,
          })
        }
      },
    })
  }
  exports_1('useMarkAsRead', useMarkAsRead)
  return {
    setters: [
      (react_query_1_1) => {
        react_query_1 = react_query_1_1
      },
      (client_1_1) => {
        client_1 = client_1_1
      },
    ],
    execute: () => {
      // Extended timeout for chat operations that may involve conversation creation or large payloads
      exports_1('CHAT_TIMEOUT_MS', (CHAT_TIMEOUT_MS = 60000)) // 60 seconds
      // ========== Query Keys ==========
      exports_1(
        'chatQueryKeys',
        (chatQueryKeys = {
          // Job chat keys
          conversation: (role, jobId) => ['chat', 'conversation', role, jobId],
          messages: (role, conversationId) => ['chat', 'messages', role, conversationId],
          unreadCount: (role, jobId) => ['chat', 'unread', role, jobId],
          // General chat keys
          conversationList: (role) => ['chat', 'list', role],
          totalUnread: (role) => ['chat', 'totalUnread', role],
          userChat: (role, userId) => ['chat', 'user', role, userId],
          generalConversation: (role, conversationId) => ['chat', 'general', role, conversationId],
        })
      )
    },
  }
})
