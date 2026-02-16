import { useState, useCallback } from 'react'
import { Dialog, YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { AlertTriangle, Trash2, Check, X } from '@tamagui/lucide-icons'
import { PRIMARY_BUTTON_PRESS, SECONDARY_BUTTON_PRESS } from './pressAnimations'

type DialogType = 'confirm' | 'destructive' | 'success'

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
  const isSuccess = type === 'success'
  const defaultConfirmText = isDestructive ? 'Delete' : isSuccess ? 'Confirm' : 'Confirm'

  const handleConfirm = useCallback(async () => {
    await onConfirm()
  }, [onConfirm])

  const handleCancel = useCallback(() => {
    onCancel?.()
    onOpenChange(false)
  }, [onCancel, onOpenChange])

  const getIconConfig = () => {
    if (isDestructive) {
      return {
        backgroundColor: '#FEE2E2',
        icon: Trash2,
        iconColor: '#DC2626',
      }
    }
    if (isSuccess) {
      return {
        backgroundColor: 'rgba(12, 154, 92, 0.1)',
        icon: Check,
        iconColor: '#0C9A5C',
      }
    }
    return {
      backgroundColor: '#FEF3C7',
      icon: AlertTriangle,
      iconColor: '#F59E0B',
    }
  }

  const iconConfig = getIconConfig()
  const IconComponent = iconConfig.icon

  return (
    <Dialog
      modal
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          key="confirm-dialog-overlay"
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="rgba(40, 42, 55, 0.6)"
          flex={1}
        />
        <Dialog.Content
          key="confirm-dialog-content"
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
          backgroundColor="#FFFFFF"
          borderRadius={24}
          padding={28}
          width="90%"
          maxWidth={380}
          alignSelf="center"
          shadowColor="rgba(12, 154, 92, 0.15)"
          shadowOffset={{ width: 0, height: 8 }}
          shadowOpacity={0.3}
          shadowRadius={32}
          elevate
        >
          <YStack
            gap={20}
            alignItems="center"
          >
            {/* Icon */}
            <YStack
              width={64}
              height={64}
              borderRadius={32}
              backgroundColor={iconConfig.backgroundColor as any}
              alignItems="center"
              justifyContent="center"
              shadowColor={iconConfig.iconColor as any}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.15}
              shadowRadius={12}
            >
              <IconComponent
                size={28}
                color={iconConfig.iconColor as any}
                strokeWidth={2}
              />
            </YStack>

            {/* Title */}
            <Text
              fontSize={22}
              fontWeight="700"
              color="#282A37"
              textAlign="center"
              lineHeight={28}
            >
              {title}
            </Text>

            {/* Description */}
            {description && (
              <Text
                fontSize={15}
                color="#515978"
                textAlign="center"
                lineHeight={22}
                paddingHorizontal={8}
              >
                {description}
              </Text>
            )}

            {/* Action Buttons */}
            <XStack
              gap={12}
              width="100%"
              marginTop={8}
            >
              <Button
                flex={1}
                size="$4"
                height={48}
                backgroundColor="#F5F0EC"
                color="#282A37"
                fontWeight="600"
                fontSize={15}
                borderRadius={12}
                pressStyle={SECONDARY_BUTTON_PRESS}
                onPress={handleCancel}
                disabled={isLoading}
                icon={
                  !isLoading ? (
                    <X
                      size={16}
                      color="#515978"
                    />
                  ) : undefined
                }
              >
                {cancelText}
              </Button>

              <Button
                flex={1}
                size="$4"
                height={48}
                backgroundColor={isDestructive ? '#DC2626' : '#0C9A5C'}
                color="#FFFFFF"
                fontWeight="600"
                fontSize={15}
                borderRadius={12}
                pressStyle={PRIMARY_BUTTON_PRESS}
                hoverStyle={{
                  backgroundColor: isDestructive ? '#B91C1C' : '#0A8550',
                }}
                onPress={handleConfirm}
                disabled={isLoading}
                icon={
                  isLoading ? (
                    <Spinner
                      color="#FFFFFF"
                      size="small"
                    />
                  ) : (
                    <Check
                      size={16}
                      color="#FFFFFF"
                    />
                  )
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
