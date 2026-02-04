import { XStack, YStack, Text, Button, View, Spinner, useTheme } from 'tamagui'
import { Search, Bell, Plus, Briefcase, User } from '@tamagui/lucide-icons'
import type { IconProps } from '@tamagui/helpers-icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type NavVariant = 'guest' | 'homeowner' | 'handyman'

interface BottomNavItem {
  id: string
  label: string
  icon: React.ComponentType<IconProps>
  route: string
  requiresAuth?: boolean
}

// Nav items for each variant
const guestNavItems: BottomNavItem[] = [
  { id: 'explore', label: 'Explore', icon: Search, route: '/' },
  { id: 'updates', label: 'Updates', icon: Bell, route: '/updates', requiresAuth: true },
  { id: 'add', label: 'Add', icon: Plus, route: '/add', requiresAuth: true },
  { id: 'my-jobs', label: 'My Jobs', icon: Briefcase, route: '/my-jobs', requiresAuth: true },
  { id: 'profile', label: 'Profile', icon: User, route: '/profile', requiresAuth: true },
]

const homeownerNavItems: BottomNavItem[] = [
  { id: 'explore', label: 'Explore', icon: Search, route: '/(homeowner)/' },
  { id: 'updates', label: 'Updates', icon: Bell, route: '/(homeowner)/updates' },
  { id: 'add', label: 'Add', icon: Plus, route: '/(homeowner)/jobs/add' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, route: '/(homeowner)/jobs' },
  { id: 'profile', label: 'Profile', icon: User, route: '/(homeowner)/profile' },
]

const handymanNavItems: BottomNavItem[] = [
  { id: 'explore', label: 'Explore', icon: Search, route: '/(handyman)/' },
  { id: 'updates', label: 'Updates', icon: Bell, route: '/(handyman)/updates' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, route: '/(handyman)/jobs' },
  { id: 'profile', label: 'Profile', icon: User, route: '/(handyman)/profile' },
]

const getNavItems = (variant: NavVariant): BottomNavItem[] => {
  switch (variant) {
    case 'homeowner':
      return homeownerNavItems
    case 'handyman':
      return handymanNavItems
    default:
      return guestNavItems
  }
}

interface BottomNavProps {
  activeRoute?: string
  variant?: NavVariant
  /** Callback for Add button press - used for phone verification check */
  onAddPress?: () => void
  /** Whether the add button is loading (e.g., checking phone verification) */
  isAddLoading?: boolean
  /** Number of unread notifications to show as badge */
  notificationCount?: number
  /** Navigation handler - receives the route to navigate to */
  onNavigate: (route: string) => void
}

export function BottomNav({
  activeRoute = '/',
  variant = 'guest',
  onAddPress,
  isAddLoading,
  notificationCount = 0,
  onNavigate,
}: BottomNavProps) {
  const navItems = getNavItems(variant)
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const handleNavPress = (item: BottomNavItem) => {
    // If it's the Add button and we have a custom handler, use it
    if (item.id === 'add' && onAddPress) {
      onAddPress()
      return
    }

    // If guest tries to access protected route, redirect to login
    if (variant === 'guest' && item.requiresAuth) {
      onNavigate('/auth/login')
      return
    }
    onNavigate(item.route)
  }

  return (
    <XStack
      bg="$backgroundStrong"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      px="$xl"
      py="$md"
      pb={insets.bottom || '$md'}
      justifyContent="space-around"
      alignItems="flex-start"
    >
      {navItems.map((item) => {
        const isActive = activeRoute === item.route || activeRoute === item.id
        const Icon = item.icon
        const isAddButton = item.id === 'add'
        const isUpdatesButton = item.id === 'updates'
        const showBadge = isUpdatesButton && notificationCount > 0

        return (
          <Button
            key={item.id}
            unstyled
            onPress={() => handleNavPress(item)}
            flexDirection="column"
            alignItems="center"
            gap="$1"
            flex={1}
            animation="micro"
            pressStyle={{ scale: 0.9 }}
          >
            {isAddButton ? (
              <>
                <View
                  width={60}
                  height={60}
                  borderRadius={30}
                  bg="$primary"
                  alignItems="center"
                  justifyContent="center"
                  opacity={isAddLoading ? 0.7 : 1}
                  top={-30}
                  borderWidth={4}
                  borderColor="$backgroundStrong"
                  position="absolute"
                >
                  {isAddLoading ? (
                    <Spinner
                      size="small"
                      color="$backgroundStrong"
                    />
                  ) : (
                    <Plus
                      size={28}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      color={theme.backgroundStrong?.val as any}
                    />
                  )}
                </View>
                {/* Spacer to align text with other tabs that have 24px icons */}
                <View height={24} />
              </>
            ) : (
              <View position="relative">
                <Icon
                  size={24}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  color={isActive ? (theme.primary?.val as any) : (theme.colorMuted?.val as any)}
                />
                {/* Notification Badge */}
                {showBadge && (
                  <View
                    position="absolute"
                    top={-4}
                    right={-8}
                    minWidth={16}
                    height={16}
                    borderRadius={8}
                    bg="$error"
                    alignItems="center"
                    justifyContent="center"
                    px={4}
                    animation="micro"
                    scale={1}
                    enterStyle={{ scale: 0, opacity: 0 }}
                    exitStyle={{ scale: 0, opacity: 0 }}
                  >
                    <Text
                      fontSize={10}
                      fontWeight="700"
                      color="$backgroundStrong"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <Text
              fontSize="$1"
              color={isActive ? '$primary' : '$colorMuted'}
              fontWeight={isActive ? '600' : '400'}
            >
              {item.label}
            </Text>
          </Button>
        )
      })}
    </XStack>
  )
}
