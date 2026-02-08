/**
 * Splash Screen Generator Script
 *
 * This script generates the splash.png file from the SVG design
 *
 * Usage:
 *   node generate-splash.js
 *
 * Requirements:
 *   - sharp (npm install sharp)
 *   or
 *   - svg2png (npm install svg2png)
 *
 * Or use online converters:
 *   - https://cloudconvert.com/svg-to-png
 *   - https://convertio.co/svg-png/
 */

const fs = require('node:fs')
const path = require('node:path')

// Check if sharp is available
try {
  const sharp = require('sharp')

  const svgPath = path.join(__dirname, 'splash.svg')
  const outputPath = path.join(__dirname, '..', '..', '..', 'apps', 'expo', 'assets', 'splash.png')

  if (!fs.existsSync(svgPath)) {
    console.error('❌ Error: splash.svg not found!')
    process.exit(1)
  }

  const svgBuffer = fs.readFileSync(svgPath)

  // Generate iPhone 14 Pro Max size (1242×2688)
  sharp(svgBuffer)
    .resize(1242, 2688, {
      fit: 'fill',
    })
    .png()
    .toFile(outputPath)
    .then(() => {})
    .catch((err) => {
      console.error('❌ Error generating splash screen:', err)
    })
} catch (e) {}
