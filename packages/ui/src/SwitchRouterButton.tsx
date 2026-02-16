import { Anchor, Button } from 'tamagui'
import { PressPresets } from './pressAnimations'

export const SwitchRouterButton = ({ pagesMode = false }: { pagesMode?: boolean }) => {
  return (
    <Anchor
      text="center"
      color="$color12"
      href={pagesMode ? '/' : '/pages-example'}
    >
      <Button
        pressStyle={PressPresets.secondary.pressStyle}
        animation={PressPresets.secondary.animation}
      >
        Change router: {pagesMode ? 'pages' : 'app'}
      </Button>
    </Anchor>
  )
}
