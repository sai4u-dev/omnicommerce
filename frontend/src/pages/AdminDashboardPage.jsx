import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, Database, PlusCircle, Check, Loader2, AlertCircle, ShoppingBag, Eye } from "lucide-react";

const AdminDashboardPage = () => {
  const { token, API_URL } = useApp();

  const [activeTab, setActiveTab] = useState("products");
  
  // Product creation form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [skinType, setSkinType] = useState("dry");
  const [concern, setConcern] = useState("hydration");
  const [ingredients, setIngredients] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("100");
  const [image, setImage] = useState("");
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [formMsg, setFormMsg] = useState("");
  const [formErr, setFormErr] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Fetch helper
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch categories for product form dropdown
        const catRes = await fetch(`${API_URL}/products/categories`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
          if (catData.length > 0) setCategoryId(catData[0].id);
        }

        // Fetch products catalog
        const prodRes = await fetch(`${API_URL}/products`);
        if (prodRes.ok) setProducts(await prodRes.json());

        // Fetch orders if admin is logged in
        if (token) {
          const ordRes = await fetch(`${API_URL}/admin/orders`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (ordRes.ok) setOrders(await ordRes.json());
        }
      } catch (err) {
        console.error("Admin fetching error:", err);
      }
    };

    fetchAdminData();
  }, [API_URL, token]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!title || !description || !price || !brand || !ingredients || !categoryId) {
      setFormErr("Please complete all required product properties");
      return;
    }

    setLoading(true);
    setFormErr("");
    setFormMsg("");

    try {
      const res = await fetch(`${API_URL}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title, description, price, brand, skinType, concern, ingredients, categoryId, stock, image
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const created = await res.json();
      setFormMsg("Product created and published successfully!");
      setProducts((prev) => [created, ...prev]);
      
      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setBrand("");
      setIngredients("");
      setImage("");
    } catch (err) {
      setFormErr(err.message || "Failed to publish product.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiDescription = async () => {
    if (!title || !brand || !ingredients) {
      setFormErr("Specify Title, Brand, and Active Ingredients before generating AI description.");
      return;
    }

    setAiGenerating(true);
    setFormErr("");
    try {
      const res = await fetch(`http://localhost:8000/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brand, skinType, concern, ingredients })
      });
      if (!res.ok) throw new Error("AI service description API failed");
      const result = await res.json();
      setDescription(result.description);
    } catch (err) {
      console.error(err);
      // Local fallback template
      setDescription(
        `Formulated by ${brand}, ${title} is a high-performance skincare solution engineered for ${skinType} skin. ` +
        `Infused with ${ingredients}, this active formula works targeting ${concern} to deliver a deeply balanced and glowing complexion. ` +
        `Apply smooth layers morning and night for peak barrier restoration.`
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'paid' : currentStatus === 'paid' ? 'shipped' : 'delivered';
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
      }
    } catch (err) {
      console.error("Order status update failed:", err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-10 flex flex-col gap-8 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-2">
          <Database className="h-7 w-7 text-amber-600" />
          CommerceOS Storefront Admin
        </h1>
        <p className="text-xs text-stone-500">Manage catalog products, stock levels, and dispatch client orders</p>
      </div>

      {/* Tabs selector */}
      <div className="flex gap-4 border-b border-stone-200">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "products" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"
          }`}
        >
          Product Catalog & Add
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "orders" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"
          }`}
        >
          Customer Orders ({orders.length})
        </button>
      </div>

      {/* Product Management Section */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Product manual creation form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-1.5">
              <PlusCircle className="h-5 w-5 text-amber-600" />
              Upload Skincare Product
            </h3>
            
            {formMsg && <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">{formMsg}</div>}
            {formErr && <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold">{formErr}</div>}

            <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Brand</label>
                  <input type="text" required placeholder="GlowGuide Care" value={brand} onChange={e => setBrand(e.target.value)} className="p-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50/50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Product Title</label>
                  <input type="text" required placeholder="Barrier Serum" value={title} onChange={e => setTitle(e.target.value)} className="p-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50/50" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Price ($)</label>
                  <input type="number" required step="0.01" placeholder="24.00" value={price} onChange={e => setPrice(e.target.value)} className="p-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50/50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Stock</label>
                  <input type="number" required placeholder="100" value={stock} onChange={e => setStock(e.target.value)} className="p-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50/50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="p-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Skin Type</label>
                  <select value={skinType} onChange={e => setSkinType(e.target.value)} className="p-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50">
                    <option value="dry">Dry</option>
                    <option value="oily">Oily</option>
                    <option value="sensitive">Sensitive</option>
                    <option value="combination">Combination</option>
                    <option value="all">All Types</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Target Concern</label>
                  <select value={concern} onChange={e => setConcern(e.target.value)} className="p-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50">
                    <option value="hydration">Hydration</option>
                    <option value="acne">Acne</option>
                    <option value="aging">Aging</option>
                    <option value="brightening">Brightening</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Active Ingredients</label>
                <input type="text" required placeholder="Centella Asiatica, Panthenol, Hyaluronic Acid" value={ingredients} onChange={e => setIngredients(e.target.value)} className="p-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50/50" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Image URL (Optional)</label>
                <input type="text" placeholder="https://unsplash..." value={image} onChange={e => setImage(e.target.value)} className="p-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50/50" />
              </div>

              {/* AI generator block */}
              <div className="flex flex-col gap-1 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-rose-600 fill-current animate-spin" />
                    AI Description Builder
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={aiGenerating}
                    className="text-[10px] bg-stone-900 text-white hover:bg-amber-600 py-1 px-2.5 rounded-full font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    {aiGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Write copy"}
                  </button>
                </div>
                <textarea
                  rows="3"
                  required
                  placeholder="Paste URL / click 'Write copy' to generate dynamic SEO copy..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="p-2.5 text-xs border border-stone-300 rounded-lg bg-white w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-900 hover:bg-stone-850 text-white text-xs font-semibold rounded-lg shadow-sm mt-1 transition-all"
              >
                {loading ? "Publishing Catalog Item..." : "Publish Product"}
              </button>
            </form>
          </div>

          {/* Right: Active catalog list */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-stone-900">Current Catalog ({products.length})</h3>
            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto pr-2">
              {products.map(p => (
                <div key={p.id} className="py-3.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.title} className="h-10 w-10 object-cover rounded-lg border border-stone-200" />
                    <div>
                      <p className="font-bold text-stone-850">{p.title}</p>
                      <p className="text-[10px] text-stone-400 uppercase font-semibold">{p.brand} • {p.skinType} skin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-stone-900">${p.price.toFixed(2)}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">{p.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Orders Management Section */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col gap-6">
          <h3 className="text-lg font-bold text-stone-900">Incoming Orders History</h3>
          
          {orders.length === 0 ? (
            <div className="py-20 text-center text-stone-400">
              <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-stone-300" />
              <p className="font-bold">No orders processed yet</p>
              <p className="text-xs">Incoming sales from customers will populate this dashboard.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3.5 pl-2 font-semibold">ID</th>
                    <th className="pb-3.5 font-semibold">Customer</th>
                    <th className="pb-3.5 font-semibold">Date</th>
                    <th className="pb-3.5 font-semibold">Total Price</th>
                    <th className="pb-3.5 font-semibold">Payment</th>
                    <th className="pb-3.5 font-semibold">Status</th>
                    <th className="pb-3.5 pr-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-650">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3.5 pl-2 font-mono text-[10px] text-stone-900">{o.id.substring(0, 8)}...</td>
                      <td className="py-3.5">
                        <p className="font-semibold text-stone-850">{o.user?.name}</p>
                        <p className="text-[10px] text-stone-400">{o.user?.email}</p>
                      </td>
                      <td className="py-3.5">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 font-bold text-stone-900">${o.totalPrice.toFixed(2)}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          o.status === 'delivered' ? 'bg-indigo-50 text-indigo-700' :
                          o.status === 'shipped' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        {o.status !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, o.status)}
                            className="bg-stone-900 hover:bg-amber-600 text-white px-3 py-1.5 rounded-full font-bold text-[10px]"
                          >
                            {o.status === 'pending' ? "Mark Paid" : o.status === 'paid' ? "Ship Order" : "Deliver Order"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
