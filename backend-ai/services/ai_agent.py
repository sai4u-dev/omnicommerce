import os
import json
from services.db_client import fetch_all_products, get_mongo_db
from services.ai_search import perform_semantic_search

# Load LLMs if available
openai_key = os.environ.get("OPENAI_API_KEY")
gemini_key = os.environ.get("GEMINI_API_KEY")

llm = None
if gemini_key:
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=gemini_key)
        print("LangChain Chat: Initialized Gemini LLM.")
    except Exception as e:
        print(f"Failed to load Gemini LLM: {e}")
elif openai_key:
    try:
        from langchain_openai import ChatOpenAI
        llm = ChatOpenAI(model="gpt-4o-mini", api_key=openai_key)
        print("LangChain Chat: Initialized OpenAI LLM.")
    except Exception as e:
        print(f"Failed to load OpenAI LLM: {e}")

# Defining tools as functions
def tool_search_products(query: str):
    """Search catalog for skincare products."""
    results = perform_semantic_search(query, limit=4)
    return results

def tool_get_product_details(slug: str):
    """Retrieve detailed ingredients and descriptions for a specific product by slug."""
    products = fetch_all_products()
    for p in products:
        if p["slug"] == slug:
            return p
    return {"error": "Product not found"}

def tool_compare_products(slug_a: str, slug_b: str):
    """Compare ingredients and benefits of two products side-by-side."""
    p_a = tool_get_product_details(slug_a)
    p_b = tool_get_product_details(slug_b)
    
    if "error" in p_a or "error" in p_b:
        return {"error": "One or both products could not be found"}
        
    return {
        "product_a": {
            "title": p_a["title"],
            "price": p_a["price"],
            "skinType": p_a["skinType"],
            "concern": p_a["concern"],
            "ingredients": p_a["ingredients"],
            "description": p_a["description"]
        },
        "product_b": {
            "title": p_b["title"],
            "price": p_b["price"],
            "skinType": p_b["skinType"],
            "concern": p_b["concern"],
            "ingredients": p_b["ingredients"],
            "description": p_b["description"]
        }
    }

def tool_recommend_routine(skin_type: str, concern: str):
    """Suggest a complete multi-step routine based on skin type and concerns."""
    products = fetch_all_products()
    routine = []
    
    # We try to find a cleanser, a toner, a serum, and a moisturizer matching the skin_type/concern
    # If not matching exactly, fallback to generic
    categories_needed = ["Cleansers", "Toners", "Serums & Treatments", "Moisturizers", "Sunscreens"]
    
    # Simple rule-based match to assemble a cohesive routine
    for cat in categories_needed:
        match = None
        for p in products:
            # Match category or type
            # Check if this product is in the target category (we look up from the static list for simplicity)
            desc_lower = p["description"].lower()
            title_lower = p["title"].lower()
            
            is_cat = False
            if cat == "Cleansers" and ("cleanser" in title_lower or "wash" in desc_lower):
                is_cat = True
            elif cat == "Toners" and ("toner" in title_lower or "exfoliat" in desc_lower):
                is_cat = True
            elif cat == "Serums & Treatments" and ("serum" in title_lower or "spot" in title_lower or "treatment" in desc_lower):
                is_cat = True
            elif cat == "Moisturizers" and ("cream" in title_lower or "moisturizer" in desc_lower or "barrier" in desc_lower):
                is_cat = True
            elif cat == "Sunscreens" and ("sunscreen" in title_lower or "spf" in title_lower):
                is_cat = True
                
            if is_cat:
                # Check skinType match
                if p["skinType"] == skinType or p["skinType"] == "all" or skinType == "all":
                    # Check concern match
                    if p["concern"] == concern or concern == "all":
                        match = p
                        break
                    elif not match: # soft match if nothing matches concern
                        match = p
        if match:
            routine.append(match)
            
    return routine

