from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from datetime import datetime

from app.database.postgres import get_db
from app.models.orders import Order, OrderStatus, PaymentStatus
from app.services.mpesa_service import MpesaService
from app.services.sms_service import send_sms
from app.core.security import get_current_user

router = APIRouter(prefix='/payments',tags=['Payments'])

class MpesaCallbackRequest(BaseModel):
    Body:dict

@router.post('/orders/{order_id}/mpesa')
async def initiate_mpesa_payment(order_id: int,current_user: dict=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404,detail='Order not found')
    if order.user_id != current_user['id'] and current_user.get('role') != 'admin':
        raise HTTPException(status_code=403,detail='Not your order')
    if order.payment_status != PaymentStatus.PENDING:
        raise HTTPException(status_code=400,detail='Payment already processed')
    
    mpesa = MpesaService()
    result = await mpesa.stk_push(phone_number=order.customer_phone,amount=float(order.total),order_number=order.order_number)
    if result['success']:
        order.payment_refernce = result['checkout_request_id']
        await db.commit()
        return {
            "success": True,
            "checkout_request_id": result["checkout_request_id"],
            "customer_message": result["customer_message"],
            "response_code": result["response_code"]
        }
    else:
        raise HTTPException(status_code=400,detail=result.get('error','Payment initiation failed'))

@router.get('/status/{checkout_request_id}')
async def get_payment_status(checkout_request_id: str,current_user: dict=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    mpesa = MpesaService()
    result = await mpesa.query_status(checkout_request_id)
    order_result = await db.execute(select(Order).where(Order.reference == checkout_request_id))
    order = order_result.scalar_one_or_none()
    is_completed = result.get('ResultCode') == '0'
    
    if is_completed and order.payment_status != PaymentStatus.PAID:
        await db.execute(update(Order).where(Order.id == order.id).values(PaymentStatus=PaymentStatus.PAID,status=OrderStatus.PROCESSING,paid_at=datetime.utcnow(),mpesa_receipt=result.get("ReceiptNumber")))
        await db.commit()
        await send_sms(phone=order.customer_phone,message=f"Payment received! Your order #{order.order_number} is being processed. Thank you for shopping with K-TECH!")
        return {
        "result_code": result.get("ResultCode"),
        "result_desc": result.get("ResultDesc"),
        "completed": is_completed,
        "receipt_number": result.get("ReceiptNumber"),
        "amount": result.get("Amount"),
        "transaction_date": result.get("TransactionDate")
        }
     
@router.post('/mpesa-callback')        
async def mpesa_callback(callback_data:MpesaCallbackRequest,background_tasks:BackgroundTasks,db:AsyncSession=Depends(get_db)):
    try:
        body = callback_data.Body
        stk_callback = body.get('stkCallback',{})
        result_code = stk_callback.get('ResultCode')
        checkout_request_id = stk_callback.get('CheckoutRequestID')
        result_desc = stk_callback.get('ResultDesc')
        order_result = await db.execute(select(Order).where(Order.reference == checkout_request_id))
        order = order_result.scalar_one_or_none()
        
        if not order:
            return{"ResultCode": 1, 'ResultDesc': "Order not found"}
        if result_code == 0:
            callback_metadata = stk_callback.get("CallbackMetadata",{})
            items = callback_metadata.get("item",[])
            amount = next((i['Value'] for i in items if i['Name'] == 'Amount'),None)
            mpesa_receipt = next((i['Value'] for i in items if i['Name'] == 'MpesaReceiptNumber'),None)
            transaction_date = next((i['Value'] for i in items if i['Name'] == 'TransactionDate'),None)
            await db.execute(update(Order).where(Order.id == order.id).values(PaymentStatus=PaymentStatus.PAID,status=OrderStatus.PROCESSING,paid_at=datetime.utcnow(),mpesa_receipt=mpesa_receipt))
            await db.commit()
            
            background_tasks.add_tasks(send_sms,phone=order.cutomer_phone,mesage=f"Payment of KSh {amount:,.2f} received! Order #{order.order_number} confirmed. We'll notify you whenn it ships.")
            print(f"Payment succeful: {mpesa_receipt} for {amount}")
        else:
            await db.execute(update(Order).where(Order.id == order.id).values(PaymentStatus=PaymentStatus.FAILED,status=OrderStatus.CANCELLED))
            await db.commit()
            print(f"Payment failed: {result_desc}")
        return {"ResultCode": 0, "ResultDesc": "Success"}
    except Exception as e:
        print(f"Callback error: {str(e)}")
        return {"ResultCode": 1, "ResultDesc": str(e)}