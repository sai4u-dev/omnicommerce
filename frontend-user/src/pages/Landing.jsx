import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { isAuthenticated } = useAuth()
  return (
    <>
      <Navbar />
      <main className="landing">
        {/* Hero */}
        <section className="hero-fashion">
          <div className="hero-text">
            <p className="eyebrow">FALL / WINTER 2026 — NEW COLLECTION</p>
            <h1 className="hero-title">
              <span>Define</span>
              <span className="hero-serif">Your</span>
              <span>Style</span>
            </h1>
            <p className="hero-desc">
              Curated fashion for the modern wardrobe. Timeless silhouettes, sustainable fabrics, effortless elegance.
            </p>
            <div className="hero-ctas">
              <Link to={isAuthenticated ? '/home' : '/signup'} className="btn btn-dark btn-lg">Explore Collection →</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </div>
            <div className="hero-stats">
              <div><strong>50k+</strong><span>Happy Customers</span></div>
              <div><strong>4.8★</strong><span>Rated Excellence</span></div>
              <div><strong>24h</strong><span>Fast Delivery</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card main">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" alt="Fashion model" />
              <div className="card-badge">NEW IN • ₹2,499</div>
            </div>
            <div className="hero-card float top">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" alt="Look" />
              <span>Street Edit</span>
            </div>
            <div className="hero-card float bottom">
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80" alt="Look" />
              <span>Summer Dress</span>
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="brands">
          <p>TRUSTED BY STYLE EDITORS AT</p>
          <div className="brand-list">
            <span>VOGUE</span><span>ELLE</span><span>GQ</span><span>COSMOPOLITAN</span><span>HARPER'S</span>
          </div>
        </section>

        {/* Collections */}
        <section id="collections" className="collections">
          <div className="section-head">
            <h2>Shop by Category</h2>
            <p>Effortless fashion for every moment — from runway to real life</p>
          </div>
          <div className="collection-grid">
            <Link to={isAuthenticated ? '/home?category=women' : '/signup'} className="collection-card tall">
              <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80" alt="Women" />
              <div className="overlay">
                <h3>Women's Wear</h3><span>Explore →</span>
              </div>
            </Link>
            <div className="collection-stack">
              <Link to={isAuthenticated ? '/home?category=men' : '/signup'} className="collection-card">
                <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&q=80" alt="Men" />
                <div className="overlay"><h3>Men's Wear</h3><span>Explore →</span></div>
              </Link>
              <Link to={isAuthenticated ? '/home?category=accessories' : '/signup'} className="collection-card">
                <img src="https://images.unsplash.com/photo-1611923134239-b9be5816ff5e?w=600&q=80" alt="Accessories" />
                <div className="overlay"><h3>Accessories</h3><span>Explore →</span></div>
              </Link>
            </div>
            <Link to={isAuthenticated ? '/home?category=footwear' : '/signup'} className="collection-card tall">
              <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80" alt="Footwear" />
              <div className="overlay"><h3>Footwear</h3><span>Explore →</span></div>
            </Link>
          </div>
          <div className="collection-grid small">
            <Link to="/home" className="collection-card sm"><img src="https://images.unsplash.com/photo-1560506840-ec148e82a604?w=500" alt="Kids" /><div className="overlay small"><h3>Kids</h3></div></Link>
            <div className="promo-card">
              <p className="eyebrow">LIMITED TIME</p>
              <h3>Up to 50% off Sale</h3>
              <p>Final pieces from Summer’26 archive.</p>
              <Link to={isAuthenticated ? '/home?category=sale' : '/signup'} className="btn btn-dark">Shop Sale</Link>
            </div>
          </div>
        </section>

        {/* Editorial */}
        <section className="editorial">
          <div className="editorial-text">
            <p className="eyebrow">CRAFT & CARE</p>
            <h2>The Modern<br /><em>Essential</em> Wardrobe</h2>
            <p>Every VÉLORA piece is designed to outlive trends. Organic cotton, deadstock fabrics, artisan detailing — slow fashion with a point of view.</p>
            <ul className="check-list">
              <li>✓ Sustainable & traceable sourcing</li>
              <li>✓ Free 30-day returns & exchanges</li>
              <li>✓ Carbon-neutral delivery</li>
            </ul>
            <Link to={isAuthenticated ? '/home' : '/signup'} className="btn btn-dark">Discover Story</Link>
          </div>
          <div className="editorial-img">
            <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80" alt="Editorial" />
            <div className="quote-card">
              <p>“VÉLORA makes getting dressed feel effortless again.”</p>
              <span>— Elle Magazine</span>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="newsletter">
          <h2>Get 15% off your first order</h2>
          <p>Join our community — be first to access new drops and private sale.</p>
          <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
            <input placeholder="Enter your email" type="email" />
            <button className="btn btn-dark">Join</button>
          </form>
          <span className="fine">By joining you agree to our Privacy Policy. Unsubscribe anytime.</span>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <h4>VÉLORA</h4>
            <p>Fashion House<br />Fall/Winter 2026 Collection<br />Made for the modern wardrobe.</p>
          </div>
          <div><h5>SHOP</h5><a>Women</a><a>Men</a><a>Kids</a><a>Accessories</a></div>
          <div><h5>HELP</h5><a>Shipping</a><a>Returns</a><a>Login</a><a>Sign Up</a></div>
          <div><h5>CONNECT</h5><a>Instagram</a><a>Pinterest</a><a>TikTok</a><a>Support</a></div>
        </div>
        <div className="footer-bottom">© 2026 VÉLORA Fashion House. Crafted with elegance.</div>
      </footer>
    </>
  )
}
