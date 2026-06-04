from datetime import datetime
from pydantic import BaseModel,Field,validator
from typing import Optional,List

class Category(BaseModel):
    name: str
    slug: str
    description: str
    parent_id:Optional[str]=None
    meta_title:Optional[str]=None
    meta_description:Optional[str]=None
    is_active:bool=Field(default=True)
    display_order:int=Field(default=0)
    created_at:datetime=Field(default_factory=datetime.now)
    created_by:int
    updated_at:datetime=Field(default_factory=datetime.now)
    updated_by:int
    image:Optional[str]=None

    @validator('slug',pre=True,always=True)
    def generate_slug(cls,v,values):
        if not v and 'name' in values:
            import re
            v = values['name'].lower()
            v = re.sub(r'[^a-z0-9]+','-',v).strip('-')
        return v
    
    
