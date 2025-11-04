const sharp = require('sharp')

// Image optimization function
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  try {
    const { width = 1200, height = 1600, quality = 80 } = options
    
    await sharp(inputPath)
      .resize(width, height, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toFile(outputPath)
    
    return true
  } catch (error) {
    console.error('Error optimizing image:', error)
    return false
  }
}

module.exports = { optimizeImage }