const express = require('express')
const router = express.Router()
const { CONTACT_EMAIL } = require('../config/site')

// Contact/DMCA form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, category, message, urls } = req.body

    // Basic validation
    if (!name || !email || !category || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' })
    }

    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({ error: 'Message must be between 10 and 5000 characters' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Log the contact form submission (in production, you might want to send an email)
    console.log('Contact form submission:', {
      name,
      email,
      category,
      message: message.substring(0, 100) + '...',
      urls: urls || [],
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    })

    // In a real application, you would:
    // 1. Send an email to CONTACT_EMAIL with the form data
    // 2. Store the submission in a database
    // 3. Send an auto-reply to the user

    res.json({ 
      success: true, 
      message: 'Your message has been received. We will respond within 24-48 hours.' 
    })

  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
