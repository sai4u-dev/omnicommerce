import os
import numpy as np
from services.db_client import get_pg_connection, fetch_all_products

# Try to initialize real embedding models if keys are set
openai_key = os.environ.get("OPENAI_API_KEY")
gemini_key = os.environ.get("GEMINI_API_KEY")

embeddings_model = None

if gemini_key:
    try:
        from langchain_google_genai import GoogleGenAIEmbeddings
        embeddings_model = GoogleGenAIEmbeddings(model="models/embedding-001", google_api_key=gemini_key)
        print("Initialized Gemini Embeddings.")
    except Exception as e:
        print(f"Failed to load Gemini Embeddings: {e}")
elif openai_key:
    try:
        from langchain_openai import OpenAIEmbeddings
        embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small", api_key=openai_key)
        print("Initialized OpenAI Embeddings.")
    except Exception as e:
        print(f"Failed to load OpenAI Embeddings: {e}")

def get_text_embedding(text: str) -> list:
    """Generate embedding vector (1536 float elements) for a given text string."""
    if embeddings_model:
        try:
            vector = embeddings_model.embed_query(text)
            # Force size to 1536
            if len(vector) < 1536:
                vector = vector + [0.0] * (1536 - len(vector))
            elif len(vector) > 1536:
                vector = vector[:1536]
            return vector
        except Exception as e:
            print(f"Real embedding generation error: {e}, falling back to mock.")
    
    # Deterministic Mock Embedding (1536 dimensions) for fallback
    # Generate seed based on text sum of characters
    seed = sum(ord(c) for c in text) % 10000
    np.random.seed(seed)
    mock_vector = np.random.randn(1536)
    # L2 normalize
    norm = np.linalg.norm(mock_vector)
    if norm > 0:
        mock_vector = mock_vector / norm
    return mock_vector.tolist()

def perform_semantic_search(query: str, limit: int = 5) -> list:
    """Search catalog semantically using pgvector if available, else standard fallback search."""
    conn = get_pg_connection()
    query_vector = get_text_embedding(query)

    if conn:
        try:
            with conn.cursor() as cur:
                # Query utilizing pgvector cosine distance operator <=>
                cur.execute(
                    'SELECT id, title, slug, description, price, brand, "skinType", concern, ingredients, image, rating, (embedding <=> %s::vector) as distance '
                    'FROM "Product" WHERE status=\'active\' '
                    'ORDER BY embedding <=> %s::vector '
                    'LIMIT %s;',
                    (query_vector, query_vector, limit)
                )
                rows = cur.fetchall()
                # If pgvector returned items successfully
                if rows:
                    results = []
                    for r in rows:
                        results.append({
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
                            "rating": float(r[10]),
                            "distance": float(r[11]) if r[11] is not None else 1.0
                        })
                    return results
        except Exception as e:
            print(f"pgvector query failed (might not have vectors seeded yet): {e}. Falling back to python search.")
            
    # Fallback to local keyword/text matching and mock distance ranking
    products = fetch_all_products()
    query_words = set(query.lower().split())
    
    ranked_products = []
    for p in products:
        # Simple scoring
        score = 0
        content = (p["title"] + " " + p["description"] + " " + p["skinType"] + " " + p["concern"] + " " + p["ingredients"]).lower()
        for word in query_words:
            if word in content:
                score += 1
        
        # Calculate a mock distance based on score (higher score = lower distance)
        distance = 1.0 - (score / (len(query_words) + 1.0))
        ranked_products.append({**p, "distance": distance})
        
    # Sort by distance ascending
    ranked_products.sort(key=lambda x: x["distance"])
    return ranked_products[:limit]
