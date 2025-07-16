from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from enum import Enum
import json
from paypalcheckoutsdk.core import SandboxEnvironment, PayPalHttpClient
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from jose import JWTError, jwt
from passlib.context import CryptContext
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# PayPal configuration (using demo credentials for now)
paypal_client = PayPalHttpClient(SandboxEnvironment(
    client_id=os.environ.get('PAYPAL_CLIENT_ID', 'demo_client_id'),
    client_secret=os.environ.get('PAYPAL_SECRET', 'demo_secret')
))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

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
    stock_quantity: int = 100
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
    stock_quantity: int = 100
    featured: bool = False

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int
    selected_color: str
    selected_size: str
    price: float

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: str
    items: List[CartItem] = []
    total: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CartAddItem(BaseModel):
    product_id: str
    quantity: int
    selected_color: str
    selected_size: str

class CartUpdateItem(BaseModel):
    quantity: int
    selected_color: Optional[str] = None
    selected_size: Optional[str] = None

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    selected_color: str
    selected_size: str
    price: float
    total: float

class ShippingAddress(BaseModel):
    name: str
    street: str
    city: str
    state: str
    zip_code: str
    country: str
    phone: str

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: str
    items: List[OrderItem]
    shipping_address: ShippingAddress
    subtotal: float
    tax: float
    shipping_cost: float
    total: float
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: str
    payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    session_id: str
    shipping_address: ShippingAddress
    payment_method: str

# Payment Models
class PaymentCreate(BaseModel):
    order_id: str
    amount: float
    currency: str = "USD"
    payment_method: str

class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    amount: float
    currency: str
    payment_method: str
    status: PaymentStatus
    payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Culture Models
class CultureStory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    image_url: str
    category: str
    featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Routes
@api_router.get("/")
async def root():
    return {"message": "Authentic Nepal Suit Brand API"}

# Product Routes
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

# Cart Routes
@api_router.post("/cart", response_model=Cart)
async def create_cart(session_id: str):
    cart = Cart(session_id=session_id)
    await db.carts.insert_one(cart.dict())
    return cart

@api_router.get("/cart/{session_id}", response_model=Cart)
async def get_cart(session_id: str):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        cart = Cart(session_id=session_id)
        await db.carts.insert_one(cart.dict())
        return cart
    return Cart(**cart)

