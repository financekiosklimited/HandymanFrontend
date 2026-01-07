import { forwardRef } from 'react'
import { YStack, XStack, Text, Input, TextArea } from 'tamagui'
import type { GetProps, TamaguiElement } from 'tamagui'

// Base input styles
const baseInputStyles = {
  bg: '$backgroundStrong',
  borderColor: '$borderColorHover',
  borderWidth: 1,
  borderRadius: '$4',
  px: '$4',
  py: '$3',
  minHeight: 52,
} as const

interface FormInputProps extends Omit<GetProps<typeof Input>, 'ref'> {
  label?: string
  required?: boolean
  error?: string | string[]
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

export const FormInput = forwardRef<TamaguiElement, FormInputProps>(
  ({ label, required, error, leftElement, rightElement, ...props }, ref) => {
    const hasError = error && (Array.isArray(error) ? error.length > 0 : true)
    const errorMessages = Array.isArray(error) ? error : error ? [error] : []

    return (
      <YStack gap="$2">
        {label && (
          <XStack
            gap="$1"
            alignItems="center"
          >
            <Text
              fontSize="$3"
              fontWeight="600"
              color="$color"
            >
              {label}
            </Text>
            {required && (
              <Text
                color="$primary"
                fontWeight="bold"
              >
                *
              </Text>
            )}
          </XStack>
        )}

        {leftElement || rightElement ? (
          <XStack
            bg="$backgroundStrong"
            borderColor={hasError ? '$error' : '$borderColorHover'}
            borderWidth={1}
            borderRadius="$4"
            px="$4"
            py="$3"
            minHeight={52}
            alignItems="center"
            focusWithinStyle={{
              borderColor: '$primary',
              borderWidth: 1.5,
            }}
          >
            {leftElement}
            <Input
              ref={ref as any}
              bg="transparent"
              borderWidth={0}
              flex={1}
              px={leftElement ? '$2' : 0}
              py={0}
              minHeight="auto"
              placeholderTextColor="$placeholderColor"
              {...props}
            />
            {rightElement}
          </XStack>
        ) : (
          <Input
            ref={ref as any}
            {...baseInputStyles}
            borderColor={hasError ? '$error' : '$borderColorHover'}
            placeholderTextColor="$placeholderColor"
            focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
            {...props}
          />
        )}

        {errorMessages.map((err, i) => (
          <Text
            key={i}
            color="$error"
            fontSize="$2"
          >
            {err}
          </Text>
        ))}
      </YStack>
    )
  }
)

FormInput.displayName = 'FormInput'

interface FormTextAreaProps extends GetProps<typeof TextArea> {
  label?: string
  required?: boolean
  error?: string | string[]
  maxLength?: number
  showCount?: boolean
}

export function FormTextArea({
  label,
  required,
  error,
  maxLength,
  showCount,
  value,
  ...props
}: FormTextAreaProps) {
  const hasError = error && (Array.isArray(error) ? error.length > 0 : true)
  const errorMessages = Array.isArray(error) ? error : error ? [error] : []
  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <YStack gap="$2">
      {label && (
        <XStack
          gap="$1"
          alignItems="center"
        >
          <Text
            fontSize="$3"
            fontWeight="600"
            color="$color"
          >
            {label}
          </Text>
          {required && (
            <Text
              color="$primary"
              fontWeight="bold"
            >
              *
            </Text>
          )}
        </XStack>
      )}

      <YStack position="relative">
        <TextArea
          value={value}
          {...baseInputStyles}
          borderColor={hasError ? '$error' : '$borderColorHover'}
          minHeight={120}
          placeholderTextColor="$placeholderColor"
          textAlignVertical="top"
          focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
          {...props}
        />
        {showCount && maxLength && (
          <Text
            position="absolute"
            bottom="$2"
            right="$3"
            fontSize="$1"
            color="$colorMuted"
          >
            {currentLength}/{maxLength}
          </Text>
        )}
      </YStack>

      {errorMessages.map((err, i) => (
        <Text
          key={i}
          color="$error"
          fontSize="$2"
        >
          {err}
        </Text>
      ))}
    </YStack>
  )
}

interface FormSelectProps {
  label?: string
  required?: boolean
  error?: string | string[]
  placeholder?: string
  value?: string
  displayValue?: string
  onPress?: () => void
  rightElement?: React.ReactNode
}

export function FormSelect({
  label,
  required,
  error,
  placeholder,
  value,
  displayValue,
  onPress,
  rightElement,
}: FormSelectProps) {
  const hasError = error && (Array.isArray(error) ? error.length > 0 : true)
  const errorMessages = Array.isArray(error) ? error : error ? [error] : []

  return (
    <YStack gap="$2">
      {label && (
        <XStack
          gap="$1"
          alignItems="center"
        >
          <Text
            fontSize="$3"
            fontWeight="600"
            color="$color"
          >
            {label}
          </Text>
          {required && (
            <Text
              color="$primary"
              fontWeight="bold"
            >
              *
            </Text>
          )}
        </XStack>
      )}

      <XStack
        bg="$backgroundStrong"
        borderColor={hasError ? '$error' : '$borderColorHover'}
        borderWidth={1}
        borderRadius="$4"
        px="$4"
        py="$3"
        minHeight={52}
        alignItems="center"
        justifyContent="space-between"
        onPress={onPress}
        pressStyle={{ opacity: 0.8 }}
        cursor="pointer"
      >
        <Text color={value ? '$color' : '$placeholderColor'}>
          {displayValue || placeholder || 'Select...'}
        </Text>
        {rightElement}
      </XStack>

      {errorMessages.map((err, i) => (
        <Text
          key={i}
          color="$error"
          fontSize="$2"
        >
          {err}
        </Text>
      ))}
    </YStack>
  )
}
