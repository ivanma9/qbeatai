function CategoryTabs ({ activeCategory, onCategoryChange }) {
  const categories = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'kids', label: 'Kids' }
  ]

  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
      {categories.map((category) => (
        <button
          key={category.key}
          onClick={() => onCategoryChange(category.key)}
          className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
            activeCategory === category.key
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryTabs
