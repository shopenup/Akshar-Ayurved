import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = req.query.url
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url param' })
    return
  }

  try {
    const upstream = await fetch(url, {
      // Avoid cached originals when we want fresh bytes
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!upstream.ok || !upstream.body) {
      // Return 404 for any upstream errors to trigger fallback
      res.status(404).json({ error: 'Image not found' })
      return
    }

    // Mirror content type and stream
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    // CORS so client-side fetch can read the blob in any origin
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'private, max-age=0, no-cache')

    // Convert response to buffer and send
    const buffer = await upstream.arrayBuffer()
    res.send(Buffer.from(buffer))
    return
  } catch (e) {
    console.error('Image proxy error:', e)
    // Return 404 for any errors to trigger fallback
    res.status(404).json({ error: 'Image not found' })
  }
}


