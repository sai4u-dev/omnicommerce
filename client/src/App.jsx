import './styles/App.css'

function App() {

  return (
    <> <div className="announce">Monsoon Sale: Up to 40% Off Rainy-Day Essentials</div>
      <header className='glass'>
        <div className="brand">Monsoon Market</div>
        <nav className="nav"><span>New Arrivals</span><span>Rainwear</span><span>Footwear</span><span>Umbrellas</span><span>Monsoon Sale</span></nav>
        <div className="icons"><div className="icon">⌕</div><div className="icon">♡</div><div className="icon">🛒</div></div>
      </header>
      <main className="wrap">
        <div className="breadcrumbs">Home / Rainwear / StormShield Jacket</div>
        <section className="product">
          <div className="gallery">
            <div className="thumbs"><div className="thumb active"></div><div className="thumb"></div><div className="thumb"></div><div className="thumb"></div></div>
            <div className="main-img">
              <div className="cloud c1"></div><div className="cloud c2"></div><div className="drops"></div>
              <div className="badge-img">MONSOON PICK</div>
              <div className="coat"><div className="hood"></div><div className="zip"></div><div className="pocket p1"></div><div className="pocket p2"></div></div>
            </div>
          </div>
          <div className="details">
            <div className="eyebrow">Weather-ready outerwear</div>
            <h1>StormShield Waterproof Jacket</h1>
            <div className="rating"><span className="stars">★★★★★</span><strong>4.8</strong><span>128 reviews</span></div>
            <div className="price-row"><div className="price">₹2,499</div><div className="old">₹3,499</div><div className="save">SAVE 29%</div></div>
            <p className="desc">A lightweight, breathable rain jacket made for sudden downpours. Sealed seams, quick-dry fabric, and a packable hood keep you comfortable without adding bulk.</p>
            <div className="feature-grid"><div className="feature">💧 Waterproof</div><div className="feature">⚡ Quick Dry</div><div className="feature">🛡 Wind Resistant</div></div>
            <div className="label">Choose size</div>
            <div className="sizes"><div className="size">S</div><div className="size active">M</div><div className="size">L</div><div className="size">XL</div></div>
            <div className="cta-row"><button >Add to Cart</button><button className="wish">♡</button></div>
            <div className="delivery"><div>🚚</div><div><strong>Fast monsoon delivery</strong><span>Delivered in 2–4 days with easy seasonal returns</span></div></div>
          </div>
        </section>
      </main></>
  )
}

export default App
