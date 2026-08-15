/**
 * Generate PWA icons from SVG
 * 
 * To use this script, install sharp:
 *   npm install sharp --save-dev
 * 
 * Then run:
 *   node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed. Creating placeholder icons...');
  createPlaceholders();
  process.exit(0);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  const svg = fs.readFileSync(svgPath);
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}x${size}.png`);
  }
  
  console.log('All icons generated!');
}

function createPlaceholders() {
  // Create simple placeholder files
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    if (!fs.existsSync(outputPath)) {
      // Copy the SVG as a placeholder (browsers will still render it)
      fs.copyFileSync(svgPath, outputPath.replace('.png', '.svg'));
      console.log(`Created placeholder: icon-${size}x${size}.svg`);
    }
  }
}

generateIcons().catch(console.error);