def run_agent_fallback(message: str, chat_history: list) -> dict:
    """Fallback Rule-based Specialist Agent if no LLM key is configured."""
    msg = message.lower()
    suggested_products = []
    
    if "routine" in msg or "suggest" in msg or "routine plan" in msg or "recommend" in msg:
        # Determine skin type
        skin_type = "all"
        if "dry" in msg: skin_type = "dry"
        elif "oily" in msg: skin_type = "oily"
        elif "sensitive" in msg: skin_type = "sensitive"
        elif "combination" in msg or "combo" in msg: skin_type = "combination"
        
        # Determine concern
        concern = "all"
        if "acne" in msg or "breakout" in msg or "pimple" in msg: concern = "acne"
        elif "aging" in msg or "wrinkle" in msg or "fine line" in msg: concern = "aging"
        elif "bright" in msg or "spot" in msg or "hyperpigment" in msg: concern = "brightening"
        elif "hydrate" in msg or "dryness" in msg or "moist" in msg: concern = "hydration"

        routine = tool_recommend_routine(skin_type, concern)
        suggested_products = [p["id"] for p in routine]
        
        products_list = "\n".join([f"- **{p['title']}** (${p['price']}) - active ingredients: {p['ingredients']}" for p in routine])
        
        response_text = (
            f"Hello! As your GlowGuide AI Skincare Stylist, I've custom-designed a daily routine targeting "
            f"**{skin_type.capitalize()}** skin with **{concern.capitalize()}** concerns:\n\n"
            f"{products_list}\n\n"
            f"Would you like me to add this complete personalized routine to your cart?"
        )
    elif "compare" in msg:
        # Check slugs
        products = fetch_all_products()
        matched = [p for p in products if p["title"].lower().split()[0] in msg or p["slug"] in msg]
        
        if len(matched) >= 2:
            comparison = tool_compare_products(matched[0]["slug"], matched[1]["slug"])
            p_a = comparison["product_a"]
            p_b = comparison["product_b"]
            suggested_products = [matched[0]["id"], matched[1]["id"]]
            response_text = (
                f"Here is the comparison between **{p_a['title']}** and **{p_b['title']}**:\n\n"
                f"- **Active Ingredients**: \n  * *{p_a['title']}*: {p_a['ingredients']}\n  * *{p_b['title']}*: {p_b['ingredients']}\n"
                f"- **Skin Types**: \n  * *{p_a['title']}*: For {p_a['skinType']} concerns\n  * *{p_b['title']}*: For {p_b['skinType']} concerns\n"
                f"- **Price Point**: \n  * *{p_a['title']}*: ${p_a['price']}\n  * *{p_b['title']}*: ${p_b['price']}\n\n"
                f"**Recommendation**: {p_a['title']} is optimized for {p_a['concern']}, whereas {p_b['title']} targets {p_b['concern']}."
            )
        else:
            response_text = (
                "I see you want to compare products. Could you please specify which two items from our catalog? "
                "For example: 'Compare the Centella Cleanser and BHA Toner'."
            )
    elif "ingredients" in msg or "what is in" in msg:
        products = fetch_all_products()
        match = None
        for p in products:
            if p["title"].lower().split()[0] in msg or p["slug"] in msg:
                match = p
                break
        if match:
            suggested_products = [match["id"]]
            response_text = (
                f"The active ingredients in **{match['title']}** are:\n\n"
                f"**{match['ingredients']}**\n\n"
                f"This product is specially formulated for **{match['skinType']}** skin, working to target **{match['concern']}**."
            )
        else:
            response_text = "Which product's ingredients would you like to inspect? Let me know the product name!"
    else:
        # Standard general assistance search
        results = perform_semantic_search(message, limit=2)
        if results:
            suggested_products = [r["id"] for r in results]
            products_list = "\n".join([f"- **{r['title']}** (${r['price']}) - best for {r['skinType']} skin: {r['description']}" for r in results])
            response_text = (
                f"Based on your query, here are some curated skincare products I recommend:\n\n"
                f"{products_list}\n\n"
                f"Let me know if you would like more details about their ingredients or how to build a routine!"
            )
        else:
            response_text = "I'm here to help with your skincare journey. Ask me about custom routines (e.g. 'routine for dry skin'), ingredient lookups, or side-by-side product comparisons!"
            
    return {"response": response_text, "suggestedProducts": suggested_products}

def execute_chat_flow(session_id: str, message: str, user_id: str = "anonymous") -> dict:
    """Process chat flow. Interacts with MongoDB to save history and calls LLM / Fallback agent."""
    db = get_mongo_db()
    
    # 1. Fetch chat history from MongoDB
    history_logs = []
    if db is not None:
        try:
            session = db.chat_sessions.find_one({"sessionId": session_id})
            if session:
                history_logs = session.get("messages", [])
        except Exception as e:
            print(f"Failed to fetch session history: {e}")
            
    # Assemble chat history context
    history_context = []
    for h in history_logs[-6:]: # past 6 messages for context window
        history_context.append(f"{h['role'].capitalize()}: {h['content']}")
    history_string = "\n".join(history_context)
    
    # 2. Process query
    if llm is not None:
        try:
            prompt = (
                f"You are a licensed Skincare Specialist & Aesthetician running 'GlowGuide AI'.\n"
                f"You recommend products from the catalog. Here are the catalog products you have:\n"
                f"{json.dumps(fetch_all_products(), indent=2)}\n\n"
                f"Conversation History:\n{history_string}\n\n"
                f"User Message: {message}\n\n"
                f"Task:\n"
                f"Provide a friendly, helpful aesthetician response. Compare products, list active ingredients, or recommend routines.\n"
                f"Also, output a list of relevant product IDs that the user might want to buy in the JSON response format below.\n"
                f"Your output MUST be a valid JSON object in this format:\n"
                f"{{\n"
                f"  \"response\": \"Your text response to the customer here\",\n"
                f"  \"suggestedProducts\": [\"product-id-1\", \"product-id-2\"]\n"
                f"}}\n"
                f"Do not write anything other than this JSON string (do not use ```json markdown blocks, just raw JSON text)."
            )
            response = llm.invoke(prompt)
            result_text = response.content.strip()
            # Clean possible markdown wrap
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_json = json.loads(result_text.strip())
        except Exception as e:
            print(f"LangChain LLM query failed: {e}. Executing rule-based fallback.")
            result_json = run_agent_fallback(message, history_logs)
    else:
        result_json = run_agent_fallback(message, history_logs)
        
    # 3. Update history in MongoDB
    new_messages = [
        {"role": "user", "content": message, "timestamp": "2026-06-27T03:15:00Z"},
        {"role": "assistant", "content": result_json["response"], "suggestedProducts": result_json["suggestedProducts"], "timestamp": "2026-06-27T03:15:00Z"}
    ]
    
    if db is not None:
        try:
            db.chat_sessions.update_one(
                {"sessionId": session_id},
                {
                    "$set": {"userId": user_id},
                    "$push": {"messages": {"$each": new_messages}}
                },
                upsert=True
            )
            # Log AI events for dashboard analytics
            db.ai_logs.insert_one({
                "sessionId": session_id,
                "query": message,
                "response": result_json["response"],
                "suggestedCount": len(result_json["suggestedProducts"])
            })
        except Exception as e:
            print(f"Failed to write history/logs: {e}")
            
    return result_json
