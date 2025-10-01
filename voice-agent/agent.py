import asyncio
import json
import logging
import aiohttp
import os
import difflib
from typing import Dict, List, Any, Optional
from livekit.agents import Agent, RunContext
from livekit.agents.llm import function_tool
from logger import setup_logger

# Setup logger for the agent
logger = setup_logger('qbeatai_agent', 'logs/agent.log')

# Common mispronunciations and aliases for menu items
ITEM_ALIASES = {
    # Breakfast items
    "sunrise crescent": "sunrise croissant",
    "sunrise crescant": "sunrise croissant", 
    "sunrise crossant": "sunrise croissant",
    "sunrise croisant": "sunrise croissant",
    "croissant": "sunrise croissant",
    "crescent": "sunrise croissant",
    "crescant": "sunrise croissant",
    "crossant": "sunrise croissant",
    "croisant": "sunrise croissant",
    
    # Lunch items - soups
    "tomato basil soup": "soup du jour",
    "tomato soup": "soup du jour", 
    "basil soup": "soup du jour",
    "soup of the day": "soup du jour",
    "daily soup": "soup du jour",
    "chef soup": "soup du jour",
    "chef's soup": "soup du jour",
    
    # Common variations
    "french onion": "french onion soup",
    "onion soup": "french onion soup",
    "cobb": "qbeatai cobb salad",
    "club sandwich": "california club sandwich",
    "club": "california club sandwich",
    "chicken salad": "chicken salad sandwich",
    "tuna salad": "nicoise tuna salad sandwich",
    "tuna": "nicoise tuna salad sandwich",
    "veggie": "veggie sandwich",
    "vegetarian": "veggie sandwich",
    "french dip": "french dip sandwich",
    "dip sandwich": "french dip sandwich",
    
    # Kids items
    "mac and cheese": "mac and cheese",
    "macaroni": "mac and cheese",
    "grilled cheese": "grilled cheese",
    "french toast": "french toast",
    
    # Additional common speech recognition variations
    "the suit": "soup du jour",  # Common misheard phrase for "soup"
    "suit": "soup du jour",
    "sweet": "soup du jour",
    "soot": "soup du jour",
    "shoot": "soup du jour",
    
    # More croissant variations
    "kwasant": "sunrise croissant",
    "kwassant": "sunrise croissant",
    "crossaint": "sunrise croissant",
    
    # Breakfast items
    "tartine": "la tartine",
    "granola": "granola parfait",
    "parfait": "granola parfait",
    "quiche": "quiche slice",
    "avocado": "avocado toast",
    "toast": "avocado toast",
    "pain": "pain perdu",
    "shakshuka": "shakshouka de tunis",
    "shaksuka": "shakshouka de tunis",
    "wrap": "french breakfast wrap",
    "benedict": "eggs benedict",
    "eggs": "eggs benedict",
    "skillet": "saucisse breakfast skillet"
}

