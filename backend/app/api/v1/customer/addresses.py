from fastapi import APIRouter, Depends, HTTPException,status
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from sqlalchemy import select,update
from app.api.v1.auth import get_current_user
from app.models.address import CustomerAddress
from app.database.postgres import get_db
from sqlalchemy.ext.asyncio import AsyncSession
 
router = APIRouter(prefix="/customer/addresses",tags=["Customer Addresses"])

@router.post("/", response_model=AddressResponse,status_code=status.HTTP_201_CREATED)
async def create_address(address: AddressCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if address.is_default:
        await db.execute(update(CustomerAddress).where(CustomerAddress.user_id == current_user["id"]).values(is_default=False))
    
    new_address = CustomerAddress(user_id = current_user["id"],**address.model_dump())
    db.add(new_address)
    await db.commit()
    await db.refresh(new_address)
    return new_address

@router.get("/", response_model=list[AddressResponse])
async def get_addresses(current_user: dict = Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result = await db.execute(select(CustomerAddress).where(CustomerAddress.user_id == current_user["id"]))
    address = result.scalars().all()
    return address

@router.get("/{address_id}", response_model=AddressResponse)
async def set_default_address(address_id: int, current_user: dict = Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    await db.execute(update(CustomerAddress).where(CustomerAddress.id == address_id).values(is_default=True))
    await db.execute(update(CustomerAddress).where(CustomerAddress.user_id == current_user["id"]).values(is_default=False))
    await db.commit()
    return {"message":"Address set as default successfully"}

@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(address_id: int, current_user: dict = Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result = await db.execute(select(CustomerAddress).where(CustomerAddress.id == address_id,CustomerAddress.user_id == current_user["id"]).values(is_default=True))
    address = result.scalars().first()
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Address not found")
    await db.commit()
    await db.refresh(address)
    return address

@router.delete("/{address_id}", response_model=AddressResponse)
async def delete_address(address_id: int, current_user: dict = Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result = await db.execute(select(CustomerAddress).where(CustomerAddress.id == address_id))
    address = result.scalars().first()
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Address not found")
    await db.delete(address)
    await db.commit()
    return address