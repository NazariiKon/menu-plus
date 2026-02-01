from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from src.schemas.menu import ItemCreate, ItemUpdate
from src.api.main import api_router

app = FastAPI(title="Menu+ API")
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://menu-plus-client.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def override_openapi():
    if app.openapi_schema:
        return app.openapi_schema  
    
    openapi_schema = get_openapi(
        title="Your API", 
        version="1.0", 
        routes=app.routes
    )
    
    openapi_schema["components"]["schemas"]["ItemCreate"] = ItemCreate.model_json_schema()
    openapi_schema["components"]["schemas"]["ItemUpdate"] = ItemUpdate.model_json_schema()
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = override_openapi

@app.get("/")
async def root():
    return {"message": "Menu+ API. Add /docs to the link at the top. 🚀"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
