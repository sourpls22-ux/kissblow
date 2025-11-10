/**
 * Get raw body from Next.js request stream
 * Required for webhook signature verification
 * @param {Object} req - Next.js request object
 * @returns {Promise<string>} - Raw body as string
 */
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    let data = ''
    
    req.on('data', chunk => {
      data += chunk.toString('utf8')
    })
    
    req.on('end', () => {
      resolve(data)
    })
    
    req.on('error', reject)
  })
}

module.exports = getRawBody