# QBeatAI menu data structure (copied from Phase 1)
MENU_DATA = {
    "breakfast": [
        {"id": "la-tartine", "name": "La Tartine", "desc": "Freshly baked baguette, European style butter, homemade preserves.", "price": 8, "addons": []},
        {"id": "sunrise-croissant", "name": "Sunrise Croissant", "desc": "Three fresh-cracked scrambled eggs, cheddar cheese and pistachio pesto aioli.", "price": 12, "addons": [{"name": "Avocado", "price": 2}, {"name": "Bacon or ham", "price": 2}]},
        {"id": "granola-parfait", "name": "Granola Parfait", "desc": "House-made kefir yogurt topped with oat, flax seed, chia seed, assorted nuts and dried fruits granola with fresh seasonal berries.", "price": 9, "addons": []},
        {"id": "quiche-slice", "name": "Quiche Slice", "desc": "Your choice of: Ham & Bacon, Mushroom Bacon Leek, or Spinach & Cheese. Served with baguette.", "price": 11, "addons": []},
        {"id": "avocado-toast", "name": "Avocado Toast", "desc": "Toasted whole wheat bread, crispy bacon, two sunny side up eggs, pistachio pesto aioli, shaved French radish, marinated baby pear tomatoes.", "price": 13, "addons": []},
        {"id": "pain-perdu", "name": "Pain Perdu", "desc": "Homemade banana nut bread with cinnamon, fresh grated nutmeg and Tahitian vanilla bean, Chantilly cream, caramelized bananas and maple syrup.", "price": 10, "addons": []},
        {"id": "shakshouka", "name": "Shakshouka de Tunis", "desc": "Two eggs poached in roasted red bell pepper, tomatoes, onions and garlic, seasoned with Ras al Hanout. Served with sliced baguette.", "price": 14, "addons": [{"name": "Two Lamb Merguez meatballs", "price": 5}]},
        {"id": "french-wrap", "name": "French Breakfast Wrap", "desc": "Three scrambled eggs, roasted garlic and fresh herb cheese, avocado, Harissa, crispy bacon and breakfast potatoes.", "price": 12, "addons": []},
        {"id": "sams-sandwich", "name": "Sam's Breakfast Sandwich", "desc": "Roasted top sirloin cooked with onions, bell peppers and smoked gouda with farm fresh scrambled eggs on toasted baguette.", "price": 15, "addons": []},
        {"id": "eggs-benedict", "name": "Eggs Benedict", "desc": "Two soft poached eggs, shaved smoked ham, house-made brown butter and lemon hollandaise topped with crispy fried prosciutto and chives.", "price": 16, "addons": []},
        {"id": "saucisse-skillet", "name": "Saucisse Breakfast Skillet", "desc": "Saucisse de Toulouse with cheesy skillet potatoes, two sunny side up eggs, pickled sweet peppers, and harissa.", "price": 14, "addons": []}
    ],
    "kids": [
        {"id": "french-toast-kids", "name": "French Toast", "desc": "Brioche French toast served with berries, maple syrup, and powdered sugar.", "price": 7, "addons": []},
        {"id": "breakfast-plate-kids", "name": "Breakfast Plate", "desc": "Toasted baguette, two scrambled eggs, 1 slice of bacon, and fresh fruit.", "price": 8, "addons": []},
        {"id": "mac-cheese-kids", "name": "Mac and Cheese", "desc": "Classic mac and cheese with cheddar cheese and elbow macaroni served with fruit.", "price": 6, "addons": []},
        {"id": "grilled-cheese-kids", "name": "Grilled Cheese", "desc": "Melted cheddar cheese on toasted sourdough served with fresh fruit.", "price": 6, "addons": []}
    ],
    "lunch": [
        {"id": "soup-jour", "name": "Soup du Jour", "desc": "Chef's soup of the day served with toasted baguette.", "price": 7, "addons": []},
        {"id": "french-onion", "name": "French Onion Soup", "desc": "Classic onion soup with slowly caramelized onions, simmered beef broth, topped with toasted baguette and gruyere.", "price": 9, "addons": []},
        {"id": "cobb-salad", "name": "QBeatAI Cobb Salad", "desc": "Mixed baby lettuce, green beans, vine ripe tomatoes, soft boiled egg, crispy bacon, marinated grilled chicken, chives, avocado and blue cheese.", "price": 15, "addons": []},
        {"id": "countryside-salad", "name": "Countryside Salad", "desc": "Mixed baby lettuce, marinated grilled chicken, hearts of palm, artichoke hearts, julienne red onion, baby pear tomatoes, shaved gruyere.", "price": 14, "addons": []},
        {"id": "harvest-salad", "name": "Harvest Salad", "desc": "Mixed baby lettuce, toasted sliced almonds, feta cheese, shaved red onion, Persian cucumber, sliced strawberries, marinated grilled chicken.", "price": 14, "addons": []},
        {"id": "tuna-sandwich", "name": "Nicoise Tuna Salad Sandwich", "desc": "Albacore tuna, fresh avocado, vine-ripe tomatoes, romaine lettuce, and alfalfa sprouts on whole wheat bread or buttery croissant.", "price": 12, "addons": []},
        {"id": "california-club", "name": "California Club Sandwich", "desc": "Fresh sliced turkey, crispy bacon, avocado, romaine lettuce, vine ripe tomatoes, pistachio pesto aioli on fresh baked demi baguette.", "price": 13, "addons": []},
        {"id": "chicken-salad-sandwich", "name": "Chicken Salad Sandwich", "desc": "Romaine lettuce, marinated chicken breast, vine ripe tomato, toasted almonds, pink lady apple, minced celery, red onion, sun dried cranberries.", "price": 12, "addons": []},
        {"id": "chicken-pesto", "name": "Chicken Pesto Sandwich", "desc": "Marinated grilled chicken breast, red onion, red bell pepper, pistachio pesto aioli, vine ripe tomatoes, fresh spinach and Gruyere cheese.", "price": 13, "addons": []},
        {"id": "croque-monsieur", "name": "Croque Monsieur", "desc": "Classic French grilled ham & cheese covered with house-made béchamel sauce, gruyere cheese and chives on rustic sourdough.", "price": 11, "addons": [{"name": "Sunny side egg", "price": 2}]},
        {"id": "merguez-sandwich", "name": "Kaskrout Merguez Sandwich", "desc": "Pan roasted merguez sausage, Tunisian salad of cucumber, tomato, red onion, extra virgin olive oil, and harissa on toasted baguette.", "price": 14, "addons": []},
        {"id": "french-dip", "name": "French Dip Sandwich", "desc": "Roasted top round of beef, caramelized onions, gruyere cheese, horseradish crème fraiche, on fresh baked baguette served with onion soup.", "price": 16, "addons": []},
        {"id": "parisian-sandwich", "name": "Parisian Sandwich", "desc": "Thinly sliced French smoked ham, Porchetta, saucisson, gruyere cheese, baby arugula, dressed in red wine whole grain mustard vinaigrette.", "price": 15, "addons": []},
        {"id": "veggie-sandwich", "name": "Veggie Sandwich", "desc": "Marinated grilled eggplant, Persian cucumber, roasted red bell pepper, vine ripe tomatoes, alfalfa sprouts, roasted eggplant spread, pistachio basil pesto.", "price": 12, "addons": [{"name": "Fresh mozzarella", "price": 2}]}
    ]
}

