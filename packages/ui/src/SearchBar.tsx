import { Input, XStack } from 'tamagui'
import { Search } from '@tamagui/lucide-icons'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export function SearchBar({
  placeholder = 'Search HandymanKiosk',
  value,
  onChangeText,
  onFocus,
  onBlur,
}: SearchBarProps) {
  return (
    <XStack
      flex={1}
      alignItems="center"
      gap="$3"
      px="$2"
      bg="white"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$md"
    >
      <Search
        size={20}
        color="$placeholderColor"
      />
      <Input
        flex={1}
        unstyled
        placeholder={placeholder}
        placeholderTextColor="$placeholderColor"
        value={value}
        onChange={(e: any) => onChangeText?.(e.target?.value ?? e.nativeEvent?.text ?? '')}
        onFocus={onFocus}
        onBlur={onBlur}
        size="$4"
        color="$color"
        bg="white"
      />
    </XStack>
  )
}
