# HandymanKiosk Splash Screen

## Design Overview

**Style:** Gradient Hero (Option 2)  
**Color Scheme:** Brand gradient #0C9A5C → #34C759  
**Logo:** Custom house + wrench combination  
**Tagline:** "Your Home, Our Expertise"

## Files

- `SplashScreen.tsx` - React component for in-app use
- `splash.svg` - Vector version for scaling
- `splash-preview.html` - Browser preview with export instructions

## Logo Design

The logo features:
- **House icon** - Represents home services (green #0C9A5C)
- **Wrench overlay** - Represents handyman/repair work (gold #FFB800)
- **White rounded square background** - Clean, modern container
- **Drop shadow** - Adds depth and professionalism

## Splash Screen Elements

1. **Background:** Linear gradient from brand green to success green
2. **Logo:** Centered house + wrench icon (120×120px)
3. **App Name:** "HandymanKiosk" in white, bold
4. **Tagline:** "Your Home, Our Expertise" in semi-transparent white
5. **Decorative Tools:** Emoji icons (🔧🔨🎨⚡) at bottom with 30% opacity
6. **Glow Effects:** Subtle circular blurs for depth

## How to Generate PNG

### Method 1: Screenshot (Recommended)
1. Open `splash-preview.html` in Chrome
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Set dimensions to 1242×2688 (iPhone 14 Pro Max)
5. Screenshot and save as `splash.png`

### Method 2: SVG Conversion
1. Use the `splash.svg` file
2. Convert using:
   - Online: CloudConvert, Convertio
   - Local: Inkscape, Illustrator
   - Command line: `inkscape splash.svg --export-filename=splash.png`
3. Set resolution to 1242×2688 pixels

### Method 3: Figma
1. Import `splash.svg` into Figma
2. Set frame to 1242×2688
3. Export at 1x or 2x

## Installation

Place the generated `splash.png` in:
```
apps/expo/assets/splash.png
```

The `app.json` is already configured:
```json
{
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#ffffff"
  }
}
```

## Optional: Multiple Sizes

For better quality across devices, consider creating multiple sizes:

| Device | Size | Filename |
|--------|------|----------|
| iPhone SE | 750×1334 | splash-iphone-se.png |
| iPhone 14 | 1170×2532 | splash-iphone-14.png |
| iPhone 14 Pro Max | 1290×2796 | splash-iphone-14-pro-max.png |
| Android | 1080×1920 | splash-android.png |

Note: Expo automatically handles resizing with `resizeMode: "contain"`.

## Customization

To modify the splash screen:

1. **Change colors:** Edit gradient in `SplashScreen.tsx` or `splash.svg`
2. **Change tagline:** Update text element
3. **Change logo:** Replace SVG paths in logo section
4. **Add animation:** Use `SplashScreen.tsx` component with React Native animations

## Usage in App

```tsx
import { SplashScreen } from '@my/ui'

// As a loading screen
export function LoadingScreen() {
  return <SplashScreen />
}
```

## Brand Colors Reference

- Primary: `#0C9A5C`
- Success: `#34C759`
- Accent: `#FFB800`
- Background: `#FBF6F2`
- White: `#FFFFFF`
