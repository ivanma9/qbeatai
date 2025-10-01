import { AccessToken } from 'livekit-server-sdk'

export default function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const roomName = `qbeat-order-${Date.now()}`
    const participantName = `customer-${Math.random().toString(36).substr(2, 9)}`

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName
      }
    )

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    })

    const token = at.toJwt()

    res.json({
      token,
      url: process.env.LIVEKIT_URL,
      roomName
    })
  } catch (error) {
    console.error('Voice session creation failed:', error)
    res.status(500).json({ error: 'Failed to create voice session' })
  }
}
