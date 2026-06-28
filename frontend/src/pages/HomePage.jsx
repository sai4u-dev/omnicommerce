import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck, HeartPulse, Sparkle } from "lucide-react";

const HomePage = () => {
  const concerns = [
    { name: "Acne & Breakouts", concernId: "acne", color: "from-purple-500/10 to-indigo-500/10 text-indigo-700 border-indigo-200" },
    { name: "Dryness & Dehydration", concernId: "hydration", color: "from-sky-500/10 to-blue-500/10 text-blue-700 border-blue-200" },
    { name: "Fine Lines & Wrinkles", concernId: "aging", color: "from-amber-500/10 to-rose-500/10 text-amber-700 border-amber-200" },
    { name: "Spots & Pigmentation", concernId: "brightening", color: "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200" }
  ];

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-amber-600" />,
      title: "LangChain AI Stylist",
      desc: "Get an interactive aesthetician consult that analyzes your concerns, compares chemical ingredients, and builds balanced routines."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-amber-600" />,
      title: "Curated Clean Ingredients",
      desc: "All products are highly vetted for efficacy, featuring active botanicals and dermatologically backed actives like Retinol and BHA."
    },
    {
      icon: <HeartPulse className="h-6 w-6 text-amber-600" />,
      title: "Skin-Barrier First",
      desc: "We prioritize moisture barrier recovery and calming formulas, ensuring your skin remains healthy, resilient, and hydrated."
    }
  ];

  return (
    <div className="flex flex-col gap-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FDFBF7] to-[#FAF8F5] pt-12 md:pt-20 pb-16 px-6 lg:px-12">
        {/* Soft Background shapes */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute top-80 -left-20 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />

        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex max-w-max items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3.5 py-1 text-xs font-semibold text-rose-700">
              <Sparkles className="h-3 w-3 animate-spin" />
              Revolutionary Skincare Guidance
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900 leading-tight">
              Your Personalized <br />
              <span className="bg-gradient-to-r from-amber-600 to-rose-500 bg-clip-text text-transparent">
                AI Skincare Specialist
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-2xl">
              Don't guess what skincare to buy. Chat with our intelligent aesthetician powered by LangChain to find products tailored exactly to your skin type, ingredients preferences, and targets.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link 
                to="/ai-shopping-assistant" 
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-rose-500 px-8 py-4 font-semibold text-white hover:opacity-90 shadow-md transition-all group"
              >
                <Sparkles className="h-5 w-5" />
                Start Chat Consultation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/products" 
                className="flex items-center justify-center rounded-full border border-stone-300 px-8 py-4 font-semibold text-stone-700 hover:bg-stone-50 transition-all bg-white"
              >
                Browse Catalog
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-square w-full rounded-2xl bg-gradient-to-tr from-amber-100 to-rose-100 p-4 shadow-xl border border-white/60 relative">
              <img 
                src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600&auto=format&fit=crop"
                alt="Beautiful skincare bottles" 
                className="h-full w-full object-cover rounded-xl shadow-inner mix-blend-multiply"
              />
              {/* Overlaid Float Pill */}
              <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md border border-rose-100 p-4 rounded-xl shadow-lg flex items-center gap-3 max-w-xs animate-bounce">
                <div className="p-2.5 rounded-full bg-amber-500 text-white">
                  <Sparkle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">AI Recommended</p>
                  <p className="text-sm font-bold text-stone-850">Ceramide Repair Cream</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop By Skin Concern */}
      <section className="mx-auto max-w-7xl w-full px-6 lg:px-12 text-center flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900">Shop by Skin Concern</h2>
          <p className="text-stone-600">Select your primary concern to filter our high-performance catalog</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {concerns.map((c) => (
            <Link
              key={c.name}
              to={`/products?concern=${c.concernId}`}
              className={`flex flex-col items-center justify-center p-8 rounded-2xl border bg-gradient-to-br ${c.color} hover:scale-[1.03] transition-all duration-300 shadow-sm cursor-pointer`}
            >
              <span className="serif-font text-lg font-bold">{c.name}</span>
              <span className="mt-2 text-xs flex items-center gap-1 font-semibold opacity-80">
                Explore catalog <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. AI Features Benefits */}
      <section className="bg-stone-50 border-y border-stone-200/50 py-16 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((f, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-4 bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
              <div className="rounded-full bg-rose-50 p-4 border border-rose-100">
                {f.icon}
              </div>
              <h3 className="serif-font text-xl font-bold text-stone-900">{f.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Action Banner Callout */}
      <section className="mx-auto max-w-7xl w-full px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 to-stone-800 py-16 px-8 md:px-16 text-center text-white shadow-xl">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-rose-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Ready for Your Ultimate Glowing Routine?
            </h2>
            <p className="text-stone-300 md:text-lg max-w-2xl leading-relaxed">
              No subscription, no strings. Just an advanced AI stylist analyzing product ingredients, matching them to your skin profile, and suggesting routines that work.
            </p>
            <Link 
              to="/ai-shopping-assistant"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-400 px-8 py-4 font-semibold text-stone-950 hover:opacity-95 shadow-lg transition-all"
            >
              <Sparkles className="h-5 w-5" />
              Chat With GlowGuide AI
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
