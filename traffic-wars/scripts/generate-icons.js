#!/usr/bin/env node

// Simple icon generator for Traffic Simulator
// This creates basic colored squares with emoji for now
// In production, you'd want to use proper design tools

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Icon sizes needed for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]

// Create a simple SVG icon
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#4a90e2" rx="${size * 0.1}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
          text-anchor="middle" dominant-baseline="middle" fill="white">🚗</text>
  </svg>`
}

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Generate SVG icons
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size)
  const filename = `icon-${size}.svg`
  const filepath = path.join(iconsDir, filename)
  
  fs.writeFileSync(filepath, svgContent)
  console.log(`✅ Generated ${filename}`)
})

// Create a simple HTML file to convert SVG to PNG (for manual conversion)
const converterHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Icon Converter</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon { margin: 10px; display: inline-block; }
        canvas { border: 1px solid #ccc; margin: 5px; }
    </style>
</head>
<body>
    <h1>Traffic Simulator Icon Converter</h1>
    <p>Right-click on each icon and "Save image as..." to create PNG files:</p>
    
    ${iconSizes.map(size => `
        <div class="icon">
            <h3>${size}x${size}</h3>
            <canvas id="canvas-${size}" width="${size}" height="${size}"></canvas>
        </div>
    `).join('')}
    
    <script>
        ${iconSizes.map(size => `
            const canvas${size} = document.getElementById('canvas-${size}');
            const ctx${size} = canvas${size}.getContext('2d');
            
            // Create gradient background
            const gradient${size} = ctx${size}.createLinearGradient(0, 0, ${size}, ${size});
            gradient${size}.addColorStop(0, '#4a90e2');
            gradient${size}.addColorStop(1, '#357abd');
            
            ctx${size}.fillStyle = gradient${size};
            ctx${size}.fillRect(0, 0, ${size}, ${size});
            
            // Add rounded corners
            ctx${size}.globalCompositeOperation = 'destination-in';
            ctx${size}.beginPath();
            ctx${size}.roundRect(0, 0, ${size}, ${size}, ${size * 0.1});
            ctx${size}.fill();
            
            // Reset composite operation
            ctx${size}.globalCompositeOperation = 'source-over';
            
            // Add car emoji
            ctx${size}.font = '${size * 0.4}px Arial';
            ctx${size}.textAlign = 'center';
            ctx${size}.textBaseline = 'middle';
            ctx${size}.fillStyle = 'white';
            ctx${size}.fillText('🚗', ${size/2}, ${size/2});
        `).join('')}
    </script>
</body>
</html>`

fs.writeFileSync(path.join(iconsDir, 'icon-converter.html'), converterHTML)
console.log('✅ Generated icon-converter.html - open this in browser to create PNG icons')

console.log('\n📱 Next steps:')
console.log('1. Open public/icon-converter.html in your browser')
console.log('2. Right-click each icon and save as PNG (e.g., icon-192.png)')
console.log('3. Or use online tools like https://realfavicongenerator.net/')
console.log('4. Or use design tools like Figma, Canva, or GIMP')
