import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-stone-900 px-6 py-12 text-stone-300 md:px-12 border-t border-rose-100/10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Brand Block */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-white">
            <div className="rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 p-2 text-white shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="serif-font text-xl font-semibold tracking-wide">
              Glow<span className="text-amber-500 font-bold">Guide</span>
            </span>
          </div>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
            Smart skincare matching powered by advanced vector search and personalized LangChain AI stylists. Discover routines designed specifically for you.
          </p>
        </div>

        {/* Navigation Block */}
        <div>
          <h3 className="text-base font-semibold text-white">Navigation</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-400">
            <li>
              <Link to="/" className="transition-colors hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/products" className="transition-colors hover:text-white">Shop Products</Link>
            </li>
            <li>
              <Link to="/ai-shopping-assistant" className="transition-colors hover:text-white">AI Skincare Stylist</Link>
            </li>
          </ul>
        </div>

        {/* Contact Block */}
        <div>
          <h3 className="text-base font-semibold text-white">Customer Support</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-400">
            <li>FAQ & Guides</li>
            <li>Shipping & Return Policies</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Brand Meta Block */}
        <div>
          <h3 className="text-base font-semibold text-white">GlowGuide AI</h3>
          <div className="mt-4 space-y-2.5 text-sm text-stone-400">
            <p>
              Email: <span className="text-stone-300">support@glowguide.com</span>
            </p>
            <p>
              Hours: <span className="text-stone-300">Mon - Fri, 9am - 6pm EST</span>
            </p>
            <p className="text-xs text-stone-500">
              Disclaimer: GlowGuide AI offers cosmetic routine advice. Consult a dermatologist for chronic medical conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Legal section */}
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center gap-4 border-t border-stone-850 pt-6 text-center text-xs text-stone-500 md:flex-row md:justify-between md:text-left">
        <p>
          © {new Date().getFullYear()} GlowGuide AI. All rights reserved.
        </p>
        <div className="flex gap-4">
          <span className="hover:text-stone-400 cursor-pointer">Terms of Use</span>
          <span className="hover:text-stone-400 cursor-pointer">Cookie Settings</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;