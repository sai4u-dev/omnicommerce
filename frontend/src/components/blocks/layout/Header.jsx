import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { Sparkles, ShoppingBag, User, LogOut, Menu, X, BarChart3, Database } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, cart, logout } = useApp();
  const navigate = useNavigate();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-6 lg:px-12">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 p-2 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="serif-font text-2xl font-semibold tracking-wide text-stone-800">
            Glow<span className="text-amber-600 font-bold">Guide</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-stone-600">
          <Link to="/products" className="hover:text-amber-600 transition-colors">Shop</Link>
          <Link 
            to="/ai-shopping-assistant" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all font-semibold"
          >
            <Sparkles className="h-4 w-4" />
            AI Stylist
          </Link>
          
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/products" className="flex items-center gap-1 hover:text-amber-600 transition-colors">
                <Database className="h-4 w-4" />
                Products DB
              </Link>
              <Link to="/admin/analytics" className="flex items-center gap-1 hover:text-amber-600 transition-colors">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </>
          )}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/cart" className="relative p-2 text-stone-600 hover:text-amber-600 transition-colors">
            <ShoppingBag className="h-6 w-6" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white animate-pulse">
                {totalCartItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4 border-l border-stone-200 pl-4">
              <span className="text-sm font-medium text-stone-600">Hi, {user.name}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-stone-500 hover:text-rose-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-stone-600 hover:text-amber-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="rounded-full bg-stone-850 px-5 py-2 text-sm font-medium text-white hover:bg-stone-750 transition-all shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-4">
          <Link to="/cart" className="relative p-2 text-stone-600">
            <ShoppingBag className="h-6 w-6" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {totalCartItems}
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-stone-700 focus:outline-none"
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-rose-100 bg-white py-4 px-6 shadow-lg flex flex-col gap-4 animate-fadeIn">
          <Link to="/products" onClick={() => setIsMenuOpen(false)} className="py-2 text-stone-700 hover:text-amber-600 font-medium">Shop</Link>
          <Link 
            to="/ai-shopping-assistant" 
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-1.5 py-2 text-rose-600 font-semibold"
          >
            <Sparkles className="h-4 w-4" />
            AI Stylist
          </Link>
          
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/products" onClick={() => setIsMenuOpen(false)} className="py-2 text-stone-700 hover:text-amber-600 font-medium">Products DB</Link>
              <Link to="/admin/analytics" onClick={() => setIsMenuOpen(false)} className="py-2 text-stone-700 hover:text-amber-600 font-medium">Analytics</Link>
            </>
          )}

          <hr className="border-stone-100" />

          {user ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-stone-600">Hi, {user.name}</span>
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="flex items-center gap-2 py-2 text-rose-600 font-medium text-left"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="text-stone-700 hover:text-amber-600 font-medium text-center py-2 border border-stone-200 rounded-full"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMenuOpen(false)}
                className="bg-stone-800 text-white font-medium text-center py-2 rounded-full"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;