'use client'

import { Linking, StyleSheet } from 'react-native'
import { YStack, XStack, Text, Button, View } from 'tamagui'
import { FileText, FileSpreadsheet, File, ExternalLink } from '@tamagui/lucide-icons'

// Document extension type
type DocumentExtension =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  | 'txt'
  | 'unknown'

// Helper to get document extension
function getDocumentExtension(fileName: string, mimeType?: string): DocumentExtension {
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

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

// Document type colors
const DOCUMENT_COLORS: Record<DocumentExtension, string> = {
  pdf: '#E53935', // Red for PDF
  doc: '#1976D2', // Blue for Word
  docx: '#1976D2',
  xls: '#2E7D32', // Green for Excel
  xlsx: '#2E7D32',
  ppt: '#F57C00', // Orange for PowerPoint
  pptx: '#F57C00',
  txt: '#757575', // Gray for text
  unknown: '#9E9E9E',
}

// Document type labels
const DOCUMENT_LABELS: Record<DocumentExtension, string> = {
  pdf: 'PDF',
  doc: 'DOC',
  docx: 'DOCX',
  xls: 'XLS',
  xlsx: 'XLSX',
  ppt: 'PPT',
  pptx: 'PPTX',
  txt: 'TXT',
  unknown: 'FILE',
}

interface DocumentThumbnailProps {
  /** File URL for downloading/opening */
  fileUrl: string
  /** File name to display */
  fileName: string
  /** File size in bytes (optional) */
  fileSize?: number
  /** MIME type for fallback extension detection */
  mimeType?: string
  /** Width of the thumbnail */
  width?: number
  /** Height of the thumbnail */
  height?: number
  /** Border radius */
  borderRadius?: number
  /** Show file size */
  showFileSize?: boolean
  /** Show download button */
  showDownload?: boolean
  /** Compact mode (icon only with badge) */
  compact?: boolean
  /** Custom onPress handler - if not provided, opens URL in browser */
  onPress?: () => void
}

/**
 * Document thumbnail component that displays a file icon with type badge.
 * Tapping opens the document in the system browser for download.
 */
export function DocumentThumbnail({
  fileUrl,
  fileName,
  fileSize,
  mimeType,
  width = 100,
  height = 100,
  borderRadius = 8,
  showFileSize = true,
  showDownload = false,
  compact = false,
  onPress,
}: DocumentThumbnailProps) {
  const extension = getDocumentExtension(fileName, mimeType)
  const color = DOCUMENT_COLORS[extension]
  const label = DOCUMENT_LABELS[extension]

  // Truncate filename for display
  const displayName =
    fileName.length > 20 ? `${fileName.substring(0, 17)}...${fileName.split('.').pop()}` : fileName

  const handlePress = async () => {
    if (onPress) {
      onPress()
      return
    }

    try {
      const supported = await Linking.canOpenURL(fileUrl)
      if (supported) {
        await Linking.openURL(fileUrl)
      } else {
        console.warn('Cannot open URL:', fileUrl)
      }
    } catch (error) {
      console.error('Error opening document:', error)
    }
  }

  // Get the appropriate icon based on file type
  const IconComponent = () => {
    const iconSize = compact ? 24 : 32

    switch (extension) {
      case 'xls':
      case 'xlsx':
        return (
          <FileSpreadsheet
            size={iconSize}
            // @ts-expect-error - dynamic color from document type
            color={color}
          />
        )
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return (
          <FileText
            size={iconSize}
            // @ts-expect-error - dynamic color from document type
            color={color}
          />
        )
      default:
        return (
          <File
            size={iconSize}
            // @ts-expect-error - dynamic color from document type
            color={color}
          />
        )
    }
  }

  if (compact) {
    // Compact mode - just icon with type badge
    return (
      <Button
        unstyled
        onPress={handlePress}
        pressStyle={{ opacity: 0.8 }}
      >
        <View
          width={width}
          height={height}
          borderRadius={borderRadius}
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
          justifyContent="center"
          alignItems="center"
        >
          <IconComponent />

          {/* Type badge */}
          <View
            position="absolute"
            bottom={4}
            right={4}
            px="$1"
            py={2}
            borderRadius={4}
            style={{ backgroundColor: color }}
          >
            <Text
              color="white"
              fontSize={8}
              fontWeight="700"
            >
              {label}
            </Text>
          </View>
        </View>
      </Button>
    )
  }

  // Full mode - icon, filename, size, and optional download button
  return (
    <Button
      unstyled
      onPress={handlePress}
      pressStyle={{ opacity: 0.8 }}
    >
      <View
        width={width}
        minHeight={height}
        borderRadius={borderRadius}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$2"
        gap="$1"
      >
        {/* Icon and type badge row */}
        <XStack
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <View
            padding="$2"
            borderRadius="$2"
            style={{ backgroundColor: `${color}15` }}
          >
            <IconComponent />
          </View>

          {/* Type badge */}
          <View
            px="$2"
            py="$1"
            borderRadius="$2"
            style={{ backgroundColor: color }}
          >
            <Text
              color="white"
              fontSize={10}
              fontWeight="700"
            >
              {label}
            </Text>
          </View>
        </XStack>

        {/* File name */}
        <Text
          fontSize="$2"
          fontWeight="500"
          color="$color"
          numberOfLines={2}
        >
          {displayName}
        </Text>

        {/* File size and download */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
        >
          {showFileSize && fileSize ? (
            <Text
              fontSize="$1"
              color="$colorSubtle"
            >
              {formatFileSize(fileSize)}
            </Text>
          ) : (
            <View />
          )}

          {showDownload && (
            <XStack
              alignItems="center"
              gap="$1"
            >
              <ExternalLink
                size={12}
                color="$blue10"
              />
              <Text
                fontSize="$1"
                color="$blue10"
              >
                Open
              </Text>
            </XStack>
          )}
        </XStack>
      </View>
    </Button>
  )
}

/**
 * Inline document link - shows as a clickable text link with icon
 */
interface DocumentLinkProps {
  fileUrl: string
  fileName: string
  fileSize?: number
  mimeType?: string
}

export function DocumentLink({ fileUrl, fileName, fileSize, mimeType }: DocumentLinkProps) {
  const extension = getDocumentExtension(fileName, mimeType)
  const color = DOCUMENT_COLORS[extension]

  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(fileUrl)
      if (supported) {
        await Linking.openURL(fileUrl)
      }
    } catch (error) {
      console.error('Error opening document:', error)
    }
  }

  // Truncate filename for display
  const displayName = fileName.length > 30 ? `${fileName.substring(0, 27)}...` : fileName

  return (
    <Button
      unstyled
      onPress={handlePress}
      pressStyle={{ opacity: 0.7 }}
    >
      <XStack
        alignItems="center"
        gap="$2"
        backgroundColor="$backgroundHover"
        px="$3"
        py="$2"
        borderRadius="$2"
      >
        <FileText
          size={16}
          // @ts-expect-error - dynamic color from document type
          color={color}
        />
        <YStack flex={1}>
          <Text
            fontSize="$3"
            fontWeight="500"
            color="$blue10"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {fileSize && (
            <Text
              fontSize="$1"
              color="$colorSubtle"
            >
              {formatFileSize(fileSize)}
            </Text>
          )}
        </YStack>
        <ExternalLink
          size={14}
          color="$colorSubtle"
        />
      </XStack>
    </Button>
  )
}
