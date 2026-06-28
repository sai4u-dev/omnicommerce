import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Calendar, Sparkles, ArrowRight } from "lucide-react";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || "N/A";
  const sessionId = searchParams.get("session_id") || "N/A";

  return (
    <div className="mx-auto max-w-xl py-20 px-6 text-center">
      <div className="bg-white rounded-3xl border border-stone-200/50 p-8 md:p-12 shadow-xl flex flex-col items-center gap-6 relative overflow-hidden">
        {/* Sparkle decorative shapes */}
        <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 blur-2xl rounded-full" />
        
        {/* Animated Checkmark */}
        <div className="rounded-full bg-emerald-50 p-4 border border-emerald-100 text-emerald-600 animate-pulse">
          <CheckCircle className="h-12 w-12" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="serif-font text-3xl font-extrabold text-stone-900">Payment Successful!</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Thank you for shopping with GlowGuide. Your order has been registered and is undergoing formulation.
          </p>
        </div>

        {/* Order Details box */}
        <div className="w-full p-5 bg-stone-50 border border-stone-200/60 rounded-2xl flex flex-col gap-3 text-left text-sm text-stone-600">
          <div className="flex justify-between items-center pb-2.5 border-b border-stone-200/60">
            <span className="font-semibold text-stone-500">Order Reference</span>
            <span className="font-mono text-stone-950 font-bold text-xs">{orderId}</span>
          </div>
          <div className="flex justify-between items-center pb-2.5 border-b border-stone-200/60">
            <span className="font-semibold text-stone-500">Checkout Session</span>
            <span className="font-mono text-stone-900 text-xs truncate max-w-48">{sessionId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-stone-500">Fulfillment Status</span>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Paid / Preparing
            </span>
          </div>
        </div>

        {/* Action routing */}
        <div className="flex flex-col w-full gap-3 mt-2">
          <Link 
            to="/ai-shopping-assistant"
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-400 text-stone-950 hover:opacity-95 transition-all font-semibold flex items-center justify-center gap-2 shadow"
          >
            <Sparkles className="h-4.5 w-4.5" />
            Check Routine with AI Stylist
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            to="/products"
            className="w-full py-3.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold transition-all text-sm"
          >
            Browse More Products
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccessPage;
