import { useState } from 'react'

function Cart ({ cart, updateQuantity, removeItem, onSubmitOrder, isSubmitting }) {
  const [isOpen, setIsOpen] = useState(false)

  const total = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => 
      addonSum + (addon.price * item.quantity), 0) || 0
    return sum + itemTotal + addonsTotal
  }, 0)

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmit = async () => {
    if (cart.length === 0) return
    await onSubmitOrder()
  }

  return (
    <>
      {/* Cart Toggle Button - Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-lg z-50 lg:hidden"
      >
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          {itemCount > 0 && (
            <span className="bg-white text-primary-600 text-xs font-bold px-2 py-1 rounded-full">
              {itemCount}
            </span>
          )}
        </div>
      </button>

      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:translate-x-0 lg:relative lg:w-96 lg:shadow-none lg:border-l lg:border-gray-200`}>
        
        {/* Cart Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15" />
              </svg>
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={`${item.id}-${JSON.stringify(item.selectedAddons)}`} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.id, item.selectedAddons)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div className="mb-2">
                      {item.selectedAddons.map((addon, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          + {addon.name} (+${addon.price})
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedAddons, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        disabled={item.quantity <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedAddons, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                    <span className="font-semibold text-primary-600">
                      ${((item.price + (item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0)) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-primary-600">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default Cart
