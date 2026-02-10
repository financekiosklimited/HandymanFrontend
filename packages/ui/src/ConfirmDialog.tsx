import { useState, useCallback } from 'react'
import { Dialog, YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { AlertTriangle, Trash2 } from '@tamagui/lucide-icons'

type DialogType = 'confirm' | 'destructive'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  type?: DialogType
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  type = 'confirm',
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const isDestructive = type === 'destructive'
  const defaultConfirmText = isDestructive ? 'Delete' : 'Confirm'

  const handleConfirm = useCallback(async () => {
    await onConfirm()
  }, [onConfirm])

  const handleCancel = useCallback(() => {
    onCancel?.()
    onOpenChange(false)
  }, [onCancel, onOpenChange])

  return (
    <Dialog
      modal
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="rgba(0, 0, 0, 0.5)"
          flex={1}
        />
        <Dialog.Content
          animation={[
            'lazy',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: 20, opacity: 0, scale: 0.95 }}
          exitStyle={{ x: 0, y: -20, opacity: 0, scale: 0.95 }}
          y={0}
          x={0}
          scale={1}
          opacity={1}
          backgroundColor="$backgroundStrong"
          borderRadius="$2xl"
          padding="$xl"
          width="90%"
          maxWidth={360}
          alignSelf="center"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.15}
          shadowRadius={20}
          elevate
        >
          <YStack
            gap="$lg"
            alignItems="center"
          >
            {/* Icon for destructive actions */}
            {isDestructive && (
              <YStack
                width={56}
                height={56}
                borderRadius="$full"
                backgroundColor="$errorBackground"
                alignItems="center"
                justifyContent="center"
              >
                <Trash2
                  size={28}
                  color="$error"
                />
              </YStack>
            )}

            {/* Warning icon for confirm actions */}
            {!isDestructive && (
              <YStack
                width={56}
                height={56}
                borderRadius="$full"
                backgroundColor="$warningBackground"
                alignItems="center"
                justifyContent="center"
              >
                <AlertTriangle
                  size={28}
                  color="$warning"
                />
              </YStack>
            )}

            {/* Title */}
            <Text
              fontSize="$9"
              fontWeight="700"
              color="$color"
              textAlign="center"
            >
              {title}
            </Text>

            {/* Description */}
            {description && (
              <Text
                fontSize="$4"
                color="$colorSubtle"
                textAlign="center"
                lineHeight={22}
              >
                {description}
              </Text>
            )}

            {/* Action Buttons */}
            <XStack
              gap="$md"
              width="100%"
              marginTop="$sm"
            >
              <Button
                flex={1}
                size="$4"
                backgroundColor="$backgroundMuted"
                color="$color"
                fontWeight="600"
                borderRadius="$xl"
                pressStyle={{ scale: 0.98, backgroundColor: '$backgroundSubtle' }}
                onPress={handleCancel}
                disabled={isLoading}
              >
                {cancelText}
              </Button>

              <Button
                flex={1}
                size="$4"
                backgroundColor={isDestructive ? '$error' : '$primary'}
                color="$white"
                fontWeight="600"
                borderRadius="$xl"
                pressStyle={{
                  scale: 0.98,
                  backgroundColor: isDestructive ? '$error' : '$primary',
                  opacity: 0.9,
                }}
                onPress={handleConfirm}
                disabled={isLoading}
                icon={
                  isLoading ? (
                    <Spinner
                      color="$white"
                      size="small"
                    />
                  ) : undefined
                }
              >
                {isLoading ? '' : confirmText || defaultConfirmText}
              </Button>
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}

// Hook for imperative usage
interface ShowConfirmOptions {
  title: string
  description?: string
  type?: DialogType
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

interface UseConfirmDialogReturn {
  showConfirm: (options: ShowConfirmOptions) => void
  ConfirmDialogWrapper: React.FC
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<ShowConfirmOptions | null>(null)

  const showConfirm = useCallback((newOptions: ShowConfirmOptions) => {
    setOptions(newOptions)
    setIsOpen(true)
    setIsLoading(false)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!options) return

    setIsLoading(true)
    try {
      await options.onConfirm()
      setIsOpen(false)
    } catch (error) {
      // Keep dialog open on error, let caller handle error display
      console.error('Confirm dialog action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const handleCancel = useCallback(() => {
    options?.onCancel?.()
    setIsOpen(false)
  }, [options])

  const ConfirmDialogWrapper = useCallback(() => {
    if (!options) return null

    return (
      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={options.title}
        description={options.description}
        type={options.type}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    )
  }, [isOpen, options, isLoading, handleConfirm, handleCancel])

  return {
    showConfirm,
    ConfirmDialogWrapper,
  }
}