class QBeatVoiceAgent(Agent):
    def __init__(self):
        logger.info("Initializing QBeatVoiceAgent")
        self.cart = []
        self.conversation_state = "greeting"
        self.transcript = []  # Store conversation transcript
        self.session_start_time = asyncio.get_event_loop().time()
        
        # Initialize the parent Agent with instructions
        super().__init__(
            instructions=self._get_base_instructions()
        )
        logger.info("QBeatVoiceAgent initialized with empty cart and greeting state")
        
        # Log session start
        self._add_to_transcript("SYSTEM", "Voice ordering session started")
    
    def _find_menu_item(self, item_name: str) -> Optional[Dict[str, Any]]:
        """Find menu item using fuzzy matching and aliases"""
        if not item_name:
            return None
            
        item_name_lower = item_name.lower().strip()
        logger.debug(f"Searching for menu item: '{item_name_lower}'")
        
        # First, check direct aliases
        if item_name_lower in ITEM_ALIASES:
            canonical_name = ITEM_ALIASES[item_name_lower]
            logger.debug(f"Found alias: '{item_name_lower}' -> '{canonical_name}'")
            item_name_lower = canonical_name.lower()
        
        # Direct name matching (exact or substring)
        for section_name, section_items in MENU_DATA.items():
            for item in section_items:
                item_name_menu = item["name"].lower()
                # Exact match or substring match
                if item_name_lower == item_name_menu or item_name_lower in item_name_menu:
                    logger.debug(f"Found exact/substring match: {item['name']} in {section_name}")
                    return item
                # Reverse substring match (menu item name in search term)
                if item_name_menu in item_name_lower:
                    logger.debug(f"Found reverse substring match: {item['name']} in {section_name}")
                    return item
        
        # Fuzzy matching using difflib for close matches
        all_items = []
        for section_items in MENU_DATA.values():
            all_items.extend(section_items)
        
        item_names = [item["name"].lower() for item in all_items]
        
        # Find close matches (similarity threshold of 0.6)
        close_matches = difflib.get_close_matches(item_name_lower, item_names, n=1, cutoff=0.6)
        
        if close_matches:
            matched_name = close_matches[0]
            for item in all_items:
                if item["name"].lower() == matched_name:
                    logger.debug(f"Found fuzzy match: '{item_name_lower}' -> '{item['name']}' (similarity match)")
                    return item
        
        # Try partial word matching for compound items
        words = item_name_lower.split()
        if len(words) > 1:
            for section_name, section_items in MENU_DATA.items():
                for item in section_items:
                    item_words = item["name"].lower().split()
                    # Check if any significant words match
                    matching_words = set(words) & set(item_words)
                    if len(matching_words) >= min(2, len(words) // 2 + 1):  # At least half the words or 2 words
                        logger.debug(f"Found partial word match: {item['name']} in {section_name} (words: {matching_words})")
                        return item
        
        logger.warning(f"No menu item found for: '{item_name}'")
        return None
    
    def _get_base_instructions(self) -> str:
        """Get base instructions for the agent"""
        return """You are a friendly voice assistant for QBeatAI in Orange County.

Keep responses under 10 seconds of speech. Be warm but efficient.

Menu sections:
- Breakfast: French classics, croissants, egg dishes ($8-16)
- Lunch: Sandwiches, salads, soups ($7-16)  
- Kids: Simple portions ($6-8)

When customer mentions a menu category, describe 2-3 popular items with prices.
When they ask about specific items, give brief description + price + suggest one add-on.
Always confirm before adding to cart: "Added [item] with [addon] for $[price]"

IMPORTANT: I have advanced fuzzy matching for menu items. If someone says "croissant", "crescent", "crescant", or similar variations, I can find "Sunrise Croissant". If they mention "tomato soup" or "basil soup", I'll suggest our "Soup du Jour" which is our chef's daily soup.

Use these functions: add_to_cart, get_menu_info, finalize_order"""

    def _add_to_transcript(self, speaker: str, message: str):
        """Add message to transcript with timestamp"""
        timestamp = asyncio.get_event_loop().time() - self.session_start_time
        entry = {
            "timestamp": f"{timestamp:.2f}s",
            "speaker": speaker,
            "message": message
        }
        self.transcript.append(entry)
        
        # Log to both agent log and transcript log
        logger.info(f"TRANSCRIPT [{speaker}] {message}")
        
        # Also log to a separate transcript file
        try:
            import datetime
            with open("logs/transcript.log", "a", encoding="utf-8") as f:
                dt = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                f.write(f"[{dt}] [{timestamp:.2f}s] {speaker}: {message}\n")
        except Exception as e:
            logger.warning(f"Failed to write to transcript file: {e}")

    def _log_conversation_state(self, state: str):
        """Log conversation state changes"""
        if state != self.conversation_state:
            self._add_to_transcript("SYSTEM", f"State changed: {self.conversation_state} → {state}")
            self.conversation_state = state

    @function_tool()
    async def add_to_cart(self, context: RunContext, item_name: str, quantity: int = 1, addons: Optional[List[str]] = None) -> str:
        """Add an item to the customer's cart.
        
        Args:
            item_name: The name of the menu item to add
            quantity: How many of this item to add (default: 1)  
            addons: List of addon names to include with the item
        """
        logger.info(f"Adding item to cart: {item_name}, quantity: {quantity}, addons: {addons}")
        addons = addons or []
        
        # Find menu item using fuzzy matching
        found_item = self._find_menu_item(item_name)
        
        if not found_item:
            logger.warning(f"Item not found in menu: {item_name}")
            return f"I couldn't find {item_name}. Could you try another item?"
            
        # Process add-ons
        logger.debug(f"Processing addons for {found_item['name']}: {addons}")
        selected_addons = []
        addon_cost = 0
        for addon_name in addons:
            for addon in found_item.get("addons", []):
                if addon_name.lower() in addon["name"].lower():
                    selected_addons.append(addon)
                    addon_cost += addon["price"]
                    logger.debug(f"Added addon: {addon['name']} (+${addon['price']})")
        
        if addons and not selected_addons:
            logger.warning(f"No matching addons found for: {addons}")
                    
        # Create cart item
        cart_item = {
            "id": found_item["id"],
            "name": found_item["name"],
            "quantity": quantity,
            "price": found_item["price"],
            "addons": selected_addons,
            "total": (found_item["price"] + addon_cost) * quantity
        }
        
        logger.info(f"Created cart item: {cart_item['name']} x{quantity} = ${cart_item['total']:.2f}")
        self.cart.append(cart_item)
        
        # Sync with web app
        logger.debug("Syncing cart with web application")
        await self.sync_cart()
        
        addon_text = f" with {', '.join([a['name'] for a in selected_addons])}" if selected_addons else ""
        response = f"Added {quantity} {found_item['name']}{addon_text} for ${cart_item['total']:.2f}. What else?"
        logger.info(f"Cart add successful: {response}")
        
        # Log to transcript
        self._add_to_transcript("AGENT", response)
        self._log_conversation_state("adding_items")
        
        return response

    @function_tool()
    async def get_menu_info(self, context: RunContext, section: Optional[str] = None, item_name: Optional[str] = None) -> str:
        """Get information about menu items or sections.
        
        Args:
            section: Menu section to browse (breakfast, lunch, or kids)
            item_name: Specific item name to get details about
        """
        logger.info(f"Getting menu info - section: {section}, item_name: {item_name}")
        
        if item_name:
            # Search for specific item using fuzzy matching
            logger.debug(f"Searching for specific item: {item_name}")
            found_item = self._find_menu_item(item_name)
            
            if found_item:
                addon_text = f" Add-ons available: {', '.join([a['name'] for a in found_item.get('addons', [])])}" if found_item.get("addons") else ""
                response = f"{found_item['name']} - {found_item['desc']} ${found_item['price']}.{addon_text}"
                logger.info(f"Found item info: {found_item['name']}")
                return response
            else:
                logger.warning(f"Item not found for menu info: {item_name}")
                # Suggest similar items or popular alternatives
                return f"I don't see {item_name} on our menu. Would you like to hear about our popular items instead?"
        
        elif section and section.lower() in MENU_DATA:
            # Get section items
            logger.debug(f"Getting section items for: {section}")
            items = MENU_DATA[section.lower()][:3]  # Top 3
            descriptions = [f"{item['name']} for ${item['price']}" for item in items]
            response = f"Popular {section} items: {', '.join(descriptions)}. Which interests you?"
            logger.info(f"Provided {section} menu info with {len(items)} items")
            return response
        
        else:
            logger.debug("Providing general menu overview")
            return "We have breakfast, lunch, and kids menus. Which would you like to hear about?"

    @function_tool()
    async def finalize_order(self, context: RunContext) -> str:
        """Complete and submit the customer's order with tax calculation."""
        logger.info("Finalizing order")
        
        if not self.cart:
            logger.warning("Attempted to finalize empty cart")
            return "Your cart is empty. What would you like to order?"
            
        total = self.calculate_total()
        tax = total * 0.0975  # CA tax
        final_total = total + tax
        
        logger.info(f"Order totals - Subtotal: ${total:.2f}, Tax: ${tax:.2f}, Final: ${final_total:.2f}")
        logger.info(f"Cart contents: {len(self.cart)} items: {[item['name'] for item in self.cart]}")
        
        # Submit order
        logger.info("Submitting order to backend")
        await self.submit_order(final_total)
        
        # Send completion notification to frontend
        await self.notify_order_completion(final_total)
        
        response = f"Perfect! Your order total is ${final_total:.2f}. We'll have it ready in 10-15 minutes. Your order has been confirmed and this call will now end. Thank you for choosing QBeatAI!"
        logger.info(f"Order finalized successfully: {response}")
        
        # Log to transcript
        self._add_to_transcript("AGENT", response)
        self._log_conversation_state("order_completed")
        
        # Log final transcript summary
        self._log_transcript_summary()
        
        # Schedule session disconnect after response
        asyncio.create_task(self.disconnect_after_delay(5.0))  # Give more time for TTS
        
        return response

    def calculate_total(self) -> float:
        total = sum(item["total"] for item in self.cart)
        logger.debug(f"Calculated cart total: ${total:.2f} from {len(self.cart)} items")
        return total

    async def sync_cart(self):
        """Sync cart with web app"""
        webapp_url = os.getenv('WEBAPP_URL')
        logger.debug(f"Syncing cart with web app at: {webapp_url}")
        
        try:
            cart_data = {"cart": self.cart, "total": self.calculate_total()}
            logger.debug(f"Syncing cart data: {len(self.cart)} items, total: ${cart_data['total']:.2f}")
            
            async with aiohttp.ClientSession() as session:
                await session.post(
                    f"{webapp_url}/api/sync-voice-cart",
                    json=cart_data
                )
            logger.info("Cart sync successful")
        except Exception as e:
            logger.warning(f"Cart sync failed: {e}", exc_info=True)

    async def submit_order(self, final_total: float):
        """Submit final order"""
        webapp_url = os.getenv('WEBAPP_URL')
        logger.info(f"Submitting order to: {webapp_url}")
        
        try:
            order_data = {
                "cart": self.cart,
                "total": final_total,
                "timestamp": asyncio.get_event_loop().time(),
                "status": "completed"
            }
            logger.info(f"Order data: {len(self.cart)} items, total: ${final_total:.2f}")
            logger.debug(f"Full order data: {order_data}")
            
            async with aiohttp.ClientSession() as session:
                response = await session.post(
                    f"{webapp_url}/api/submit-voice-order",
                    json=order_data
                )
                logger.info(f"Order submission response status: {response.status}")
                
            logger.info("Order submitted successfully")
        except Exception as e:
            logger.error(f"Order submission failed: {e}", exc_info=True)
            raise  # Re-raise to allow caller to handle

    async def notify_order_completion(self, final_total: float):
        """Notify frontend that order is complete"""
        webapp_url = os.getenv('WEBAPP_URL')
        logger.info("Notifying frontend of order completion")
        
        try:
            completion_data = {
                "type": "order_completed",
                "total": final_total,
                "message": "Order confirmed! Call ending in 3 seconds...",
                "disconnect_in": 3000  # milliseconds
            }
            
            async with aiohttp.ClientSession() as session:
                await session.post(
                    f"{webapp_url}/api/sync-voice-cart",
                    json=completion_data
                )
            logger.info("Order completion notification sent")
        except Exception as e:
            logger.warning(f"Failed to notify order completion: {e}")

    async def disconnect_after_delay(self, delay_seconds: float):
        """Disconnect the session after a delay"""
        logger.info(f"Scheduling session disconnect in {delay_seconds} seconds")
        await asyncio.sleep(delay_seconds)
        
        try:
            # Import here to avoid circular imports
            from livekit.agents import get_job_context
            
            logger.info("Initiating graceful session disconnect")
            
            # Get the current job context and room
            ctx = get_job_context()
            if ctx and ctx.room:
                # Disconnect from the room
                await ctx.room.disconnect()
                logger.info("Successfully disconnected from room")
            
            # Signal the job to shutdown (not awaitable)
            if ctx:
                ctx.shutdown()  # This is not async
                logger.info("Job context shutdown initiated")
                
        except Exception as e:
            logger.error(f"Error during session disconnect: {e}")
            # Force exit as fallback
            logger.info("Forcing process exit")
            import os
            os._exit(0)

    def _log_transcript_summary(self):
        """Log a summary of the entire conversation"""
        total_time = asyncio.get_event_loop().time() - self.session_start_time
        
        summary = f"""
=== CONVERSATION SUMMARY ===
Duration: {total_time:.2f} seconds
Cart Items: {len(self.cart)}
Final Total: ${self.calculate_total():.2f}
Final State: {self.conversation_state}

=== FULL TRANSCRIPT ===
"""
        
        for entry in self.transcript:
            summary += f"[{entry['timestamp']}] {entry['speaker']}: {entry['message']}\n"
        
        summary += "\n=== END TRANSCRIPT ===\n"
        
        logger.info(summary)
        
        # Also write to transcript file
        try:
            with open("logs/transcript.log", "a", encoding="utf-8") as f:
                f.write(summary + "\n")
        except Exception as e:
            logger.warning(f"Failed to write transcript summary: {e}")

