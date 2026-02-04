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

const fs = require('fs')
const path = require('path')

// Check if sharp is available
try {
  const sharp = require('sharp')
  
  const svgPath = path.join(__dirname, 'splash.svg')
  const outputPath = path.join(__dirname, '..', '..', '..', 'apps', 'expo', 'assets', 'splash.png')
  
  if (!fs.existsSync(svgPath)) {
    console.error('❌ Error: splash.svg not found!')
    console.log('Make sure you are running this script from packages/ui/src/assets/')
    process.exit(1)
  }
  
  const svgBuffer = fs.readFileSync(svgPath)
  
  // Generate iPhone 14 Pro Max size (1242×2688)
  sharp(svgBuffer)
    .resize(1242, 2688, {
      fit: 'fill'
    })
    .png()
    .toFile(outputPath)
    .then(() => {
      console.log('✅ Splash screen generated successfully!')
      console.log(`📱 Size: 1242×2688 (iPhone 14 Pro Max)`)
      console.log(`📁 Location: ${outputPath}`)
      console.log('')
      console.log('🎨 Design Features:')
      console.log('   • Gradient background (#0C9A5C → #34C759)')
      console.log('   • Custom house + wrench logo')
      console.log('   • "HandymanKiosk" branding')
      console.log('   • Tagline: "Your Home, Our Expertise"')
      console.log('   • Decorative tool icons')
    })
    .catch(err => {
      console.error('❌ Error generating splash screen:', err)
    })
    
} catch (e) {
  console.log('📦 Sharp not installed. Install it with: npm install sharp')
  console.log('')
  console.log('🌐 Alternative: Use online SVG to PNG converters:')
  console.log('   1. Visit https://cloudconvert.com/svg-to-png')
  console.log('   2. Upload splash.svg')
  console.log('   3. Set dimensions to 1242×2688')
  console.log('   4. Download and save as apps/expo/assets/splash.png')
  console.log('')
  console.log('💡 Or open splash-preview.html in Chrome and screenshot at 1242×2688')
}
