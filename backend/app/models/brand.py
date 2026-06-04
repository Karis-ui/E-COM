from datetime import datetime
from typing import Optional
from pydantic import BaseModel,Field,validator

class Brand(BaseModel):
    name: str = Field(..., description="The name of the brand")
    slug:str = Field(..., description="The slug of the brand")
    logo:Optional[str] = Field(None, description="The URL of the brand's logo")
    
    is_active: bool = Field(..., description="Indicates whether the brand is active")
    created_by: Optional[int] = Field(None, description="The ID of the user who created the brand")
    created_at: Optional[datetime] = Field(None, description="The timestamp when the brand was created")
    updated_at: Optional[datetime] = Field(None, description="The timestamp when the brand was last updated")
    
    @validator('slug',pre=True,always=True)
    def generate_slug(cls, v,values):
        if not v and 'name' in values:
            import re
            v = values['name'].lower()  
            v = re.sub(r'[^a-z0-9]+','-',v)
            v = v.strip('-')
        return v