from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from src.api.main import api_router

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
