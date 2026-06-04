import httpx
from app.config import settings

async def send_sms(phone:str,message:str,sender_id:str=None):
    if phone.startswith("0"):
        phone = '254' + phone[1:]
    elif phone.startswith('+'):
        phone = phone[1:]
    
    url = "https://api.africastalking.com/version1/messaging"
    headers = {
        "apiKey":settings.AT_API_KEY,
        "username":settings.AT_USERNAME,
        "Accept":"application/json"
    }
    data = {
        "username":settings.AT_USERNAME,
        "to":phone,
        "message":message,
        "from":sender_id or settings.AT_SENDER_ID
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url,headers=headers,data=data)
            if response.status_code == 200:
                print(f"SMS sent successfully to {phone}")
                return response.json()
            else:
                print(f"Failed to send SMS to {phone} {response.json()}")
                return None
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return None

async def send_order_confirmation(phone:str,order_number:str,total:float):
    message = f"ElectroShop: Your order {order_number} has been confirmed. Total: KES {total}"
    await send_sms(phone=phone,message=message,sender_id=settings.AT_SENDER_ID)

async def send_deliver_otp(phone:str,otp:str):
    message = f"ElectroShop: Your delivery OTP is {otp}. Valid for 5 minutes"
    await send_sms(phone=phone,message=message,sender_id=settings.AT_SENDER_ID)

async def send_deliver_update(phone:str,order_number:str,status:str,rider_name:str=None):
    if status == "shipped":
        message = f"ElectroShop: Your order {order_number} has been shipped. Rider: {rider_name}"
    elif status == "delivered":
        message = f"ElectroShop: Your order {order_number} has been delivered. Rider: {rider_name}"
        
    await send_sms(phone=phone,message=message,sender_id=settings.AT_SENDER_ID)