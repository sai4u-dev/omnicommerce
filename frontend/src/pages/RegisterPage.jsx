import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Sparkles, KeyRound, Mail, User, AlertCircle } from "lucide-react";

const RegisterPage = () => {
  const { login, API_URL } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [registerErr, setRegisterErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setRegisterErr("All fields are required");
      return;
    }

    setLoading(true);
    setRegisterErr("");

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register user");
      }

      const data = await res.json();
      login(data.token, data.user);

      if (redirect === "checkout") {
        navigate("/checkout");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setRegisterErr(err.message || "Failed to register. Please try another email.");
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
          <h2 className="serif-font text-2xl font-extrabold text-stone-900 mt-1">Create Your Account</h2>
          <p className="text-xs text-stone-500">Register to track orders and consult our AI Stylist</p>
        </div>

        {registerErr && (
          <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{registerErr}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Sai Narendra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 bg-stone-50/50"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="sai@glowguide.com"
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
                placeholder="Minimum 6 characters"
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
            {loading ? "Creating Profile..." : "Create Account"}
          </button>
        </form>

        <p className="text-xs text-center text-stone-500">
          Already registered?{" "}
          <Link 
            to={redirect ? `/login?redirect=${redirect}` : "/login"} 
            className="text-amber-700 font-bold hover:underline"
          >
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
