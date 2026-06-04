from fastapi import APIRouter,Depends,Query,status,HTTPException
from app.services.product_service import ProductService
from app.database.mongodb import get_mongo_db
from typing import Optional

router = APIRouter(prefix="/products",tags=["Products"])

def get_product_service(db=Depends(get_mongo_db)):
    return ProductService(db)

async def product_list(
    category_id: Optional[str] = Query(None, description="Filter by category"),
    brand_id: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    search: Optional[str] = Query(None, description="Search term"),
    featured: Optional[bool] = Query(None, description="Featured only"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    service: ProductService = Depends(get_product_service)
):
    return await service.list_products(
        category_id=category_id,
        brand_id=brand_id,
        min_price=min_price,
        max_price=max_price,
        search=search,
        is_featured=featured,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )

@router.get("/{slug}",response_model=dict)
async def get_product_by_id(slug_or_id:str,service:ProductService = Depends(get_product_service)):
    product = await service.get_product_by_id(slug_or_id)
    if not product:
        product = await service.get_products_by_slug(slug_or_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Product not found")
    return product

@router.get("/featured",response_model=list[dict])
async def get_featured_products(service:ProductService = Depends(get_product_service),limit: int=Query(default=10,ge=1,le=100)):
    result = await service.list_products(is_featured=True,limit=limit)
    return result