import nodemailer from 'nodemailer'

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { cart, total, orderTime } = req.body

  try {
    // Check if email is configured
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS

    if (emailConfigured) {
      // Create email transporter
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })

      // Format order details
      const orderItems = cart.map(item => {
        const addonsText = item.addons?.length
          ? ` + ${item.addons.map(a => a.name).join(', ')}`
          : ''
        return `- ${item.name} x${item.quantity}${addonsText} ($${item.total.toFixed(2)})`
      }).join('\n')

      const emailBody = `
New VOICE Order - QBeatAI

Order Time: ${new Date().toLocaleString()}
Order ID: VOICE-${Date.now()}

Items:
${orderItems}

Subtotal: ${(total - (total * 0.0975)).toFixed(2)}
Tax: ${(total * 0.0975).toFixed(2)}
Total: ${total.toFixed(2)}

---
Placed via Voice Ordering System
`

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || 'orders@qbeat.com',
        subject: `🎤 Voice Order - QBeatAI ($${total.toFixed(2)})`,
        text: emailBody
      })

      console.log('Voice order email sent successfully')
    } else {
      console.log('Email not configured. Voice order logged instead:')
      console.log('Voice Order Details:', { cart, total, timestamp: new Date().toISOString() })
    }

    res.json({ success: true, message: 'Voice order submitted successfully' })
  } catch (error) {
    console.error('Voice order submission failed:', error)
    res.status(500).json({ error: 'Failed to submit voice order' })
  }
}