@api_router.post("/cart/{session_id}/items")
async def add_to_cart(session_id: str, item: CartAddItem):
    # Get product details
    product = await db.products.find_one({"id": item.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create cart
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        cart = Cart(session_id=session_id)
    else:
        cart = Cart(**cart)
    
    # Check if item already exists in cart
    existing_item = None
    for i, cart_item in enumerate(cart.items):
        if (cart_item.product_id == item.product_id and 
            cart_item.selected_color == item.selected_color and 
            cart_item.selected_size == item.selected_size):
            existing_item = i
            break
    
    if existing_item is not None:
        # Update quantity
        cart.items[existing_item].quantity += item.quantity
    else:
        # Add new item
        cart_item = CartItem(
            product_id=item.product_id,
            quantity=item.quantity,
            selected_color=item.selected_color,
            selected_size=item.selected_size,
            price=product["price"]
        )
        cart.items.append(cart_item)
    
    # Calculate total
    cart.total = sum(item.price * item.quantity for item in cart.items)
    cart.updated_at = datetime.utcnow()
    
    # Save to database
    await db.carts.replace_one({"session_id": session_id}, cart.dict(), upsert=True)
    
    return {"message": "Item added to cart", "cart": cart}

@api_router.put("/cart/{session_id}/items/{product_id}")
async def update_cart_item(session_id: str, product_id: str, update: CartUpdateItem):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = Cart(**cart)
    
    # Find and update item
    for item in cart.items:
        if item.product_id == product_id:
            item.quantity = update.quantity
            if update.selected_color:
                item.selected_color = update.selected_color
            if update.selected_size:
                item.selected_size = update.selected_size
            break
    else:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    # Calculate total
    cart.total = sum(item.price * item.quantity for item in cart.items)
    cart.updated_at = datetime.utcnow()
    
    # Save to database
    await db.carts.replace_one({"session_id": session_id}, cart.dict())
    
    return {"message": "Cart updated", "cart": cart}

@api_router.delete("/cart/{session_id}/items/{product_id}")
async def remove_from_cart(session_id: str, product_id: str):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = Cart(**cart)
    
    # Remove item
    cart.items = [item for item in cart.items if item.product_id != product_id]
    
    # Calculate total
    cart.total = sum(item.price * item.quantity for item in cart.items)
    cart.updated_at = datetime.utcnow()
    
    # Save to database
    await db.carts.replace_one({"session_id": session_id}, cart.dict())
    
    return {"message": "Item removed from cart", "cart": cart}

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order_create: OrderCreate):
    # Get cart
    cart = await db.carts.find_one({"session_id": order_create.session_id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    cart = Cart(**cart)
    
    # Create order items
    order_items = []
    for cart_item in cart.items:
        product = await db.products.find_one({"id": cart_item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
        
        order_item = OrderItem(
            product_id=cart_item.product_id,
            product_name=product["name"],
            quantity=cart_item.quantity,
            selected_color=cart_item.selected_color,
            selected_size=cart_item.selected_size,
            price=cart_item.price,
            total=cart_item.price * cart_item.quantity
        )
        order_items.append(order_item)
    
    # Calculate totals
    subtotal = sum(item.total for item in order_items)
    tax = subtotal * 0.08  # 8% tax
    shipping_cost = 0 if subtotal > 500 else 25  # Free shipping over $500
    total = subtotal + tax + shipping_cost
    
    # Create order
    order = Order(
        session_id=order_create.session_id,
        items=order_items,
        shipping_address=order_create.shipping_address,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        total=total,
        payment_method=order_create.payment_method
    )
    
    await db.orders.insert_one(order.dict())
    
    return order

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)

# Payment Routes
@api_router.post("/payments/create")
async def create_payment(payment: PaymentCreate):
    try:
        # For demo purposes, we'll simulate different payment methods
        if payment.payment_method == "paypal":
            # Create PayPal order (simplified for demo)
            payment_obj = Payment(
                order_id=payment.order_id,
                amount=payment.amount,
                currency=payment.currency,
                payment_method=payment.payment_method,
                status=PaymentStatus.PENDING
            )
            await db.payments.insert_one(payment_obj.dict())
            return {"payment_id": payment_obj.id, "status": "pending", "redirect_url": "https://paypal.com/demo"}
        
        elif payment.payment_method in ["google_pay", "apple_pay", "credit_card"]:
            # Simulate other payment methods
            payment_obj = Payment(
                order_id=payment.order_id,
                amount=payment.amount,
                currency=payment.currency,
                payment_method=payment.payment_method,
                status=PaymentStatus.COMPLETED
            )
            await db.payments.insert_one(payment_obj.dict())
            
            # Update order status
            await db.orders.update_one(
                {"id": payment.order_id},
                {"$set": {"payment_status": PaymentStatus.COMPLETED, "status": OrderStatus.PROCESSING}}
            )
            
            return {"payment_id": payment_obj.id, "status": "completed"}
        
        else:
            raise HTTPException(status_code=400, detail="Invalid payment method")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment processing failed: {str(e)}")

@api_router.get("/payments/{payment_id}")
async def get_payment(payment_id: str):
    payment = await db.payments.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return Payment(**payment)

# Culture Routes
@api_router.get("/culture/stories")
async def get_culture_stories():
    stories = await db.culture_stories.find().to_list(100)
    return [CultureStory(**story) for story in stories]

@api_router.post("/culture/initialize")
async def initialize_culture_stories():
    # Check if stories already exist
    existing_stories = await db.culture_stories.count_documents({})
    if existing_stories > 0:
        return {"message": "Culture stories already initialized"}
    
    nepal_stories = [
        {
            "title": "The Heritage of Nepalese Craftsmanship",
            "content": "For centuries, Nepal has been home to master tailors and artisans who have passed down their skills through generations. Our authentic suit brand honors this rich tradition by combining time-honored techniques with contemporary design. Each suit is crafted with the precision and care that has made Nepalese textiles renowned worldwide.",
            "image_url": "https://images.unsplash.com/photo-1594736797933-d0d2e7d3e2f8?w=800&q=80",
            "category": "heritage",
            "featured": True
        },
        {
            "title": "Traditional Tailoring Techniques",
            "content": "Our master tailors use traditional hand-sewing techniques that have been perfected over generations in the valleys of Nepal. Every stitch tells a story of dedication, skill, and cultural pride. From the precise measurements to the final finishing touches, our suits embody the meticulous craftsmanship that Nepal is famous for.",
            "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
            "category": "craftsmanship",
            "featured": True
        },
        {
            "title": "The Cultural Significance of Formal Wear",
            "content": "In Nepalese culture, formal attire represents respect, dignity, and social harmony. Our suits are designed to honor these values while providing modern professionals with clothing that reflects their heritage. Each piece connects the wearer to a tradition of elegance and cultural pride that spans centuries.",
            "image_url": "https://images.unsplash.com/photo-1475403614135-5f1aa0eb5015?w=800&q=80",
            "category": "culture",
            "featured": True
        },
        {
            "title": "Sustainable Fashion from the Himalayas",
            "content": "Our commitment to sustainability reflects the Nepalese respect for nature and the environment. We source our materials ethically, support local artisans, and ensure that our production processes honor the natural beauty of Nepal. Each suit is not just a garment, but a statement of environmental responsibility.",
            "image_url": "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=800&q=80",
            "category": "sustainability",
            "featured": False
        },
        {
            "title": "Artisan Stories: Masters of Their Craft",
            "content": "Meet the skilled artisans behind every suit. Our tailors, many of whom learned their craft from their fathers and grandfathers, bring decades of experience to every piece. Their stories of dedication, innovation, and cultural pride are woven into every thread of our garments.",
            "image_url": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
            "category": "artisans",
            "featured": False
        }
    ]
    
    for story_data in nepal_stories:
        story_obj = CultureStory(**story_data)
        await db.culture_stories.insert_one(story_obj.dict())
    
    return {"message": f"Initialized {len(nepal_stories)} culture stories"}

# Initialize sample products
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
            "stock_quantity": 50,
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
            "stock_quantity": 30,
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
            "stock_quantity": 25,
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
            "stock_quantity": 40,
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
            "stock_quantity": 15,
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
            "stock_quantity": 35,
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