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
  placeholder = 'Search SolutionBank',
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
      bg="$backgroundMuted"
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
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        size="$4"
        color="$color"
        bg="transparent"
      />
    </XStack>
  )
}
