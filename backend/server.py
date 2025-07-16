from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums for product categories
class SuitType(str, Enum):
    BUSINESS = "business"
    FORMAL = "formal"
    WEDDING = "wedding"
    CASUAL = "casual"
    TUXEDO = "tuxedo"

class FabricType(str, Enum):
    WOOL = "wool"
    COTTON = "cotton"
    SILK = "silk"
    LINEN = "linen"
    BLEND = "blend"

class SizeType(str, Enum):
    XS = "XS"
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"

# Product Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    suit_type: SuitType
    fabric: FabricType
    fabric_description: str
    colors: List[str]
    sizes: List[SizeType]
    image_url: str
    additional_images: List[str] = []
    care_instructions: str
    in_stock: bool = True
    featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    suit_type: SuitType
    fabric: FabricType
    fabric_description: str
    colors: List[str]
    sizes: List[SizeType]
    image_url: str
    additional_images: List[str] = []
    care_instructions: str
    in_stock: bool = True
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    suit_type: Optional[SuitType] = None
    fabric: Optional[FabricType] = None
    fabric_description: Optional[str] = None
    colors: Optional[List[str]] = None
    sizes: Optional[List[SizeType]] = None
    image_url: Optional[str] = None
    additional_images: Optional[List[str]] = None
    care_instructions: Optional[str] = None
    in_stock: Optional[bool] = None
    featured: Optional[bool] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Authentic Suit Brand API"}

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    result = await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(
    suit_type: Optional[SuitType] = None,
    fabric: Optional[FabricType] = None,
    featured: Optional[bool] = None,
    in_stock: Optional[bool] = None,
    limit: int = 50
):
    query = {}
    if suit_type:
        query["suit_type"] = suit_type
    if fabric:
        query["fabric"] = fabric
    if featured is not None:
        query["featured"] = featured
    if in_stock is not None:
        query["in_stock"] = in_stock
    
    products = await db.products.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Initialize some sample products
@api_router.post("/products/initialize")
async def initialize_products():
    # Check if products already exist
    existing_products = await db.products.count_documents({})
    if existing_products > 0:
        return {"message": "Products already initialized"}
    
    sample_products = [
        {
            "name": "Executive Business Suit",
            "description": "A premium business suit crafted from finest wool, perfect for the modern professional. Features a classic cut with contemporary styling.",
            "price": 899.99,
            "original_price": 1299.99,
            "suit_type": "business",
            "fabric": "wool",
            "fabric_description": "100% Premium Wool with natural stretch",
            "colors": ["Charcoal", "Navy", "Black"],
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "image_url": "https://images.unsplash.com/photo-1705643542630-3530b68b1b69?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHN1aXRzfGVufDB8fHxibGFja3wxNzUyNzA4NDQxfDA&ixlib=rb-4.1.0&q=85",
            "additional_images": [],
            "care_instructions": "Dry clean only. Store on padded hangers.",
            "in_stock": True,
            "featured": True
        },
        {
            "name": "Classic Formal Suit",
            "description": "Timeless elegance meets modern sophistication. This formal suit is perfect for special occasions and important meetings.",
            "price": 1199.99,
            "original_price": 1599.99,
            "suit_type": "formal",
            "fabric": "silk",
            "fabric_description": "Luxury Silk-Wool Blend",
            "colors": ["Black", "Deep Navy", "Charcoal"],
            "sizes": ["S", "M", "L", "XL"],
            "image_url": "https://images.unsplash.com/photo-1705643473736-1e1f126fba12?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxidXNpbmVzcyUyMHN1aXRzfGVufDB8fHxibGFja3wxNzUyNzA4NDQxfDA&ixlib=rb-4.1.0&q=85",
            "additional_images": [],
            "care_instructions": "Professional dry cleaning recommended. Avoid direct sunlight.",
            "in_stock": True,
            "featured": True
        },
        {
            "name": "Premium Wedding Suit",
            "description": "Make your special day unforgettable with this premium wedding suit. Crafted with attention to every detail.",
            "price": 1499.99,
            "suit_type": "wedding",
            "fabric": "wool",
            "fabric_description": "Super 150s Wool with Peak Lapel",
            "colors": ["Midnight Black", "Charcoal", "Deep Navy"],
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "image_url": "https://images.unsplash.com/photo-1525170483500-d6489955a67f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwyfHxmb3JtYWwlMjBtZW5zd2VhcnxlbnwwfHx8YmxhY2t8MTc1MjcwODQ0OXww&ixlib=rb-4.1.0&q=85",
            "additional_images": [],
            "care_instructions": "Dry clean only. Professional pressing recommended.",
            "in_stock": True,
            "featured": True
        },
        {
            "name": "Modern Casual Suit",
            "description": "Versatile casual suit perfect for business-casual environments and social events. Comfortable yet refined.",
            "price": 699.99,
            "original_price": 899.99,
            "suit_type": "casual",
            "fabric": "cotton",
            "fabric_description": "Premium Cotton Blend with Stretch",
            "colors": ["Light Grey", "Navy", "Khaki"],
            "sizes": ["S", "M", "L", "XL"],
            "image_url": "https://images.unsplash.com/photo-1579090175332-8749c125baf3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBtZW5zd2VhcnxlbnwwfHx8YmxhY2t8MTc1MjcwODQ0OXww&ixlib=rb-4.1.0&q=85",
            "additional_images": [],
            "care_instructions": "Machine wash cold. Hang dry. Light iron if needed.",
            "in_stock": True,
            "featured": False
        },
        {
            "name": "Luxury Tuxedo",
            "description": "The epitome of formal elegance. This luxury tuxedo is perfect for black-tie events and formal occasions.",
            "price": 1899.99,
            "suit_type": "tuxedo",
            "fabric": "silk",
            "fabric_description": "Premium Silk with Satin Lapels",
            "colors": ["Black", "Midnight Blue"],
            "sizes": ["S", "M", "L", "XL"],
            "image_url": "https://images.pexels.com/photos/5845904/pexels-photo-5845904.jpeg",
            "additional_images": [],
            "care_instructions": "Professional dry cleaning only. Store in garment bag.",
            "in_stock": True,
            "featured": True
        },
        {
            "name": "Contemporary Business Suit",
            "description": "A contemporary take on the classic business suit. Slim fit with modern details for the style-conscious professional.",
            "price": 799.99,
            "original_price": 1099.99,
            "suit_type": "business",
            "fabric": "blend",
            "fabric_description": "Wool-Polyester Blend with Stretch",
            "colors": ["Charcoal", "Navy", "Dark Grey"],
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "image_url": "https://images.pexels.com/photos/2122844/pexels-photo-2122844.jpeg",
            "additional_images": [],
            "care_instructions": "Dry clean preferred. Can be machine washed on delicate cycle.",
            "in_stock": True,
            "featured": False
        }
    ]
    
    for product_data in sample_products:
        product_obj = Product(**product_data)
        await db.products.insert_one(product_obj.dict())
    
    return {"message": f"Initialized {len(sample_products)} products"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()