'use client'

import { useState } from 'react'
import { Button, useIsomorphicLayoutEffect } from 'tamagui'
import { useThemeSetting, useRootTheme } from '@tamagui/next-theme'
import { PressPresets } from './pressAnimations'

export const SwitchThemeButton = () => {
  const themeSetting = useThemeSetting()
  const [theme] = useRootTheme()

  const [clientTheme, setClientTheme] = useState<string | undefined>('light')

  useIsomorphicLayoutEffect(() => {
    setClientTheme(themeSetting.forcedTheme || themeSetting.current || theme)
  }, [themeSetting.current, themeSetting.resolvedTheme])

  return (
    <Button
      onPress={themeSetting.toggle}
      pressStyle={PressPresets.secondary.pressStyle}
      animation={PressPresets.secondary.animation}
    >
      Change theme: {clientTheme}
    </Button>
  )
}
