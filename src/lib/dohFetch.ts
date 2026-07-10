import https from 'node:https'

// Resolve a host's real IP addresses using Cloudflare's secure DNS-over-HTTPS (DoH) API
async function resolveHostIpsDoH(host: string): Promise<string[]> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`, {
      headers: { 'accept': 'application/dns-json' },
      signal: AbortSignal.timeout(3000)
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.Answer?.map((ans: any) => ans.data).filter(Boolean) || []
  } catch (err) {
    console.error(`DoH resolution error for ${host}:`, err)
    return []
  }
}

// Perform a native HTTPS fetch using Host headers over DoH-resolved IP addresses
export async function fetchViaDoH(targetUrl: string, responseType: 'text' | 'buffer' = 'text'): Promise<any> {
  const parsed = new URL(targetUrl)
  const host = parsed.hostname
  const requestPath = parsed.pathname + parsed.search

  const realIps = await resolveHostIpsDoH(host)
  if (realIps.length === 0) {
    throw new Error(`Failed to resolve any IPs for host: ${host}`)
  }

  // Iterate over resolved IPs until one succeeds
  for (let i = 0; i < realIps.length; i++) {
    const ip = realIps[i]
    try {
      const data = await new Promise((resolve, reject) => {
        const options = {
          hostname: ip,
          port: 443,
          path: requestPath,
          method: 'GET',
          rejectUnauthorized: false, // Bypass SSL altnames checks for direct IP queries
          timeout: 5000,
          headers: {
            'Host': host,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
          }
        }

        const req = https.request(options, (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Server returned status code ${res.statusCode}`))
            return
          }

          const chunks: any[] = []
          res.on('data', (chunk) => {
            chunks.push(chunk)
          })

          res.on('end', () => {
            const buffer = Buffer.concat(chunks)
            if (responseType === 'buffer') {
              resolve(buffer)
            } else {
              resolve(buffer.toString('utf8'))
            }
          })
        })

        req.on('error', (err) => {
          reject(err)
        })

        req.on('timeout', () => {
          req.destroy()
          reject(new Error('Timeout'))
        })

        req.end()
      })

      return data
    } catch (err: any) {
      console.warn(`IP ${ip} for host ${host} failed: ${err.message}. Trying next IP...`)
    }
  }

  throw new Error(`All resolved IPs for host ${host} failed. Check network connection.`)
}
