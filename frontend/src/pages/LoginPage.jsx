import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Sparkles, KeyRound, Mail, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const { login, API_URL } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginErr("Email and password are required");
      return;
    }

    setLoading(true);
    setLoginErr("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login credentials invalid");
      }

      const data = await res.json();
      login(data.token, data.user);
      
      // Redirect appropriately
      if (redirect === "checkout") {
        navigate("/checkout");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setLoginErr(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-20 px-6 text-left">
      <div className="bg-white rounded-3xl border border-stone-200/60 p-8 shadow-xl flex flex-col gap-6">
        
        {/* Title */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 p-2.5 text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="serif-font text-2xl font-extrabold text-stone-900 mt-1">Sign In to GlowGuide</h2>
          <p className="text-xs text-stone-500">Access personalized AI consultations and catalog orders</p>
        </div>

        {loginErr && (
          <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{loginErr}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="customer@glowguide.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 bg-stone-50/50"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 bg-stone-50/50"
              />
              <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-stone-900 text-white font-semibold hover:bg-stone-850 transition-all text-sm mt-2 shadow"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-center text-stone-500">
          New to GlowGuide?{" "}
          <Link 
            to={redirect ? `/register?redirect=${redirect}` : "/register"} 
            className="text-amber-700 font-bold hover:underline"
          >
            Register account
          </Link>
        </p>

        {/* Demo login accounts note */}
        <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl text-[10px] text-stone-500 leading-normal">
          <p className="font-bold mb-0.5 text-stone-700">Quick Access Demo Logs:</p>
          <p>• Client Account: <span className="font-mono text-stone-800 font-bold">customer@glowguide.com</span> / <span className="font-mono text-stone-800 font-bold">user123</span></p>
          <p>• Administrator: <span className="font-mono text-stone-800 font-bold">admin@glowguide.com</span> / <span className="font-mono text-stone-800 font-bold">admin123</span></p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
