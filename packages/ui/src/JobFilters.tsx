import { useState, useRef } from 'react'
import { XStack, YStack, Text, Button, ScrollView, View } from 'tamagui'
import { ChevronDown, Tag, MapPin, X } from '@tamagui/lucide-icons'
import { PressPresets } from './pressAnimations'

interface FilterOption {
  public_id: string
  name: string
}

interface JobFiltersProps {
  categories?: FilterOption[]
  cities?: FilterOption[]
  selectedCategory?: string
  selectedCity?: string
  onCategoryChange?: (categoryId: string | undefined) => void
  onCityChange?: (cityId: string | undefined) => void
  isLoadingCategories?: boolean
  isLoadingCities?: boolean
}

type ActiveDropdown = 'category' | 'city' | null

export function JobFilters({
  categories = [],
  cities = [],
  selectedCategory,
  selectedCity,
  onCategoryChange,
  onCityChange,
  isLoadingCategories,
  isLoadingCities,
}: JobFiltersProps) {
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null)

  const selectedCategoryName = categories.find((c) => c.public_id === selectedCategory)?.name
  const selectedCityName = cities.find((c) => c.public_id === selectedCity)?.name

  const handleCategorySelect = (categoryId: string | undefined) => {
    onCategoryChange?.(categoryId)
    setActiveDropdown(null)
  }

  const handleCitySelect = (cityId: string | undefined) => {
    onCityChange?.(cityId)
    setActiveDropdown(null)
  }

  const toggleDropdown = (dropdown: ActiveDropdown) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown))
  }

  return (
    <YStack gap="$sm">
      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <XStack gap="$sm">
          {/* Category Filter Pill */}
          <Button
            unstyled
            onPress={() => toggleDropdown('category')}
            bg={selectedCategory ? '$primary' : 'rgba(255,255,255,0.9)'}
            borderRadius="$full"
            px="$md"
            py="$sm"
            borderWidth={1}
            borderColor={selectedCategory ? '$primary' : 'rgba(0,0,0,0.08)'}
            pressStyle={PressPresets.filter.pressStyle}
            animation={PressPresets.filter.animation}
            flexDirection="row"
            alignItems="center"
            gap="$xs"
          >
            <Tag
              size={14}
              color={selectedCategory ? 'white' : '$colorSubtle'}
            />
            <Text
              fontSize="$3"
              fontWeight="500"
              color={selectedCategory ? 'white' : '$color'}
              numberOfLines={1}
            >
              {selectedCategoryName || 'All Categories'}
            </Text>
            {selectedCategory ? (
              <Button
                unstyled
                onPress={(e) => {
                  e.stopPropagation()
                  handleCategorySelect(undefined)
                }}
                hitSlop={8}
                ml="$xs"
              >
                <X
                  size={14}
                  color="white"
                />
              </Button>
            ) : (
              <ChevronDown
                size={14}
                color="$colorSubtle"
              />
            )}
          </Button>

          {/* City Filter Pill */}
          <Button
            unstyled
            onPress={() => toggleDropdown('city')}
            bg={selectedCity ? '$primary' : 'rgba(255,255,255,0.9)'}
            borderRadius="$full"
            px="$md"
            py="$sm"
            borderWidth={1}
            borderColor={selectedCity ? '$primary' : 'rgba(0,0,0,0.08)'}
            pressStyle={PressPresets.filter.pressStyle}
            animation={PressPresets.filter.animation}
            flexDirection="row"
            alignItems="center"
            gap="$xs"
          >
            <MapPin
              size={14}
              color={selectedCity ? 'white' : '$colorSubtle'}
            />
            <Text
              fontSize="$3"
              fontWeight="500"
              color={selectedCity ? 'white' : '$color'}
              numberOfLines={1}
            >
              {selectedCityName || 'All Cities'}
            </Text>
            {selectedCity ? (
              <Button
                unstyled
                onPress={(e) => {
                  e.stopPropagation()
                  handleCitySelect(undefined)
                }}
                hitSlop={8}
                ml="$xs"
              >
                <X
                  size={14}
                  color="white"
                />
              </Button>
            ) : (
              <ChevronDown
                size={14}
                color="$colorSubtle"
              />
            )}
          </Button>
        </XStack>
      </ScrollView>

      {/* Dropdown for Category */}
      {activeDropdown === 'category' && (
        <YStack
          bg="$backgroundStrong"
          borderRadius={16}
          borderWidth={1}
          borderColor="$borderColor"
          overflow="hidden"
          elevation={4}
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.12}
          shadowRadius={12}
          maxHeight={280}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* All Categories Option */}
            <Button
              unstyled
              onPress={() => handleCategorySelect(undefined)}
              px="$md"
              py="$sm"
              bg={!selectedCategory ? 'rgba(12,154,92,0.1)' : 'transparent'}
              pressStyle={{ bg: '$backgroundMuted' }}
              borderBottomWidth={1}
              borderBottomColor="rgba(0,0,0,0.05)"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Tag
                  size={16}
                  color={!selectedCategory ? '$primary' : '$colorSubtle'}
                />
                <Text
                  fontSize="$3"
                  color={!selectedCategory ? '$primary' : '$color'}
                  fontWeight={!selectedCategory ? '600' : '400'}
                >
                  All Categories
                </Text>
              </XStack>
            </Button>

            {isLoadingCategories ? (
              <YStack
                py="$lg"
                alignItems="center"
              >
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  Loading...
                </Text>
              </YStack>
            ) : (
              categories.map((category) => (
                <Button
                  key={category.public_id}
                  unstyled
                  onPress={() => handleCategorySelect(category.public_id)}
                  px="$md"
                  py="$sm"
                  bg={
                    selectedCategory === category.public_id ? 'rgba(12,154,92,0.1)' : 'transparent'
                  }
                  pressStyle={{ bg: '$backgroundMuted' }}
                  borderBottomWidth={1}
                  borderBottomColor="rgba(0,0,0,0.05)"
                >
                  <Text
                    fontSize="$3"
                    color={selectedCategory === category.public_id ? '$primary' : '$color'}
                    fontWeight={selectedCategory === category.public_id ? '600' : '400'}
                  >
                    {category.name}
                  </Text>
                </Button>
              ))
            )}
          </ScrollView>
        </YStack>
      )}

      {/* Dropdown for City */}
      {activeDropdown === 'city' && (
        <YStack
          bg="$backgroundStrong"
          borderRadius={16}
          borderWidth={1}
          borderColor="$borderColor"
          overflow="hidden"
          elevation={4}
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.12}
          shadowRadius={12}
          maxHeight={280}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* All Cities Option */}
            <Button
              unstyled
              onPress={() => handleCitySelect(undefined)}
              px="$md"
              py="$sm"
              bg={!selectedCity ? 'rgba(12,154,92,0.1)' : 'transparent'}
              pressStyle={{ bg: '$backgroundMuted' }}
              borderBottomWidth={1}
              borderBottomColor="rgba(0,0,0,0.05)"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <MapPin
                  size={16}
                  color={!selectedCity ? '$primary' : '$colorSubtle'}
                />
                <Text
                  fontSize="$3"
                  color={!selectedCity ? '$primary' : '$color'}
                  fontWeight={!selectedCity ? '600' : '400'}
                >
                  All Cities
                </Text>
              </XStack>
            </Button>

            {isLoadingCities ? (
              <YStack
                py="$lg"
                alignItems="center"
              >
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  Loading...
                </Text>
              </YStack>
            ) : (
              cities.map((city) => (
                <Button
                  key={city.public_id}
                  unstyled
                  onPress={() => handleCitySelect(city.public_id)}
                  px="$md"
                  py="$sm"
                  bg={selectedCity === city.public_id ? 'rgba(12,154,92,0.1)' : 'transparent'}
                  pressStyle={{ bg: '$backgroundMuted' }}
                  borderBottomWidth={1}
                  borderBottomColor="rgba(0,0,0,0.05)"
                >
                  <Text
                    fontSize="$3"
                    color={selectedCity === city.public_id ? '$primary' : '$color'}
                    fontWeight={selectedCity === city.public_id ? '600' : '400'}
                  >
                    {city.name}
                  </Text>
                </Button>
              ))
            )}
          </ScrollView>
        </YStack>
      )}
    </YStack>
  )
}
