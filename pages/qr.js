import { useState, useEffect } from 'react'
import Head from 'next/head'
import QRCode from 'qrcode'

export default function QRGenerator () {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [appUrl, setAppUrl] = useState('')

  useEffect(() => {
    // Get the current URL or use a default for development
    const currentUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000'
    
    setAppUrl(currentUrl)

    // Generate QR code
    QRCode.toDataURL(currentUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then(url => {
        setQrCodeUrl(url)
      })
      .catch(err => {
        console.error('Error generating QR code:', err)
      })
  }, [])

  const downloadQR = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.download = 'qbeatai-qr-code.png'
    link.href = qrCodeUrl
    link.click()
  }

  const printQR = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>QR Code Generator - QBeatAI</title>
        <meta name="description" content="Generate QR code for QBeatAI ordering system" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable, .printable * {
              visibility: visible;
            }
            .printable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
          <p className="text-gray-600">Generate QR codes for table ordering at QBeatAI</p>
        </header>

        {/* QR Code Display */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center printable">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-600 mb-2">QBeatAI</h2>
            <p className="text-gray-600 mb-4">Scan to Order</p>
            
            {qrCodeUrl ? (
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code for QBeatAI Ordering" 
                  className="mx-auto"
                />
              </div>
            ) : (
              <div className="w-72 h-72 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-gray-500">Generating QR Code...</div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 mb-4">
            <p>1. Scan the QR code with your phone camera</p>
            <p>2. Browse our menu and add items to cart</p>
            <p>3. Place your order - we'll have it ready in 10-15 minutes!</p>
          </div>

          <div className="text-xs text-gray-400 border-t pt-4">
            <p>URL: {appUrl}</p>
            <p>Fresh French-inspired cuisine in Orange County</p>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center no-print">
          <button
            onClick={downloadQR}
            className="btn-primary"
            disabled={!qrCodeUrl}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-6 0H8a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-4z" />
            </svg>
            Download QR Code
          </button>
          
          <button
            onClick={printQR}
            className="btn-secondary"
            disabled={!qrCodeUrl}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print QR Code
          </button>

          <a
            href="/"
            className="btn-secondary text-center"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            View Ordering App
          </a>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 no-print">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">For Restaurant Staff:</h4>
              <ul className="space-y-1">
                <li>• Print QR codes and place them on tables</li>
                <li>• Download PNG files for digital displays</li>
                <li>• Each QR code links to the same ordering system</li>
                <li>• Orders will be emailed to your configured address</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">For Customers:</h4>
              <ul className="space-y-1">
                <li>• Scan QR code with phone camera</li>
                <li>• Browse menu by category (Breakfast/Lunch/Kids)</li>
                <li>• Add items and customize with add-ons</li>
                <li>• Review cart and place order</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
