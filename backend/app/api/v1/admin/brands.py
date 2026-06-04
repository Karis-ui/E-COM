from fastapi import APIRouter,Depends,HTTPException,status
from app.services.brand_service import BrandService
from app.database.mongodb import get_mongo_db
from app.core.security import get_current_user

router = APIRouter(prefix="/admin/brands",tags=["Admin Brands"])

def get_brand_service(db = Depends(get_mongo_db)):
    return BrandService(db)

@router.post("/",response_model=dict,status_code=status.HTTP_201_CREATED)
async def create_brand(brand_data:dict,current_user = Depends(get_current_user),service:BrandService = Depends(get_brand_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to create a brand")
    if "name" not in brand_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Brand name is required")
    
    brand = await service.create_brand(brand_data,current_user["id"])
    return brand

@router.get("/",response_model=list[dict])
async def get_all_brands(service:BrandService = Depends(get_brand_service)):
    return await service.get_all_brands()

@router.put("/{brand_id}",response_model=dict)
async def update_brand(brand_id:str,update_data:dict,current_user = Depends(get_current_user),service:BrandService = Depends(get_brand_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to update a brand")
    
    brand = await service.update_brand(brand_id,update_data)
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Brand not found")
    return brand

@router.delete("/{brand_id}",response_model=dict)
async def delete_brand(brand_id:str,current_user = Depends(get_current_user),service:BrandService = Depends(get_brand_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to delete a brand")
    
    result = await service.delete_brand(brand_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Brand not found")
    return {"message":"Brand deleted successfully"}