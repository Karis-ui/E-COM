from typing import Optional
from pydantic import BaseModel, Field

class AddressCreate(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    instructions: str
    postal_code: str
    county: str
    is_default: bool

class AddressUpdate(AddressCreate):
    pass

class AddressResponse(AddressCreate):
    id: int
    user_id: int
    is_default: bool
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True