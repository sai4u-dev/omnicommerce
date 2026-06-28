import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, Send, ShoppingCart, Info, RotateCcw, MessageSquare, BookOpen } from "lucide-react";

const AIShoppingAssistantPage = () => {
  const { addToCart, sessionId, API_URL, user } = useApp();
  
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your GlowGuide AI Skincare Stylist. Ask me to design a daily routine (e.g., 'suggest routine for oily skin with acne'), compare ingredients, or explain how different products target your concerns!"
    }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  
  // Suggested products recommended by AI
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Quick prompt buttons
  const promptPrompts = [
    "Design a routine for dry skin",
    "Suggest a plan for oily skin and acne",
    "Compare Centella Cleanser and BHA Toner",
    "What ingredients are in the Retinol Cream?"
  ];

  // Fetch product models based on IDs suggested by AI
  const fetchSuggestedProducts = async (productIds) => {
    if (!productIds || productIds.length === 0) return;
    setLoadingProducts(true);
    try {
      const fetched = [];
      for (const pid of productIds) {
        const res = await fetch(`${API_URL}/products/${pid}`);
        if (res.ok) {
          const prod = await res.json();
          fetched.push(prod);
        }
      }
      setRecommendedProducts(fetched);
    } catch (err) {
      console.error("Failed to load suggested products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    if (!textToSend) setInput("");
    setSending(true);

    try {
      const res = await fetch(`http://localhost:8000/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          userId: user?.id || "anonymous"
        })
      });

      if (!res.ok) throw new Error("AI Service offline");
      const data = await res.json();

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      
      if (data.suggestedProducts && data.suggestedProducts.length > 0) {
        fetchSuggestedProducts(data.suggestedProducts);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant", 
          content: "Sorry, I am having trouble connecting to the AI brain. Let me know if you would like me to try again!" 
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleAddAllToCart = () => {
    if (recommendedProducts.length === 0) return;
    recommendedProducts.forEach((p) => {
      addToCart(p, 1, p.variants?.[0]?.id);
    });
    alert("Success: Added all recommended routine products to your cart!");
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-8 flex flex-col gap-8 h-[calc(100vh-10rem)]">
      
      {/* Title block */}
      <div className="text-left flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500 fill-current" />
            Skincare AI Stylist
          </h1>
          <p className="text-xs text-stone-500">Personalized aesthetician routines powered by LangChain</p>
        </div>
        <button 
          onClick={() => {
            setMessages([{
              role: "assistant",
              content: "Hello! I am your GlowGuide AI Skincare Stylist. Ask me to design a daily routine (e.g., 'suggest routine for oily skin with acne'), compare ingredients, or explain how different products target your concerns!"
            }]);
            setRecommendedProducts([]);
          }}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-850 border border-stone-200 bg-white px-3 py-1.5 rounded-full font-medium"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Main Double-Pane Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* Left Pane: Chat box (7 columns) */}
        <div className="lg:col-span-7 flex flex-col border border-stone-200 bg-white rounded-3xl overflow-hidden shadow-sm h-full min-h-0">
          
          {/* Thread list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/50">
            {messages.map((m, idx) => (
              <div 
                key={idx}
                className={`flex gap-3 max-w-[85%] text-left ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Profile icon */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  m.role === 'user' ? 'bg-stone-800' : 'bg-gradient-to-tr from-amber-500 to-rose-400'
                }`}>
                  {m.role === 'user' ? 'U' : <Sparkles className="h-4 w-4" />}
                </div>

                {/* Message body */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-[#EAE4DC] text-stone-900 rounded-tr-none'
                    : 'bg-white text-stone-850 rounded-tl-none border border-stone-100'
                }`}>
                  {m.content.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className={line ? 'mb-2 last:mb-0' : 'h-2'} style={{ minHeight: '0.5rem' }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestions */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-stone-100 bg-white flex flex-wrap gap-2 justify-center">
              {promptPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  className="text-xs font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-250 px-3.5 py-2 rounded-full transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Form sender */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-4 border-t border-stone-100 bg-white flex gap-3"
          >
            <input
              type="text"
              placeholder="Ask the AI Stylist..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-full border border-stone-300 focus:outline-none focus:border-amber-600 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-3 rounded-full bg-stone-900 text-white hover:bg-amber-600 transition-colors shadow disabled:opacity-50"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>

        {/* Right Pane: Recommendations Sidebar (5 columns) */}
        <div className="lg:col-span-5 flex flex-col border border-stone-200 bg-white rounded-3xl shadow-sm h-full min-h-0">
          <div className="p-5 border-b border-stone-100 text-left flex justify-between items-center bg-stone-50/50">
            <div>
              <h2 className="font-bold text-stone-850 flex items-center gap-1.5 text-base">
                <BookOpen className="h-5 w-5 text-amber-600" />
                AI Curated Routine
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">Products matches based on the chat profile</p>
            </div>
            
            {recommendedProducts.length > 0 && (
              <button
                onClick={handleAddAllToCart}
                className="px-3.5 py-2 rounded-full bg-stone-850 hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add Routine
              </button>
            )}
          </div>

          {/* Sidebar catalog list */}
          <div className="flex-1 overflow-y-auto p-5 text-left space-y-4">
            {loadingProducts ? (
              <div className="py-20 flex flex-col justify-center items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
                <span className="text-xs text-stone-500">Assembling formula profiles...</span>
              </div>
            ) : recommendedProducts.length === 0 ? (
              <div className="py-24 text-center text-stone-400 flex flex-col items-center gap-2">
                <MessageSquare className="h-10 w-10 opacity-40 text-stone-500" />
                <p className="text-sm font-bold">No matches selected yet</p>
                <p className="text-xs px-10">Ask GlowGuide AI to suggest products or a daily skin routine to populate this checklist!</p>
              </div>
            ) : (
              recommendedProducts.map((p) => (
                <div 
                  key={p.id}
                  className="flex gap-4 p-4 border border-stone-100 rounded-2xl bg-stone-50/30 hover:border-amber-100 transition-all group"
                >
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    className="h-16 w-16 object-cover rounded-xl border border-stone-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none">{p.brand}</p>
                    <h4 className="font-bold text-stone-800 text-sm mt-1 truncate">{p.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
                        {p.skinType} skin
                      </span>
                      <span className="text-sm font-extrabold text-stone-900">${p.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-2">
                    <button
                      onClick={() => addToCart(p, 1, p.variants?.[0]?.id)}
                      className="p-2 bg-white border border-stone-300 hover:border-amber-600 hover:bg-amber-50 rounded-full transition-all shadow-sm"
                      title="Add to cart"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 text-stone-750 group-hover:text-amber-700" />
                    </button>
                    <Link
                      to={`/products/${p.id}`}
                      className="p-2 bg-white border border-stone-300 hover:border-stone-900 rounded-full transition-all shadow-sm"
                      title="View details"
                    >
                      <Info className="h-3.5 w-3.5 text-stone-500" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIShoppingAssistantPage;
