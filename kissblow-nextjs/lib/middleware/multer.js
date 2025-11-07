import multer from 'multer'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'

// Use process.cwd() for Next.js compatibility (works in both dev and production)
const getUploadPath = (subfolder) => {
  return path.join(process.cwd(), 'public', 'uploads', subfolder)
}

// Helper function to get logFileOperation with fallback
const logFileOperation = async (operation, filePath, success, error = null) => {
  try {
    const loggerModule = await import('../logger.js')
    if (loggerModule.logFileOperation) {
      loggerModule.logFileOperation(operation, filePath, success, error)
    }
  } catch (err) {
    // Fallback to console if logger import fails
    console.log(`[File Operation] ${operation}: ${filePath} - ${success ? 'SUCCESS' : 'FAILED'}`, error || '')
  }
}

// File validation utilities
const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.mimetype)
}

const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize
}

const validateImageFile = (file) => {
  // Check MIME type - support all popular image formats
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml'
  ]
  
  if (!validateFileType(file, allowedImageTypes)) {
    return { valid: false, error: 'Unsupported image format. Supported: JPEG, PNG, WebP, GIF, BMP, TIFF, SVG' }
  }
  
  // Check file size (20MB for images - larger to account for conversion)
  if (!validateFileSize(file, 20 * 1024 * 1024)) {
    return { valid: false, error: 'Image file size must be less than 20MB' }
  }
  
  return { valid: true }
}

const validateVideoFile = (file) => {
  // Check MIME type - support all popular video formats
  const allowedVideoTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/mkv',
    'video/3gp',
    'video/ogv'
  ]
  
  if (!validateFileType(file, allowedVideoTypes)) {
    return { valid: false, error: 'Unsupported video format. Supported: MP4, WebM, QuickTime, AVI, MOV, WMV, FLV, MKV, 3GP, OGV' }
  }
  
  // Check file size (200MB for videos - larger to account for conversion)
  if (!validateFileSize(file, 200 * 1024 * 1024)) {
    return { valid: false, error: 'Video file size must be less than 200MB' }
  }
  
  return { valid: true }
}

const validateVerificationFile = (file) => {
  // Check MIME type - support all popular image formats for verification
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff'
  ]
  
  if (!validateFileType(file, allowedTypes)) {
    return { valid: false, error: 'Unsupported image format for verification. Supported: JPEG, PNG, WebP, GIF, BMP, TIFF' }
  }
  
  // Check file size (10MB for verification photos - larger to account for conversion)
  if (!validateFileSize(file, 10 * 1024 * 1024)) {
    return { valid: false, error: 'Verification photo must be less than 10MB' }
  }
  
  return { valid: true }
}

// File conversion utilities
const convertImageToJpg = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .jpeg({ 
        quality: 85,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputPath)
    
    await logFileOperation('image_conversion', inputPath, true)
    return { success: true }
  } catch (error) {
    await logFileOperation('image_conversion', inputPath, false, error)
    return { success: false, error: error.message }
  }
}

const convertVideoToMp4 = async (inputPath, outputPath) => {
  return new Promise((resolve) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .on('end', async () => {
        await logFileOperation('video_conversion', inputPath, true)
        resolve({ success: true })
      })
      .on('error', async (error) => {
        await logFileOperation('video_conversion', inputPath, false, error)
        resolve({ success: false, error: error.message })
      })
      .run()
  })
}

const isImageFile = (mimetype) => {
  return mimetype.startsWith('image/')
}

const isVideoFile = (mimetype) => {
  return mimetype.startsWith('video/')
}

const needsConversion = (mimetype) => {
  // Check if file needs conversion
  if (isImageFile(mimetype)) {
    return mimetype !== 'image/jpeg' && mimetype !== 'image/jpg'
  }
  if (isVideoFile(mimetype)) {
    return mimetype !== 'video/mp4'
  }
  return false
}

// Main upload storage for profiles
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadPath('profiles')
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // Always save as .jpg for images and .mp4 for videos
    const extension = isImageFile(file.mimetype) ? '.jpg' : '.mp4'
    cb(null, 'profile-' + uniqueSuffix + extension)
  }
})

// Verification upload storage
const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadPath('verifications')
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // Always save verification photos as .jpg
    cb(null, 'verification-' + uniqueSuffix + '.jpg')
  }
})

// Main upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit for videos (larger for conversion)
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Determine if it's an image or video based on MIME type
    if (file.mimetype.startsWith('image/')) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        return cb(new Error(validation.error), false)
      }
    } else if (file.mimetype.startsWith('video/')) {
      const validation = validateVideoFile(file)
      if (!validation.valid) {
        return cb(new Error(validation.error), false)
      }
    } else {
      return cb(new Error('Only image and video files are allowed'), false)
    }
    
    cb(null, true)
  }
})

// Verification upload middleware
const verificationUpload = multer({
  storage: verificationStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for verification photos (larger for conversion)
    files: 1 // Only one verification photo at a time
  },
  fileFilter: (req, file, cb) => {
    const validation = validateVerificationFile(file)
    if (!validation.valid) {
      return cb(new Error(validation.error), false)
    }
    
    cb(null, true)
  }
})

// Error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' })
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name' })
    }
  }
  
  if (error.message) {
    return res.status(400).json({ error: error.message })
  }
  
  next(error)
}

// Process uploaded file with conversion if needed
const processUploadedFile = async (file) => {
  try {
    const filePath = file.path
    const needsConv = needsConversion(file.mimetype)
    
    await logFileOperation('file_upload', filePath, true, { 
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      needsConversion: needsConv
    })
    
    if (!needsConv) {
      // File is already in correct format
      return { success: true, path: filePath, converted: false }
    }
    
    // Generate new filename with correct extension
    const dir = path.dirname(filePath)
    const nameWithoutExt = path.basename(filePath, path.extname(filePath))
    const newExtension = isImageFile(file.mimetype) ? '.jpg' : '.mp4'
    const newPath = path.join(dir, nameWithoutExt + newExtension)
    
    let conversionResult
    
    if (isImageFile(file.mimetype)) {
      conversionResult = await convertImageToJpg(filePath, newPath)
    } else if (isVideoFile(file.mimetype)) {
      conversionResult = await convertVideoToMp4(filePath, newPath)
    }
    
    if (!conversionResult.success) {
      // Clean up original file if conversion failed
      try {
        fs.unlinkSync(filePath)
      } catch (unlinkError) {
        console.error('Failed to clean up original file:', unlinkError)
      }
      return { success: false, error: conversionResult.error }
    }
    
    // Clean up original file after successful conversion
    try {
      fs.unlinkSync(filePath)
    } catch (unlinkError) {
      console.error('Failed to clean up original file after conversion:', unlinkError)
    }
    
    // Update file object with new path and mimetype
    file.path = newPath
    file.filename = path.basename(newPath)
    file.mimetype = isImageFile(file.mimetype) ? 'image/jpeg' : 'video/mp4'
    
    return { success: true, path: newPath, converted: true }
    
  } catch (error) {
    await logFileOperation('file_processing', file.path, false, error)
    return { success: false, error: error.message }
  }
}

export { 
  upload, 
  verificationUpload, 
  handleMulterError,
  validateImageFile,
  validateVideoFile,
  validateVerificationFile,
  processUploadedFile,
  convertImageToJpg,
  convertVideoToMp4,
  needsConversion
}
