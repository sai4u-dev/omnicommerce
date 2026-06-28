import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from services.ai_search import perform_semantic_search
from services.ai_agent import execute_chat_flow, tool_recommend_routine
from services.ai_utils import generate_product_description, summarize_product_reviews

app = FastAPI(title="GlowGuide AI Skincare Service API", version="1.0.0")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Pydantic Models for validation
class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

class ChatRequest(BaseModel):
    sessionId: str
    message: str
    userId: Optional[str] = "anonymous"

class RecommendRequest(BaseModel):
    skinType: str
    concern: str

class ReviewItem(BaseModel):
    rating: int
    comment: str

class SummarizeRequest(BaseModel):
    productTitle: str
    reviews: List[ReviewItem]

class DescriptionRequest(BaseModel):
    title: str
    brand: str
    skinType: str
    concern: str
    ingredients: str

# 2. FastAPI Endpoints
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "backend-ai"}

@app.post("/ai/search")
def ai_search(req: SearchRequest):
    try:
        results = perform_semantic_search(req.query, limit=req.limit)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/chat")
def ai_chat(req: ChatRequest):
    try:
        response = execute_chat_flow(req.sessionId, req.message, req.userId)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/recommend")
def ai_recommend(req: RecommendRequest):
    try:
        routine = tool_recommend_routine(req.skinType, req.concern)
        return {
            "recommended_products": routine,
            "reasoning": f"Curated regimen matching {req.skinType} skin with {req.concern} concern."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/summarize-reviews")
def ai_summarize_reviews(req: SummarizeRequest):
    try:
        reviews_list = [{"rating": r.rating, "comment": r.comment} for r in req.reviews]
        summary = summarize_product_reviews(req.productTitle, reviews_list)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/generate-description")
def ai_generate_description(req: DescriptionRequest):
    try:
        description = generate_product_description(
            title=req.title,
            brand=req.brand,
            skin_type=req.skinType,
            concern=req.concern,
            ingredients=req.ingredients
        )
        return {"description": description}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
