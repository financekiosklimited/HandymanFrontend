import { Toast, useToastState } from '@tamagui/toast'
import { YStack } from 'tamagui'

export const NativeToast = () => {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) {
    return null
  }

  // Determine toast type based on title keywords
  const title = currentToast.title?.toLowerCase() || ''
  const isSuccess =
    title.includes('success') ||
    title.includes('submitted') ||
    title.includes('updated') ||
    title.includes('withdrawn') ||
    title.includes('verified') ||
    title.includes('sent')
  const isError = title.includes('error') || title.includes('failed') || title.includes('failure')

  // Get background color based on type
  const getBackgroundColor = () => {
    if (isSuccess) return '$successBackground'
    if (isError) return '$errorBackground'
    return '$backgroundStrong'
  }

  const getBorderColor = () => {
    if (isSuccess) return '$success'
    if (isError) return '$error'
    return '$borderColor'
  }

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
      <YStack
        py="$1.5"
        px="$2"
      >
        <Toast.Title lineHeight="$1">{currentToast.title}</Toast.Title>
        {!!currentToast.message && <Toast.Description>{currentToast.message}</Toast.Description>}
      </YStack>
    </Toast>
  )
}
