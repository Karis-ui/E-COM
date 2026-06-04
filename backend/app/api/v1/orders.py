from fastapi import APIRouter,Depends,HTTPException,Request,Cookie,Response
from app.services.cart_service import CartService
from app.services.product_service import ProductService
from app.models.user import User
from app.core.security import get_current_user
from app.api.v1.cart import get_cart_id
from app.database.mongodb import get_mongo_db
from typing import Optional
from pydantic import BaseModel,Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import get_db
from app.services.order_service import OrderService
from app.services.mpesa_service import MpesaService


router = APIRouter(prefix="/orders",tags=["orders"])

class CheckoutRequest(BaseModel):
    deliver_details:dict
    payment_method:str

class MPesaCallbackRequest(BaseModel):
    Body:dict

def get_product_service():
    return ProductService()

@router.post("/checkout")
async def create_order(request:CheckoutRequest,current_user:dict=Depends(get_current_user),cart_id:str=Depends(get_cart_id),db:AsyncSession=Depends(get_db),product_service:ProductService=Depends(get_product_service)):
    request.deliver_details["phone"] = current_user["phone"]
    order = await OrderService.create_order(
        db=db,
        user_id=current_user["id"],
        cart_id=cart_id,
        delivery_details=request.deliver_details,
        payment_method=request.payment_method,
        product_service=product_service
    )
    if request.payment_method == "mpesa":
        mpesa_service = MpesaService()
        mpesa_response = await mpesa_service.stk_push(
            phone_number=current_user["phone"],
            amount=order["total_amount"],
            order_number=order["order_number"]
        )
        if mpesa_response["success"]:
            await OrderService.update_order_status(
                db=db,
                order_id=order["id"],
                status="pending"
            )
            return{
                "order":order,
                "mpesa_response":{
                    "success":True,
                    "message":"Mpesa push sent successfully",
                    "checkout_request_id":mpesa_response["checkout_request_id"],
                    "instructions":"Please enter your PIN to complete the transaction"
                }
            }
        else:
            return{
                "order":order,
                "mpesa_response":{
                    "success":False,
                    "message":"Failed to send Mpesa push",
                    "error":mpesa_response["error"]
                }
            }
    return {
        "success":True,
        "message":"Order created successfully",
        "order":order
    }

@router.get("/")
async def get_my_orders(current_user:dict=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    orders = await OrderService.get_orders_by_user(db,current_user["id"])
    return orders

@router.get("/{order_id}")
async def get_order_details(order_id:str,current_user:dict=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    order = await OrderService.get_order_by_id(db,order_id,current_user["id"])
    if not order:
        raise HTTPException(status_code=404,detail="Order not found")
    return order

@router.post("/mpesa-callback")
async def mpesa_callback(request:MPesaCallbackRequest,db:AsyncSession=Depends(get_db)):
    try:
        body = request.Body
        stk_callback = body.get("Body",{}).get("stkCallback",{})
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")
        checkout_request_id = stk_callback.get("CheckoutRequestID",{}).get("Item",[])
        
        if result_code == 0:
            callback_metadata = stk_callback.get("CallbackMetadata",{}).get("Item",[])
            item = callback_metadata("Item",[])
            amount = next((i["Value"] for i in item if i["Key"] == "Amount"),None)
            mpesa_receipt = next((i["Value"] for i in item if i["Key"] == "MpesaReceiptNumber"),None)
            transaction_date = next((i["Value"] for i in item if i["Key"] == "TransactionDate"),None)
            phone = next((i["Value"] for i in item if i["Key"] == "PhoneNumber"),None)
            
            if amount and mpesa_receipt and transaction_date and phone:
                await OrderService.update_order_status(
                    db=db,
                    order_id=checkout_request_id,
                    status="paid"
                )
                print(f"Payment successful for order {checkout_request_id}")
                return {
                    "success":True,
                    "message":"Order paid successfully"
                }
            else:
                return {
                    "success":False,
                    "message":"Order payment failed"
                }
        else:
            return {
                "success":False,
                "message":"Order payment failed"
            }
    except Exception as e:
        print(f"Error processing Mpesa callback: {str(e)}")
        return {
            "success":False,
            "message":"Order payment failed"
        }