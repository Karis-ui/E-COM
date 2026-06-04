from fastapi import APIRouter,Depends,HTTPException,status
from app.services.product_service import ProductService
from app.database.mongodb import get_mongo_db
from app.core.security import get_current_user

router = APIRouter(prefix="/admin/products",tags=["Admin - Products"])

def get_product_service(db = Depends(get_mongo_db)):
    return ProductService(db)

@router.post("/",response_model=dict,status_code=status.HTTP_201_CREATED)
async def create_product(product_data:dict,current_user = Depends(get_current_user),service:ProductService = Depends(get_product_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to create a product")
    
    required = ["name","image","category_id","brand_id"]
    for field in required:
        if field not in product_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"{field} is required")
    
    product = await service.create_product(product_data,current_user["id"])
    return product

@router.get("/{product_id}",response_model=dict)
async def get_product_by_id(product_id:str,service:ProductService = Depends(get_product_service)):
    product = await service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Product not found")
    return product

@router.get("/",response_model=list[dict])
async def get_all_products(service:ProductService = Depends(get_product_service)):
    return await service.get_all_products()

@router.put("/{product_id}",response_model=dict)
async def update_product(product_id:str,update_data:dict,current_user = Depends(get_current_user),service:ProductService = Depends(get_product_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to update a product")
    
    product = await service.update_product(product_id,update_data)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Product not found")
    return product

@router.delete("/{product_id}",response_model=dict)
async def delete_product(product_id:str,current_user = Depends(get_current_user),service:ProductService = Depends(get_product_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to delete a product")
    
    result = await service.delete_product(product_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Product not found")
    return {"message":"Product deleted successfully"}