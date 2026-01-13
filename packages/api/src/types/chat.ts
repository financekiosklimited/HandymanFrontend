// Chat types for Job Chat and General Chat features

import type { RNFile } from './handyman'

// Sender role for messages
export type ChatSenderRole = 'homeowner' | 'handyman'

// Message types
export type ChatMessageType = 'text' | 'image' | 'text_with_image'

// Chat conversation status
export type ChatConversationStatus = 'active'

// Conversation type
export type ChatConversationType = 'job' | 'general'

// Chat image attachment
export interface ChatImage {
  public_id: string
  image_url: string
  thumbnail_url: string
  order: number
}

// Single chat message
export interface ChatMessage {
  public_id: string
  sender_role: ChatSenderRole
  message_type: ChatMessageType
  content: string | null
  images: ChatImage[]
  is_read: boolean
  read_at: string | null
  created_at: string
}

// Job info in conversation
export interface ChatJobInfo {
  public_id: string
  title: string
  status: string
}

// User info in conversation
export interface ChatUserInfo {
  public_id: string
  display_name: string
  avatar_url: string | null
}

// Last message preview (for conversation list)
export interface ChatLastMessagePreview {
  content: string | null
  sender_role: ChatSenderRole
  message_type: ChatMessageType
  created_at: string
}

// Conversation detail (full, for job chat or when opening general chat)
export interface ChatConversation {
  public_id: string
  conversation_type: ChatConversationType
  job: ChatJobInfo | null
  homeowner: ChatUserInfo
  handyman: ChatUserInfo
  status: ChatConversationStatus
  homeowner_unread_count: number
  handyman_unread_count: number
  last_message_at: string | null
  created_at: string
}

// Conversation list item (for general chat list)
export interface GeneralConversationListItem {
  public_id: string
  conversation_type: 'general'
  job: null
  other_party: ChatUserInfo
  last_message: ChatLastMessagePreview | null
  unread_count: number
  status: ChatConversationStatus
  last_message_at: string | null
  created_at: string
}

// API Response types
export interface ChatConversationResponse {
  message: string
  data: ChatConversation
  errors: null
  meta: null
}

export interface ConversationListResponse {
  message: string
  data: GeneralConversationListItem[]
  errors: null
  meta: null
}

export interface TotalUnreadCountResponse {
  message: string
  data: {
    unread_count: number
  }
  errors: null
  meta: null
}

export interface ChatMessagesResponse {
  message: string
  data: ChatMessage[]
  errors: null
  meta: {
    has_more: boolean
  }
}

export interface SendMessageResponse {
  message: string
  data: ChatMessage
  errors: null
  meta: null
}

export interface MarkAsReadResponse {
  message: string
  data: {
    messages_read: number
  }
  errors: null
  meta: null
}

export interface ChatUnreadCountResponse {
  message: string
  data: {
    unread_count: number
  }
  errors: null
  meta: null
}

// Request types
export interface SendMessageRequest {
  content?: string
  images?: RNFile[]
}
