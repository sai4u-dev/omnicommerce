import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useApp();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 || subtotal === 0 ? 0.00 : 5.00;
  const total = subtotal + tax + shipping;

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-10 flex flex-col gap-10">
      
      {/* Header */}
      <div className="text-left flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900">Your Shopping Cart</h1>
        <p className="text-stone-600">Review your products before checkout</p>
      </div>

      {cart.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-white rounded-3xl border border-stone-200/50 p-12 max-w-xl mx-auto shadow-sm">
          <div className="rounded-full bg-rose-50 p-6">
            <ShoppingBag className="h-10 w-10 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Your cart is empty</h2>
            <p className="text-sm text-stone-500 mt-1">Let's find the perfect skincare routine for you!</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link 
              to="/products" 
              className="px-6 py-3 bg-stone-900 hover:bg-stone-850 text-white font-semibold rounded-full text-sm shadow transition-all"
            >
              Shop Catalog
            </Link>
            <Link 
              to="/ai-shopping-assistant" 
              className="px-6 py-3 border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold rounded-full text-sm bg-white transition-all"
            >
              Consult AI Stylist
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 flex flex-col gap-6 text-left">
            <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm flex flex-col gap-6">
              {cart.map((item) => (
                <div 
                  key={`${item.productId}-${item.variantId}`}
                  className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pb-6 border-b border-stone-100 last:border-b-0 last:pb-0"
                >
                  {/* Thumbnail */}
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="h-20 w-20 object-cover rounded-xl border border-stone-200"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{item.brand}</p>
                    <p className="font-bold text-stone-850 text-base">{item.title}</p>
                    <p className="text-xs text-stone-500 font-semibold">{item.variantName}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center border border-stone-300 rounded-full overflow-hidden bg-stone-50">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="px-3 py-1 font-bold text-stone-500 hover:bg-stone-200"
                    >
                      -
                    </button>
                    <span className="px-2.5 text-stone-850 font-semibold text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="px-3 py-1 font-bold text-stone-500 hover:bg-stone-200"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right sm:w-24">
                    <span className="font-extrabold text-stone-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  {/* Trash */}
                  <button 
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Link to="/products" className="flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-stone-900">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
              <button 
                onClick={clearCart}
                className="text-sm font-semibold text-rose-600 hover:text-rose-700 underline"
              >
                Clear All Items
              </button>
            </div>
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="lg:col-span-4 text-left">
            <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm flex flex-col gap-6 sticky top-24">
              <h3 className="text-lg font-bold text-stone-900">Order Summary</h3>
              
              <div className="flex flex-col gap-4 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-stone-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 font-medium">
                    Spend ${(50 - subtotal).toFixed(2)} more for FREE shipping!
                  </p>
                )}
                
                <hr className="border-stone-100" />
                
                <div className="flex justify-between text-base font-extrabold text-stone-950">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 rounded-full bg-stone-900 text-white font-semibold hover:bg-stone-850 transition-all flex items-center justify-center gap-2 shadow"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default CartPage;
