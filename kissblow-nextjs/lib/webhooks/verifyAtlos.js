const crypto = require('crypto')

/**
 * Verify Atlos webhook signature using HMAC-SHA256
 * Based on official Atlos documentation
 * 
 * @param {string} rawBody - Raw request body as string (not JSON)
 * @param {string} signature - Signature from 'Signature' header (base64)
 * @param {string} apiSecret - ATLOS_API_SECRET from environment
 * @returns {boolean} - True if signature is valid
 */
const verifyAtlosSignature = (rawBody, signature, apiSecret) => {
  if (!rawBody || !signature || !apiSecret) {
    return false
  }

  // Calculate expected signature using HMAC-SHA256
  const hmac = crypto.createHmac('sha256', apiSecret)
  hmac.write(rawBody)
  hmac.end()
  const expectedSignature = hmac.read().toString('base64')

  // Use constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(expectedSignature, 'base64')
  )
}

/**
 * Verify Atlos webhook request
 * @param {Object} req - Next.js request object with raw body
 * @param {string} apiSecret - ATLOS_API_SECRET from environment
 * @returns {Object} - { valid: boolean, error?: string }
 */
const verifyAtlosWebhook = (req, apiSecret) => {
  if (!apiSecret) {
    return {
      valid: false,
      error: 'ATLOS_API_SECRET is not configured'
    }
  }

  // Get signature from 'Signature' header (as per Atlos docs)
  const signature = req.headers['signature'] || req.headers['Signature']

  if (!signature) {
    return {
      valid: false,
      error: 'Signature header is missing'
    }
  }

  // Get raw body (must be string, not parsed JSON)
  const rawBody = typeof req.body === 'string' 
    ? req.body 
    : (req.body ? JSON.stringify(req.body) : '')

  if (!rawBody) {
    return {
      valid: false,
      error: 'Request body is empty'
    }
  }

  // Verify signature
  const isValid = verifyAtlosSignature(rawBody, signature, apiSecret)

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid webhook signature'
    }
  }

  return { valid: true }
}

module.exports = {
  verifyAtlosSignature,
  verifyAtlosWebhook
}

