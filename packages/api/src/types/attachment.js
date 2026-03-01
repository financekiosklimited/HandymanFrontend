// Unified attachment types for multi-type file support (images, videos, documents)
System.register([], (exports_1, context_1) => {
  let IMAGE_MIME_TYPES
  let VIDEO_MIME_TYPES
  let DOCUMENT_MIME_TYPES
  let UNSUPPORTED_IMAGE_EXTENSIONS
  let UNSUPPORTED_IMAGE_MIME_TYPES
  let ATTACHMENT_LIMITS
  const __moduleName = context_1 && context_1.id
  /**
   * Check if a file is an unsupported RAW image format
   */
  function isUnsupportedImageFormat(fileName, mimeType) {
    // Check by extension
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext && UNSUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
      return true
    }
    // Check by MIME type
    if (mimeType && UNSUPPORTED_IMAGE_MIME_TYPES.some((t) => mimeType.toLowerCase().includes(t))) {
      return true
    }
    return false
  }
  exports_1('isUnsupportedImageFormat', isUnsupportedImageFormat)
  // ========== Utility Functions ==========
  /**
   * Detect file type from MIME type
   */
  function getFileTypeFromMime(mimeType) {
    if (IMAGE_MIME_TYPES.includes(mimeType)) {
      return 'image'
    }
    if (VIDEO_MIME_TYPES.includes(mimeType)) {
      return 'video'
    }
    return 'document'
  }
  exports_1('getFileTypeFromMime', getFileTypeFromMime)
  /**
   * Get document extension from filename or MIME type
   */
  function getDocumentExtension(fileName, mimeType) {
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
  exports_1('getDocumentExtension', getDocumentExtension)
  /**
   * Format file size for display
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
  }
  exports_1('formatFileSize', formatFileSize)
  /**
   * Format video duration for display
   */
  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  exports_1('formatDuration', formatDuration)
  /**
   * Check if attachment is playable video
   */
  function isPlayableVideo(attachment) {
    return attachment.file_type === 'video'
  }
  exports_1('isPlayableVideo', isPlayableVideo)
  /**
   * Check if attachment is viewable image
   */
  function isViewableImage(attachment) {
    return attachment.file_type === 'image'
  }
  exports_1('isViewableImage', isViewableImage)
  /**
   * Check if attachment is downloadable document
   */
  function isDownloadableDocument(attachment) {
    return attachment.file_type === 'document'
  }
  exports_1('isDownloadableDocument', isDownloadableDocument)
  return {
    setters: [],
    execute: () => {
      // Unified attachment types for multi-type file support (images, videos, documents)
      // MIME type mappings for file type detection
      exports_1(
        'IMAGE_MIME_TYPES',
        (IMAGE_MIME_TYPES = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/heic',
          'image/heif',
        ])
      )
      exports_1(
        'VIDEO_MIME_TYPES',
        (VIDEO_MIME_TYPES = [
          'video/mp4',
          'video/quicktime',
          'video/x-m4v',
          'video/webm',
          'video/3gpp',
        ])
      )
      exports_1(
        'DOCUMENT_MIME_TYPES',
        (DOCUMENT_MIME_TYPES = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
        ])
      )
      // Unsupported RAW image formats (DNG, CR2, NEF, ARW, etc.)
      exports_1(
        'UNSUPPORTED_IMAGE_EXTENSIONS',
        (UNSUPPORTED_IMAGE_EXTENSIONS = [
          'dng', // Adobe Digital Negative
          'raw', // Generic RAW
          'cr2', // Canon RAW 2
          'cr3', // Canon RAW 3
          'nef', // Nikon Electronic Format
          'arw', // Sony Alpha RAW
          'orf', // Olympus RAW Format
          'rw2', // Panasonic RAW
          'pef', // Pentax Electronic Format
          'raf', // Fujifilm RAW
          'srw', // Samsung RAW
        ])
      )
      exports_1(
        'UNSUPPORTED_IMAGE_MIME_TYPES',
        (UNSUPPORTED_IMAGE_MIME_TYPES = [
          'image/x-adobe-dng',
          'image/x-dcraw',
          'image/x-canon-cr2',
          'image/x-canon-cr3',
          'image/x-nikon-nef',
          'image/x-sony-arw',
          'image/x-olympus-orf',
          'image/x-panasonic-rw2',
          'image/x-pentax-pef',
          'image/x-fuji-raf',
          'image/x-samsung-srw',
        ])
      )
      // ========== Upload Limits ==========
      exports_1(
        'ATTACHMENT_LIMITS',
        (ATTACHMENT_LIMITS = {
          chat: {
            maxCount: 5,
            allowedTypes: ['image', 'video'],
          },
          job: {
            maxCount: 10,
            allowedTypes: ['image', 'video'],
          },
          jobApplication: {
            maxCount: 10,
            allowedTypes: ['image', 'video', 'document'],
          },
          reimbursement: {
            maxCount: 5,
            allowedTypes: ['image', 'video', 'document'],
          },
        })
      )
    },
  }
})
