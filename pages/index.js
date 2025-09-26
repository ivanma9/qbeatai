import { useState } from 'react'
import Head from 'next/head'
import { menuData } from '../data/menu'
import CategoryTabs from '../components/CategoryTabs'
import MenuItem from '../components/MenuItem'
import Cart from '../components/Cart'

export default function Home () {
  const [activeCategory, setActiveCategory] = useState('breakfast')
  const [cart, setCart] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)

  const addToCart = (item) => {
    const cartItem = {
      ...item,
      cartId: `${item.id}-${JSON.stringify(item.selectedAddons || [])}`
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.id === item.id && 
        JSON.stringify(cartItem.selectedAddons) === JSON.stringify(item.selectedAddons)
      )

      if (existingItemIndex > -1) {
        const newCart = [...prevCart]
        newCart[existingItemIndex].quantity += 1
        return newCart
      } else {
        return [...prevCart, { ...cartItem, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (itemId, selectedAddons, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId, selectedAddons)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId && JSON.stringify(item.selectedAddons) === JSON.stringify(selectedAddons)
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeItem = (itemId, selectedAddons) => {
    setCart(prevCart =>
      prevCart.filter(item =>
        !(item.id === itemId && JSON.stringify(item.selectedAddons) === JSON.stringify(selectedAddons))
      )
    )
  }

  const submitOrder = async () => {
    if (cart.length === 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cart })
      })

      if (response.ok) {
        setOrderSubmitted(true)
        setCart([])
      } else {
        throw new Error('Failed to submit order')
      }
    } catch (error) {
      alert('Failed to submit order. Please try again.')
      console.error('Order submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Head>
          <title>Order Placed - QBeatAI</title>
          <meta name="description" content="Your order has been placed successfully" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-6">We'll have it ready in 10-15 minutes.</p>
          <button
            onClick={() => setOrderSubmitted(false)}
            className="btn-primary w-full"
          >
            Place Another Order
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Order Online - QBeatAI</title>
        <meta name="description" content="Order delicious French-inspired food from Chaupain Bakery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 lg:mr-96">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">QBeatAI</h1>
                <p className="text-gray-600">Fresh French-inspired cuisine in Orange County</p>
              </div>
            </div>
          </header>

          {/* Menu Content */}
          <main className="max-w-4xl mx-auto px-4 py-6">
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            <div className="grid gap-4 md:grid-cols-2">
              {menuData[activeCategory]?.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </main>
        </div>

        {/* Cart Sidebar */}
        <Cart
          cart={cart}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          onSubmitOrder={submitOrder}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
