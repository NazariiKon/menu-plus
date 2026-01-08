from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel
import uvicorn
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.middleware.cors import CORSMiddleware

from src.api.main import api_router
import src.models


app = FastAPI(title="Menu+ API")
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class Dish(BaseModel):
    name: str
    price: int
    description: str = ""

cafes = {}

@app.get("/")
async def root():
    return {"message": "Menu+ API. Add /docs to the link at the top. 🚀"}

@app.post("/cafes/{cafe_id}/dishes")
async def add_dish(cafe_id: str, dish: Dish):
    if cafe_id not in cafes:
        cafes[cafe_id] = []
    cafes[cafe_id].append(dish)
    return {"status": "added", "dishes": len(cafes[cafe_id])}

@app.get("/cafes/{cafe_id}/menu")
async def get_menu(cafe_id: str):
    if cafe_id not in cafes:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cafe not found")
    return {"cafe": cafe_id, "dishes": cafes[cafe_id]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
