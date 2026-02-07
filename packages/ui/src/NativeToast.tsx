import { Toast, useToastState } from '@tamagui/toast'
import { YStack, XStack } from 'tamagui'
import {
  CheckCircle2,
  Pencil,
  Trash2,
  Send,
  XCircle,
  Globe,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  DollarSign,
  X,
  Award,
  AlertTriangle,
  User,
  WifiOff,
  AlertCircle,
  FormInput,
  Upload,
  Loader,
  Lock,
  Timer,
  RefreshCw,
  Briefcase,
  MessageCircle,
  Info,
  Sparkles,
  Paperclip,
  BarChart,
  Target,
  Users,
} from '@tamagui/lucide-icons'
import type { ToastIcon } from 'app/utils/toast-messages'

// Map icon names to components
const iconComponents: Record<ToastIcon, React.ComponentType<any>> = {
  CheckCircle2,
  Pencil,
  Trash2,
  Send,
  XCircle,
  Globe,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  DollarSign,
  X,
  Award,
  AlertTriangle,
  User,
  WifiOff,
  AlertCircle,
  FormInput,
  Upload,
  Loader,
  Lock,
  Timer,
  RefreshCw,
  Briefcase,
  MessageCircle,
  Info,
  Sparkles,
  Paperclip,
  BarChart,
  Target,
  Users,
}

export const NativeToast = () => {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) {
    return null
  }

  // Get variant and icon from customData
  const variant =
    (currentToast.customData?.variant as 'success' | 'error' | 'warning' | 'info') || 'info'
  const iconName = currentToast.customData?.icon as ToastIcon | undefined

  // Determine toast styling based on variant
  const isSuccess = variant === 'success'
  const isError = variant === 'error'
  const isWarning = variant === 'warning'

  // Get background color based on type
  const getBackgroundColor = () => {
    if (isSuccess) return '$successBackground'
    if (isError) return '$errorBackground'
    if (isWarning) return '$warningBackground'
    return '$backgroundStrong'
  }

  const getBorderColor = () => {
    if (isSuccess) return '$success'
    if (isError) return '$error'
    if (isWarning) return '$warning'
    return '$borderColor'
  }

  const getIconColor = () => {
    if (isSuccess) return '$success'
    if (isError) return '$error'
    if (isWarning) return '$warning'
    return '$primary'
  }

  // Get icon component
  const IconComponent = iconName ? iconComponents[iconName] : null

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      viewportName={currentToast.viewportName}
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={0}
      opacity={1}
      scale={1}
      animation="quick"
      bg={getBackgroundColor()}
      borderWidth={1}
      borderColor={getBorderColor()}
      borderRadius="$3"
      maxWidth={360}
      width="85%"
      alignSelf="center"
    >
      <XStack
        py="$2"
        px="$3"
        gap="$2"
        alignItems="flex-start"
      >
        {IconComponent && (
          <YStack pt="$0.5">
            <IconComponent
              size={20}
              color={getIconColor()}
            />
          </YStack>
        )}
        <YStack
          flex={1}
          gap="$1"
        >
          <Toast.Title
            lineHeight="$1"
            fontWeight="600"
          >
            {currentToast.title}
          </Toast.Title>
          {!!currentToast.message && (
            <Toast.Description
              fontSize="$2"
              opacity={0.9}
            >
              {currentToast.message}
            </Toast.Description>
          )}
        </YStack>
      </XStack>
    </Toast>
  )
}
