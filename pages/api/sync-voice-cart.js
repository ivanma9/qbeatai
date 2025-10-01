export default function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { cart, total } = req.body

  // Log the cart sync (in production, you might store in session/database)
  console.log('Voice cart synced:', {
    itemCount: cart?.length || 0,
    total: total || 0
  })

  res.json({ success: true, cart, total })
}
