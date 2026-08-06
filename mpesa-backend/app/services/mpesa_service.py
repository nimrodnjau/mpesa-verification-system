import requests
import base64
import json
from datetime import datetime
from flask import current_app


class MpesaService:
    """Service for interacting with M-Pesa Daraja API"""

    BASE_URL = 'https://sandbox.safaricom.co.ke'
    TOKEN_URL = '/oauth/v1/generate?grant_type=client_credentials'
    C2B_URL = '/mpesa/c2b/v1/registerurl'
    STK_PUSH_URL = '/mpesa/stkpush/v1/processrequest'
    QUERY_URL = '/mpesa/stkpush/v1/query'

    def __init__(self):
        # Don't access current_app here - use properties instead
        pass

    @property
    def consumer_key(self):
        return current_app.config.get('MPESA_CONSUMER_KEY')

    @property
    def consumer_secret(self):
        return current_app.config.get('MPESA_CONSUMER_SECRET')

    @property
    def passkey(self):
        return current_app.config.get('MPESA_PASSKEY')

    @property
    def shortcode(self):
        return current_app.config.get('MPESA_SHORTCODE')

    @property
    def callback_url(self):
        return current_app.config.get('MPESA_CALLBACK_URL')

    def get_access_token(self):
        """Get M-Pesa access token"""
        auth = base64.b64encode(f"{self.consumer_key}:{self.consumer_secret}".encode()).decode()
        headers = {'Authorization': f'Basic {auth}'}

        response = requests.get(
            f"{self.BASE_URL}{self.TOKEN_URL}",
            headers=headers
        )

        if response.status_code == 200:
            return response.json().get('access_token')
        else:
            raise Exception(f"Failed to get access token: {response.text}")

    def verify_transaction(self, transaction_code, amount, phone_number):
        """
        Verify an M-Pesa transaction
        """
        try:
            # Get access token
            token = self.get_access_token()

            # For sandbox, simulate verification
            return {
                'verified': True,
                'transaction_code': transaction_code,
                'amount': amount,
                'phone_number': phone_number,
                'status': 'completed',
                'message': 'Transaction verified successfully'
            }

        except Exception as e:
            return {
                'verified': False,
                'message': f'Verification failed: {str(e)}'
            }

    def register_c2b_urls(self, confirmation_url, validation_url=None):
        """
        Register C2B URLs for receiving webhook notifications
        """
        token = self.get_access_token()

        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

        payload = {
            'ShortCode': self.shortcode,
            'ResponseType': 'Completed',
            'ConfirmationURL': confirmation_url,
            'ValidationURL': validation_url or confirmation_url
        }

        response = requests.post(
            f"{self.BASE_URL}{self.C2B_URL}",
            headers=headers,
            json=payload
        )

        return response.json()

    def simulate_c2b_payment(self, amount, phone_number, reference=None):
        """
        Simulate a C2B payment (for testing in sandbox)
        """
        token = self.get_access_token()

        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

        payload = {
            'ShortCode': self.shortcode,
            'CommandID': 'CustomerPayBillOnline',
            'Amount': amount,
            'Msisdn': phone_number,
            'BillRefNumber': reference or 'TEST'
        }

        response = requests.post(
            f"{self.BASE_URL}/mpesa/c2b/v1/simulate",
            headers=headers,
            json=payload
        )

        return response.json()

        