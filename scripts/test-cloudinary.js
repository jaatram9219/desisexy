const crypto = require('crypto')

const cloudName = 'jaat'
const apiKey = '695293672966725'
const apiSecret = '6TS_CG9zA3367W_Lk6I_6REwK5U'
const timestamp = Math.floor(Date.now() / 1000)

const params = { timestamp, folder: 'desisexy/thumbnails' }
const sortedParams = Object.keys(params).sort().map(k => k + '=' + params[k]).join('&')
const signature = crypto.createHash('sha1').update(sortedParams + apiSecret).digest('hex')

const body = new URLSearchParams({
  file: 'https://static-eu-cdn.eporner.com/thumbs/static4/1/17/175/17529740/9_240.jpg',
  api_key: apiKey,
  timestamp: timestamp.toString(),
  signature,
  folder: 'desisexy/thumbnails'
})

console.log('Testing Cloudinary upload...')
fetch('https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload', {
  method: 'POST',
  body,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}).then(r => r.json()).then(d => {
  if (d.secure_url) {
    console.log('SUCCESS! URL:', d.secure_url)
  } else {
    console.log('FAILED:', JSON.stringify(d, null, 2))
  }
}).catch(e => console.error('Error:', e.message))
