// Unified attachment types for multi-type file support (images, videos, documents)

import type { RNFile } from './handyman'

// ========== File Type Definitions ==========

export type AttachmentFileType = 'image' | 'video' | 'document'

// MIME type mappings for file type detection
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-m4v',
  'video/webm',
  'video/3gpp',
] as const

export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
] as const

// File extensions for document icons
export type DocumentExtension =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  | 'txt'
  | 'unknown'

// ========== API Response Types ==========

/**
 * Attachment as returned from the API
 * Used for displaying attachments in UI
 */
export interface Attachment {
  public_id: string
  file_url: string
  file_type: AttachmentFileType
  file_name: string
  file_size: number
  thumbnail_url: string | null
  duration_seconds: number | null
  order?: number
  created_at?: string
}

// ========== Upload Types ==========

/**
 * Single attachment for upload
 * For videos, thumbnail and duration_seconds are REQUIRED
 */
export interface AttachmentUpload {
  file: RNFile
  thumbnail?: RNFile // Required for videos
  duration_seconds?: number // Required for videos
}

/**
 * Local attachment state for UI before upload
 * Extends AttachmentUpload with additional UI state
 */
export interface LocalAttachment {
  id: string // Local unique ID (for React keys)
  file: RNFile
  file_type: AttachmentFileType
  file_name: string
  file_size: number
  thumbnail_uri?: string // Local URI for video thumbnails
  duration_seconds?: number // For videos
  upload_progress?: number // 0-100 upload progress
  is_uploading?: boolean
  error?: string
}

// ========== Utility Functions ==========

/**
 * Detect file type from MIME type
 */
export function getFileTypeFromMime(mimeType: string): AttachmentFileType {
  if (IMAGE_MIME_TYPES.includes(mimeType as any)) {
    return 'image'
  }
  if (VIDEO_MIME_TYPES.includes(mimeType as any)) {
    return 'video'
  }
  return 'document'
}

/**
 * Get document extension from filename or MIME type
 */
export function getDocumentExtension(fileName: string, mimeType?: string): DocumentExtension {
  const ext = fileName.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'pdf':
      return 'pdf'
    case 'doc':
      return 'doc'
    case 'docx':
      return 'docx'
    case 'xls':
      return 'xls'
    case 'xlsx':
      return 'xlsx'
    case 'ppt':
      return 'ppt'
    case 'pptx':
      return 'pptx'
    case 'txt':
      return 'txt'
    default:
      // Fallback to MIME type detection
      if (mimeType?.includes('pdf')) return 'pdf'
      if (mimeType?.includes('word')) return 'doc'
      if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'xls'
      if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return 'ppt'
      if (mimeType?.includes('text/plain')) return 'txt'
      return 'unknown'
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

/**
 * Format video duration for display
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Check if attachment is playable video
 */
export function isPlayableVideo(attachment: Attachment | LocalAttachment): boolean {
  return attachment.file_type === 'video'
}

/**
 * Check if attachment is viewable image
 */
export function isViewableImage(attachment: Attachment | LocalAttachment): boolean {
  return attachment.file_type === 'image'
}

/**
 * Check if attachment is downloadable document
 */
export function isDownloadableDocument(attachment: Attachment | LocalAttachment): boolean {
  return attachment.file_type === 'document'
}

// ========== Upload Limits ==========

export const ATTACHMENT_LIMITS = {
  chat: {
    maxCount: 5,
    allowedTypes: ['image', 'video'] as AttachmentFileType[],
  },
  job: {
    maxCount: 10,
    allowedTypes: ['image', 'video'] as AttachmentFileType[],
  },
  jobApplication: {
    maxCount: 10,
    allowedTypes: ['image', 'video', 'document'] as AttachmentFileType[],
  },
  reimbursement: {
    maxCount: 5,
    allowedTypes: ['image', 'video', 'document'] as AttachmentFileType[],
  },
} as const

export type AttachmentContext = keyof typeof ATTACHMENT_LIMITS
