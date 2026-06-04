from typing import List
from typing import Any
from typing import Dict
from datetime import datetime
from typing import Optional
from pydantic import BaseModel,Field,validator

class Product(BaseModel):
    sku:str = Field(..., description="The sku of the product")
    name: str = Field(..., description="The name of the product")
    slug:str = Field(..., description="The slug of the product")
    description:Optional[str] = Field(None, description="The description of the product")
    price:float = Field(..., description="The price of the product")
    regular_price:float = Field(..., description="The regular price of the product")
    stock:int = Field(..., description="The stock of the product")
    low_stock_threshold:int = Field(..., description="The low stock threshold of the product")
    image:Optional[str] = Field(None, description="The URL of the product's image")
    category_id:Optional[int] = Field(None, description="The ID of the category")
    brand_id:Optional[int] = Field(None, description="The ID of the brand")
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: List[str] = []
    is_featured: bool = False
    is_new: bool = False
    created_by: int  # Admin user ID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active:bool = Field(..., description="Indicates whether the product is active")
    created_by:Optional[int] = Field(None, description="The ID of the user who created the product")
    created_at:Optional[datetime] = Field(None, description="The timestamp when the product was created")
    updated_at:Optional[datetime] = Field(None, description="The timestamp when the product was last updated")

    specifications: Dict[str,Any] = Field(..., description="The specifications of the product",default_factory=dict)
    features: List[str] = []
    
    @validator('slug',pre=True,always=True)
    def generate_slug(cls, v,values):
        if not v and 'name' in values:
            import re
            v = values['name'].lower()  
            v = re.sub(r'[^a-z0-9]+','-',v)
            v = v.strip('-')
        return v
    
    @property
    def discount_price(self):
        if self.price and self.price < self.regular_price:
            return int(((self.regular_price - self.price) / self.regular_price) * 100)
            
        return 0