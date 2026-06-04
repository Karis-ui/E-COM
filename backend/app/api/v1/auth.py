from fastapi import APIRouter,Depends,HTTPException,status,BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.schemas.user import UserCreate,LoginRequest,TokenResponse,UserResponse
from app.database.postgres import get_db
from app.models.user import User,UserRole
from app.core.security import get_password_hash,create_access_token,verify_password,create_refresh_token,get_current_user

router = APIRouter()

@router.post("/register",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
async def register(user:UserCreate,db:AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email) | (User.phone == user.phone))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    new_user = User(
        email=user.email,
        phone=user.phone,
        password_hash=get_password_hash(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login",response_model=TokenResponse)
async def login(user:LoginRequest,db:AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email) | (User.phone == user.phone))
    existing_user = result.scalar_one_or_none()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(user.password,existing_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not existing_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    existing_user.last_login = datetime.utcnow()
    await db.commit()
    access_token = create_access_token({"sub":str(existing_user.id)})
    refresh_token = create_refresh_token({"sub":str(existing_user.id)})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.from_orm(existing_user)
    )

@router.post("/me",response_model=UserResponse)
async def get_current_user(current_user:dict = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user
