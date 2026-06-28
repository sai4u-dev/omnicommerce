import os
import psycopg2
import pymongo
from urllib.parse import urlparse

# PostgreSQL Client with Fallback
pg_conn = None
def get_pg_connection():
    global pg_conn
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return None
    try:
        # Check if already connected
        if pg_conn and not pg_conn.closed:
            return pg_conn
        pg_conn = psycopg2.connect(db_url)
        return pg_conn
    except Exception as e:
        print(f"PostgreSQL Connection Error: {e}")
        return None

# MongoDB Client with Fallback
mongo_db = None
mongo_client = None
def get_mongo_db():
    global mongo_db, mongo_client
    mongo_url = os.environ.get("MONGO_URL")
    if not mongo_url:
        return None
    try:
        if mongo_db is not None:
            return mongo_db
        mongo_client = pymongo.MongoClient(mongo_url, serverSelectionTimeoutMS=2000)
        # Verify connection
        mongo_client.server_info()
        # Parse database name from connection string if present, else use default
        parsed = urlparse(mongo_url)
        db_name = parsed.path.strip('/') or "omnicommerce"
        mongo_db = mongo_client[db_name]
        return mongo_db
    except Exception as e:
        print(f"MongoDB Connection Error: {e}")
        return None

# Static / Mock catalog data in case DB is offline
STATIC_PRODUCTS = [
    {
        "id": "mock-1",
        "title": "Centella Gentle Foam Cleanser",
        "slug": "centella-gentle-foam-cleanser",
        "description": "A mild pH-balanced foaming cleanser infused with Centella Asiatica extract. It sweeps away impurities while leaving the skin barrier intact, hydrated, and calm. Ideal for daily use morning and night.",
        "price": 18.00,
        "brand": "GlowGuide Care",
        "skinType": "sensitive",
        "concern": "hydration",
        "ingredients": "Centella Asiatica Extract, Glycerin, Sodium Cocoyl Isethionate, Coco-Betaine, Panthenol, Allantoin"
    },
    {
        "id": "mock-2",
        "title": "BHA Pore Refining Toner",
        "slug": "bha-pore-refining-toner",
        "description": "Formulated with 2% Salicylic Acid (BHA), this toner gently exfoliates dead skin cells, targets blackheads, and controls excess oil secretion. Tea tree oil helps calm redness and breakouts.",
        "price": 22.00,
        "brand": "GlowGuide Active",
        "skinType": "oily",
        "concern": "acne",
        "ingredients": "Salicylic Acid 2%, Water, Methylpropanediol, Tea Tree Leaf Oil, Green Tea Extract, Sodium Hyaluronate"
    },
    {
        "id": "mock-3",
        "title": "Hyaluronic Acid Hydration Boost Serum",
        "slug": "hyaluronic-acid-hydration-boost-serum",
        "description": "A high-potency serum containing multi-molecular weight Hyaluronic Acid and Vitamin B5. It penetrates deep into skin layers to plump fine lines, restore moisture reservoirs, and deliver bouncy skin.",
        "price": 26.00,
        "brand": "GlowGuide Care",
        "skinType": "dry",
        "concern": "hydration",
        "ingredients": "Sodium Hyaluronate (Multi-Weight), Panthenol (Vitamin B5), Phenoxyethanol, Ethylhexylglycerin, Purified Water"
    },
    {
        "id": "mock-4",
        "title": "Vitamin C Brightening Fluid",
        "slug": "vitamin-c-brightening-fluid",
        "description": "Enriched with 15% pure L-Ascorbic Acid and Ferulic Acid, this powerful antioxidant serum neutralizes free radicals, fades dark spots and hyperpigmentation, and dramatically improves skin radiance.",
        "price": 29.00,
        "brand": "GlowGuide Active",
        "skinType": "combination",
        "concern": "brightening",
        "ingredients": "L-Ascorbic Acid 15%, Ferulic Acid, Tocopherol (Vitamin E), Ethoxydiglycol, Panthenol, Hyaluronic Acid"
    },
    {
        "id": "mock-5",
        "title": "Retinol Youth Renewal Night Cream",
        "slug": "retinol-youth-renewal-night-cream",
        "description": "An advanced retinol cream engineered for night-time repair. Microencapsulated retinol speeds skin cell turnover to reduce appearance of wrinkles, while peptides support collagen synthesis.",
        "price": 38.00,
        "brand": "GlowGuide Active",
        "skinType": "combination",
        "concern": "aging",
        "ingredients": "Retinol (Microencapsulated), Acetyl Hexapeptide-8, Niacinamide, Shea Butter, Ceramides NP/AP/EOP"
    },
    {
        "id": "mock-6",
        "title": "Ceramide Barrier Repair Cream",
        "slug": "ceramide-barrier-repair-cream",
        "description": "A rich, nourishing daily moisturizer that delivers 3 essential ceramides and cholesterol. Fast-absorbing lipids strengthen dry or sensitised skin barriers and provide 48-hour locked hydration.",
        "price": 32.00,
        "brand": "GlowGuide Care",
        "skinType": "dry",
        "concern": "hydration",
        "ingredients": "Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Squalane, Glycerin"
    },
    {
        "id": "mock-7",
        "title": "Mineral Matte Sunscreen SPF 50",
        "slug": "mineral-matte-sunscreen-spf-50",
        "description": "A physical zinc-oxide sunscreen providing broad-spectrum UVA/UVB protection. The lightweight, oil-free formula sets to a beautiful matte finish that acts as a perfect primer. Safe for sensitive skin.",
        "price": 24.00,
        "brand": "GlowGuide Protection",
        "skinType": "oily",
        "concern": "aging",
        "ingredients": "Zinc Oxide 20%, Titanium Dioxide, Cyclopentasiloxane, Dimethicone Crosspolymer, Vitamin E, Bisabolol"
    },
    {
        "id": "mock-8",
        "title": "Clarifying Tea Tree Spot Gel",
        "slug": "clarifying-tea-tree-spot-gel",
        "description": "A target spot treatment gel with Tea Tree oil and Centella to immediately soothe acne blemishes, reduce size of pimples overnight, and prevent post-acne scarring without drying surrounding skin.",
        "price": 19.00,
        "brand": "GlowGuide Care",
        "skinType": "sensitive",
        "concern": "acne",
        "ingredients": "Tea Tree Oil, Centella Asiatica, Niacinamide 4%, Salicylic Acid 0.5%, Witch Hazel, Zinc PCA"
    }
]

def fetch_all_products():
    """Fetch all products from PostgreSQL, falling back to static mock data if unavailable."""
    conn = get_pg_connection()
    if not conn:
        return STATIC_PRODUCTS
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, title, slug, description, price, brand, "skinType", concern, ingredients, image, rating FROM "Product" WHERE status=\'active\';')
            rows = cur.fetchall()
            products = []
            for r in rows:
                products.append({
                    "id": r[0],
                    "title": r[1],
                    "slug": r[2],
                    "description": r[3],
                    "price": float(r[4]),
                    "brand": r[5],
                    "skinType": r[6],
                    "concern": r[7],
                    "ingredients": r[8],
                    "image": r[9],
                    "rating": float(r[10])
                })
            return products
    except Exception as e:
        print(f"Error fetching products from DB: {e}")
        return STATIC_PRODUCTS
