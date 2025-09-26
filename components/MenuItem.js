import { useState } from 'react'

function MenuItem ({ item, onAddToCart }) {
  const [showAddons, setShowAddons] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState([])

  const handleAddToCart = () => {
    if (item.addons.length > 0 && !showAddons) {
      setShowAddons(true)
      return
    }

    onAddToCart({
      ...item,
      selectedAddons: selectedAddons.filter(addon => addon.selected)
    })

    setShowAddons(false)
    setSelectedAddons([])
  }

  const handleAddonChange = (addonIndex, checked) => {
    const newAddons = [...selectedAddons]
    const existingIndex = newAddons.findIndex(a => a.index === addonIndex)

    if (checked) {
      if (existingIndex === -1) {
        newAddons.push({
          ...item.addons[addonIndex],
          index: addonIndex,
          selected: true
        })
      }
    } else {
      if (existingIndex !== -1) {
        newAddons.splice(existingIndex, 1)
      }
    }

    setSelectedAddons(newAddons)
  }

  const getAddToCartText = () => {
    if (item.addons.length > 0 && !showAddons) {
      return 'Customize'
    }
    return showAddons ? 'Add to Cart' : 'Add to Cart'
  }

  return (
    <div className="card mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.desc}</p>
          <p className="text-primary-600 font-semibold text-lg">${item.price}</p>
        </div>
      </div>

      {showAddons && item.addons.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Add-ons:</h4>
          {item.addons.map((addon, index) => (
            <label key={index} className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                onChange={(e) => handleAddonChange(index, e.target.checked)}
              />
              <span className="ml-3 text-sm text-gray-700">
                {addon.name} (+${addon.price})
              </span>
            </label>
          ))}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowAddons(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="btn-primary flex-1"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {!showAddons && (
        <button
          onClick={handleAddToCart}
          className="btn-primary w-full mt-3"
        >
          {getAddToCartText()}
        </button>
      )}
    </div>
  )
}

export default MenuItem
