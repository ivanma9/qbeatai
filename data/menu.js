export const menuData = {
  breakfast: [
    { id: 'la-tartine', name: 'La Tartine', desc: 'Freshly baked baguette, European style butter, homemade preserves.', price: 8, addons: [] },
    { id: 'sunrise-croissant', name: 'Sunrise Croissant', desc: 'Three fresh-cracked scrambled eggs, cheddar cheese and pistachio pesto aioli.', price: 12, addons: [{ name: 'Avocado', price: 2 }, { name: 'Bacon or ham', price: 2 }] },
    { id: 'granola-parfait', name: 'Granola Parfait', desc: 'House-made kefir yogurt topped with oat, flax seed, chia seed, assorted nuts and dried fruits granola with fresh seasonal berries.', price: 9, addons: [] },
    { id: 'quiche-slice', name: 'Quiche Slice', desc: 'Your choice of: Ham & Bacon, Mushroom Bacon Leek, or Spinach & Cheese. Served with baguette.', price: 11, addons: [] },
    { id: 'avocado-toast', name: 'Avocado Toast', desc: 'Toasted whole wheat bread, crispy bacon, two sunny side up eggs, pistachio pesto aioli, shaved French radish, marinated baby pear tomatoes.', price: 13, addons: [] },
    { id: 'pain-perdu', name: 'Pain Perdu', desc: 'Homemade banana nut bread with cinnamon, fresh grated nutmeg and Tahitian vanilla bean, Chantilly cream, caramelized bananas and maple syrup.', price: 10, addons: [] },
    { id: 'shakshouka', name: 'Shakshouka de Tunis', desc: 'Two eggs poached in roasted red bell pepper, tomatoes, onions and garlic, seasoned with Ras al Hanout. Served with sliced baguette.', price: 14, addons: [{ name: 'Two Lamb Merguez meatballs', price: 5 }] },
    { id: 'french-wrap', name: 'French Breakfast Wrap', desc: 'Three scrambled eggs, roasted garlic and fresh herb cheese, avocado, Harissa, crispy bacon and breakfast potatoes.', price: 12, addons: [] },
    { id: 'sams-sandwich', name: "Sam's Breakfast Sandwich", desc: 'Roasted top sirloin cooked with onions, bell peppers and smoked gouda with farm fresh scrambled eggs on toasted baguette.', price: 15, addons: [] },
    { id: 'eggs-benedict', name: 'Eggs Benedict', desc: 'Two soft poached eggs, shaved smoked ham, house-made brown butter and lemon hollandaise topped with crispy fried prosciutto and chives.', price: 16, addons: [] },
    { id: 'saucisse-skillet', name: 'Saucisse Breakfast Skillet', desc: 'Saucisse de Toulouse with cheesy skillet potatoes, two sunny side up eggs, pickled sweet peppers, and harissa.', price: 14, addons: [] }
  ],
  kids: [
    { id: 'french-toast-kids', name: 'French Toast', desc: 'Brioche French toast served with berries, maple syrup, and powdered sugar.', price: 7, addons: [] },
    { id: 'breakfast-plate-kids', name: 'Breakfast Plate', desc: 'Toasted baguette, two scrambled eggs, 1 slice of bacon, and fresh fruit.', price: 8, addons: [] },
    { id: 'mac-cheese-kids', name: 'Mac and Cheese', desc: 'Classic mac and cheese with cheddar cheese and elbow macaroni served with fruit.', price: 6, addons: [] },
    { id: 'grilled-cheese-kids', name: 'Grilled Cheese', desc: 'Melted cheddar cheese on toasted sourdough served with fresh fruit.', price: 6, addons: [] }
  ],
  lunch: [
    { id: 'soup-jour', name: 'Soup du Jour', desc: "Chef's soup of the day served with toasted baguette.", price: 7, addons: [] },
    { id: 'french-onion', name: 'French Onion Soup', desc: 'Classic onion soup with slowly caramelized onions, simmered beef broth, topped with toasted baguette and gruyere.', price: 9, addons: [] },
    { id: 'cobb-salad', name: 'Chaupain Cobb Salad', desc: 'Mixed baby lettuce, green beans, vine ripe tomatoes, soft boiled egg, crispy bacon, marinated grilled chicken, chives, avocado and blue cheese.', price: 15, addons: [] },
    { id: 'countryside-salad', name: 'Countryside Salad', desc: 'Mixed baby lettuce, marinated grilled chicken, hearts of palm, artichoke hearts, julienne red onion, baby pear tomatoes, shaved gruyere.', price: 14, addons: [] },
    { id: 'harvest-salad', name: 'Harvest Salad', desc: 'Mixed baby lettuce, toasted sliced almonds, feta cheese, shaved red onion, Persian cucumber, sliced strawberries, marinated grilled chicken.', price: 14, addons: [] },
    { id: 'tuna-sandwich', name: 'Nicoise Tuna Salad Sandwich', desc: 'Albacore tuna, fresh avocado, vine-ripe tomatoes, romaine lettuce, and alfalfa sprouts on whole wheat bread or buttery croissant.', price: 12, addons: [] },
    { id: 'california-club', name: 'California Club Sandwich', desc: 'Fresh sliced turkey, crispy bacon, avocado, romaine lettuce, vine ripe tomatoes, pistachio pesto aioli on fresh baked demi baguette.', price: 13, addons: [] },
    { id: 'chicken-salad-sandwich', name: 'Chicken Salad Sandwich', desc: 'Romaine lettuce, marinated chicken breast, vine ripe tomato, toasted almonds, pink lady apple, minced celery, red onion, sun dried cranberries.', price: 12, addons: [] },
    { id: 'chicken-pesto', name: 'Chicken Pesto Sandwich', desc: 'Marinated grilled chicken breast, red onion, red bell pepper, pistachio pesto aioli, vine ripe tomatoes, fresh spinach and Gruyere cheese.', price: 13, addons: [] },
    { id: 'croque-monsieur', name: 'Croque Monsieur', desc: 'Classic French grilled ham & cheese covered with house-made béchamel sauce, gruyere cheese and chives on rustic sourdough.', price: 11, addons: [{ name: 'Sunny side egg', price: 2 }] },
    { id: 'merguez-sandwich', name: 'Kaskrout Merguez Sandwich', desc: 'Pan roasted merguez sausage, Tunisian salad of cucumber, tomato, red onion, extra virgin olive oil, and harissa on toasted baguette.', price: 14, addons: [] },
    { id: 'french-dip', name: 'French Dip Sandwich', desc: 'Roasted top round of beef, caramelized onions, gruyere cheese, horseradish crème fraiche, on fresh baked baguette served with onion soup.', price: 16, addons: [] },
    { id: 'parisian-sandwich', name: 'Parisian Sandwich', desc: 'Thinly sliced French smoked ham, Porchetta, saucisson, gruyere cheese, baby arugula, dressed in red wine whole grain mustard vinaigrette.', price: 15, addons: [] },
    { id: 'veggie-sandwich', name: 'Veggie Sandwich', desc: 'Marinated grilled eggplant, Persian cucumber, roasted red bell pepper, vine ripe tomatoes, alfalfa sprouts, roasted eggplant spread, pistachio basil pesto.', price: 12, addons: [{ name: 'Fresh mozzarella', price: 2 }] }
  ]
}
