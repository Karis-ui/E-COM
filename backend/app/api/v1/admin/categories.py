from fastapi import APIRouter,Depends,HTTPException,status
from app.services.category_service import CategoryService
from app.database.mongodb import get_mongo_db
from app.services.category_service import CategoryService
from app.core.security import get_current_user

router = APIRouter(prefix="/categories",tags=["Admin - categories"])

def get_category_service(db = Depends(get_mongo_db)):
    return CategoryService(db)

@router.post("/",response_model=dict,status_code=status.HTTP_201_CREATED)
async def create_category(category_data:dict,current_user = Depends(get_current_user),service:CategoryService = Depends(get_category_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to create a category")
    if "name" not in category_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Category name is required")
    
    category = await service.create_category(category_data,current_user["id"])
    return category

@router.get("/",response_model=list[dict])
async def get_all_categories(service:CategoryService = Depends(get_category_service)):
    return await service.get_all_active_categories()

@router.put("/{category_id}",response_model=dict)
async def update_category(category_id:str,update_data:dict,current_user = Depends(get_current_user),service:CategoryService = Depends(get_category_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to update a category")
    
    category = await service.update_category(category_id,update_data)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Category not found")
    return category

@router.delete("/{category_id}",response_model=dict)
async def delete_category(category_id:str,current_user = Depends(get_current_user),service:CategoryService = Depends(get_category_service)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to delete a category")
    
    result = await service.delete_category(category_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Category not found")
    return {"message":"Category deleted successfully"}