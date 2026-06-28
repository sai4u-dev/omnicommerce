import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ArrowLeft, CreditCard, ShieldAlert } from "lucide-react";

const CheckoutPage = () => {
  const { cart, token, user, API_URL } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0.00 : 5.00;
  const total = subtotal + tax + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setCheckoutError("Please login or create an account to proceed with checkout.");
      return;
    }
    if (!address || !city || !zip) {
      setCheckoutError("Please fill out all shipping details.");
      return;
    }

    setLoading(true);
    setCheckoutError("");

    try {
      // 1. Place the order
      const fullAddress = `${address}, ${city}, ZIP: ${zip}`;
      const orderRes = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          totalPrice: total,
          shippingAddr: fullAddress
        })
      });

      if (!orderRes.ok) throw new Error("Failed to place order.");
      const orderData = await orderRes.json();
      const orderId = orderData.orderId;

      // 2. Generate Checkout session
      const checkoutSessionRes = await fetch(`${API_URL}/payments/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });

      if (!checkoutSessionRes.ok) throw new Error("Failed to initialize checkout gateway.");
      const sessionData = await checkoutSessionRes.json();

      // 3. Redirect to Stripe Checkout or Simulation Gateway
      if (sessionData.url) {
        window.location.href = sessionData.url;
      } else {
        throw new Error("Invalid gateway response URL.");
      }
    } catch (err) {
      console.error(err);
      setCheckoutError(err.message || "An error occurred during checkout processing.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-10 flex flex-col gap-10">
      
      {/* Back button */}
      <div className="text-left">
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" />
          Return to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Shipping details form */}
        <div className="lg:col-span-7 text-left flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-stone-200/60 p-8 shadow-sm flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-stone-900">Shipping Details</h2>
            
            {checkoutError && (
              <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {!token && (
              <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-sm leading-relaxed mb-2">
                You are currently checking out as guest. Please{" "}
                <Link to="/login?redirect=checkout" className="underline font-bold text-amber-900 hover:text-amber-850">
                  login to your account
                </Link>{" "}
                or{" "}
                <Link to="/register?redirect=checkout" className="underline font-bold text-amber-900 hover:text-amber-850">
                  register
                </Link>{" "}
                to save orders to your dashboard.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    disabled={!token}
                    placeholder="Sai Narendra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 bg-stone-50/50 disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={!token}
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 bg-stone-50/50 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  required
                  disabled={!token}
                  placeholder="Apartment, suite, unit, building, floor..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    disabled={!token}
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 bg-stone-50/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">ZIP / Postal Code</label>
                  <input
                    type="text"
                    required
                    disabled={!token}
                    placeholder="10001"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 bg-stone-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-4 mt-2 rounded-full bg-stone-900 text-white font-semibold hover:bg-stone-850 transition-all flex items-center justify-center gap-2 shadow disabled:opacity-50"
              >
                <CreditCard className="h-5 w-5" />
                {loading ? "Initializing Secure Gateway..." : `Pay $${total.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Checkout summary sidebar */}
        <div className="lg:col-span-5 text-left">
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm flex flex-col gap-6">
            <h3 className="text-lg font-bold text-stone-900">Your Items</h3>
            
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="h-12 w-12 object-cover rounded-lg border border-stone-200"
                    />
                    <div>
                      <p className="font-bold text-stone-800 line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-stone-400 font-semibold">{item.variantName} x {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className="border-stone-100" />

            <div className="flex flex-col gap-4 text-xs text-stone-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-stone-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-stone-800">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <hr className="border-stone-100" />
              <div className="flex justify-between text-base font-extrabold text-stone-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
