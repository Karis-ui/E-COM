from fastapi import requests
import base64
import json
from typing import Optional,Dict
from app.config import settings
from datetime import datetime

class MpesaService:
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.passkey = settings.MPESA_PASSKEY
        self.shortcode = settings.MPESA_SHORTCODE
        self.callback_url = settings.MPESA_CALLBACK_URL
        self.environment = settings.MPESA_ENVIRONMENT

        if self.environment == "production":
            self.base_url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            self.token_url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        else:
            self.base_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            self.token_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    def get_access_token(self):
        url = self.token_url
        auth = base64.b64encode(f"{self.consumer_key}:{self.consumer_secret}".encode()).decode()
        headers = {"Authorization": f"Basic {auth}"}
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            raise Exception("Failed to get access token")
    
    async def stk_push(self,phone_number:str,amount:float,order_number:str) -> Dict[str,any]:
        access_token = await self.get_access_token()

        if phone_number.startswith("0"):
            phone_number = "254" + phone_number[1:]
        elif phone_number.startswith("+"):
            phone_number = phone_number[1:]
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(f"{self.shortcode}{self.passkey}{timestamp}".encode()).decode()
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        headers = {"Authorization": f"Bearer {access_token}","Content-Type":"application/json"}
        
        payload = {
            "BusinessShortCode":self.shortcode,
            "Password":password,
            "Timestamp":timestamp,
            "TransactionType":"CustomerPayBillOnline",
            "Amount":amount,
            "PartyA":phone_number,
            "PartyB":self.shortcode,
            "PhoneNumber":phone_number,
            "CallBackURL":self.callback_url,
            "AccountReference":"",
            "TransactionDesc":"Payment for goods"
        }
        response = requests.post(url,headers=headers,json=payload)
        if response.status_code == 200:
            result = response.json()
            return{
                "status":"success",
                "checkout_request_id":result["CheckoutRequestID"],
                "data":result
            }
        else:
            raise Exception(f"Failed to process STK push: {response.text}")
    
    async def query_status(self,checkout_request_id:str) -> Dict[str,any]:
        access_token = await self.get_access_token()
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(f"{self.shortcode}{self.passkey}{timestamp}".encode()).decode()
        url = f"{self.base_url}/mpesa/stkpush/v1/query"
        headers = {"Authorization": f"Bearer {access_token}","Content-Type":"application/json"}
        payload = {
            "BusinessShortCode":self.shortcode,
            "Password":password,
            "Timestamp":timestamp,
            "cheoutRequestId":checkout_request_id
        }
        response = requests.post(url,headers=headers,json=payload)
        if response.status_code == 200:
            result = response.json()
            return{
                "status":"success",
                "checkout_request_id":result["CheckoutRequestID"],
                "data":result
            }
        else:
            raise Exception(f"Failed to process STK push: {response.text}")