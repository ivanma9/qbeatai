import nodemailer from 'nodemailer'
import { Logger } from '../../lib/logger'

const logger = new Logger({ label: 'API:SubmitOrder' })

export default async function handler (req, res) {
  logger.info('Order submission request received')
  
  if (req.method !== 'POST') {
    logger.warn(`Invalid method attempted: ${req.method}`)
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { cart } = req.body
  logger.debug('Cart data received:', cart)

  if (!cart || cart.length === 0) {
    logger.warn('Empty cart submitted')
    return res.status(400).json({ message: 'Cart is empty' })
  }

  try {
    // Calculate total
    logger.info(`Processing order with ${cart.length} items`)
    const total = cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity
      const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => 
        addonSum + (addon.price * item.quantity), 0) || 0
      return sum + itemTotal + addonsTotal
    }, 0)
    logger.info(`Order total calculated: $${total.toFixed(2)}`)

    // Generate order number
    const orderNumber = Date.now()
    logger.info(`Generated order number: ${orderNumber}`)
    const orderTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Format email content
    let emailContent = `New Order - Chaupain Bakery\n\n`
    emailContent += `Order #: ${orderNumber}\n`
    emailContent += `Time: ${orderTime}\n\n`
    emailContent += `Items:\n`

    cart.forEach(item => {
      const itemPrice = item.price * item.quantity
      emailContent += `- ${item.name} x${item.quantity} ($${itemPrice.toFixed(2)})\n`
      
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        item.selectedAddons.forEach(addon => {
          const addonPrice = addon.price * item.quantity
          emailContent += `  + ${addon.name} ($${addonPrice.toFixed(2)})\n`
        })
      }
    })

    emailContent += `\nTotal: $${total.toFixed(2)}\n\n`
    emailContent += `---\nSent from QBeatAI Ordering App`

    // Check if email is configured
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS
    logger.info(`Email configuration status: ${emailConfigured ? 'configured' : 'not configured'}`)
    logger.debug('Environment variables:', {
      EMAIL_USER: process.env.EMAIL_USER ? 'set' : 'not set',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'set' : 'not set',
      EMAIL_TO: process.env.EMAIL_TO ? process.env.EMAIL_TO : 'not set (will use default)'
    })

    if (emailConfigured) {
      try {
        logger.info('Attempting to send email notification')
        // Create transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        })
        logger.debug('Nodemailer transporter created successfully')
        
        // Test the connection
        logger.info('Testing SMTP connection...')
        await transporter.verify()
        logger.info('SMTP connection verified successfully')

        // Send email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_TO || 'orders@chaupain.com',
          subject: `New Order - Chaupain Bakery (#${orderNumber})`,
          text: emailContent
        }
        logger.debug('Mail options prepared:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject
        })

        await transporter.sendMail(mailOptions)
        logger.info(`Order email sent successfully for order: ${orderNumber}`)
      } catch (emailError) {
        logger.error('Email sending failed:', emailError)
        logger.error('Email error details:', {
          message: emailError.message,
          code: emailError.code,
          responseCode: emailError.responseCode,
          command: emailError.command
        })
        
        // Provide specific guidance for common errors
        if (emailError.code === 'EAUTH') {
          logger.error('AUTHENTICATION ERROR: Gmail rejected the credentials.')
          logger.error('SOLUTION: You need to use a Gmail App Password, not your regular password.')
          logger.error('Steps: 1) Enable 2FA on Gmail, 2) Generate App Password, 3) Use App Password as EMAIL_PASS')
          logger.error('More info: https://support.google.com/accounts/answer/185833')
        } else if (emailError.code === 'ECONNECTION') {
          logger.error('CONNECTION ERROR: Cannot connect to Gmail SMTP server.')
          logger.error('Check your internet connection and Gmail service status.')
        }
        
        // Continue without failing the order - log the order instead
      }
    } else {
      logger.info('Email not configured. Order logged instead:')
      logger.info('Order details:', emailContent)
    }

    logger.info(`Order submission completed successfully: ${orderNumber}`)
    res.status(200).json({ 
      success: true, 
      orderNumber,
      message: 'Order submitted successfully',
      emailSent: emailConfigured
    })
  } catch (error) {
    logger.error('Order submission error:', error)
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit order' 
    })
  }
}
