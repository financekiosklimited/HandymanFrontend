import { YStack, XStack, Text, Image } from 'tamagui'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

const logoUrl = 'https://www.figma.com/api/mcp/asset/2eef10eb-1925-4531-8ddb-7d7f78b82793'

export function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizes = {
    sm: { logo: 40, text: 24 },
    md: { logo: 72, text: 28 },
    lg: { logo: 96, text: 32 },
  }

  const { logo, text } = sizes[size]

  return (
    <YStack
      alignItems="center"
      gap="$md"
    >
      <Image
        source={{ uri: logoUrl }}
        width={logo}
        height={logo}
        resizeMode="contain"
      />
      <YStack
        alignItems="center"
        gap="$xs"
      >
        <Text
          fontSize={text}
          fontWeight="bold"
          color="$primary"
        >
          SOLUTION BANK
        </Text>
        {showTagline && (
          <Text
            fontSize="$4"
            color="$colorSubtle"
            textAlign="center"
          >
            Your trusted home services
          </Text>
        )}
      </YStack>
    </YStack>
  )
}
