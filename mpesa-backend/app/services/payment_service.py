from app import db
from app.models.transaction import Transaction
from app.models.invoice import InvoicePaymentRequest
from app.models.audit_log import AuditLog
from app.models.business import Business
from app.models.user import User
from app.services.mpesa_service import MpesaService
from datetime import datetime

#Handling payment verification
class PaymentService:

    def __init__(self):
        self.mpesa_service = MpesaService()

    def verify_payment(self, user_id, transaction_cd, amount, phone_number):
        # Check if transaction already exists (prevent duplicates)
        existing = Transaction.query.filter_by(transaction_cd=transaction_cd).first()
        if existing:
            return {
                'success': False,
                'message': 'Transaction code already verified',
                'transaction': existing.to_dict()
            }

        # Verify with M-Pesa API
        verification_result = self.mpesa_service.verify_transaction(
            transaction_cd, amount, phone_number
        )

        # Create transaction record
        transaction = Transaction(
            user_id=user_id,
            transaction_cd=transaction_cd,
            amount=amount,
            phone_number=phone_number,
            verification_source='manual',
            status='verified' if verification_result.get('verified') else 'failed'
        )

        if verification_result.get('verified'):
            transaction.verified_at = datetime.utcnow()

            # Try to find matching invoice
            invoice = InvoicePaymentRequest.query.filter_by(
                customer_phone=phone_number,
                expected_amount=amount,
                status='pending'
            ).first()

            if invoice:
                transaction.invoice_id = invoice.request_id
                invoice.status = 'paid'
                invoice.updated_at = datetime.utcnow()

        db.session.add(transaction)
        db.session.commit()

        # Log the verification
        AuditLog.log_action(
            user_id=user_id,
            action='payment_verification',
            details={
                'transaction_cd': transaction_cd,
                'amount': amount,
                'phone_number': phone_number,
                'status': transaction.status,
                'verified': verification_result.get('verified')
            }
        )

        return {
            'success': verification_result.get('verified', False),
            'message': verification_result.get('message', 'Verification completed'),
            'transaction': transaction.to_dict()
        }

    # webhook notification from Safaricom
    def process_webhook(self, webhook_data):

        # Extract data from webhook
        transaction_cd = webhook_data.get('TransID')
        amount = webhook_data.get('TransAmount')
        phone_number = webhook_data.get('MSISDN')
        business_shortcode = webhook_data.get('BusinessShortCode')
        bill_ref = webhook_data.get('BillRefNumber')

        # Validate required fields
        if not all([transaction_cd, amount, phone_number]):
            return {
                'success': False,
                'message': 'Missing required fields in webhook'
            }

        # Check if transaction already exists
        existing = Transaction.query.filter_by(transaction_cd=transaction_cd).first()
        if existing:
            return {
                'success': True,
                'message': 'Transaction already processed',
                'transaction': existing.to_dict()
            }

        # Find business by shortcode
        business = None
        if business_shortcode:
            business = Business.query.filter(
                (Business.paybill_number == business_shortcode) |
                (Business.till_number == business_shortcode)
            ).first()

        # Try to find matching invoice
        invoice = InvoicePaymentRequest.query.filter_by(
            customer_phone=phone_number,
            expected_amount=float(amount),
            status='pending'
        ).first()

        # Create transaction
        transaction = Transaction(
            user_id=None,  # Could be matched by phone number
            business_id=business.business_id if business else None,
            transaction_cd=transaction_cd,
            amount=float(amount),
            phone_number=phone_number,
            verification_source='webhook',
            status='verified',
            verified_at=datetime.utcnow(),
            webhook_received_at=datetime.utcnow()
        )

        if invoice:
            transaction.invoice_id = invoice.request_id
            invoice.status = 'paid'
            invoice.updated_at = datetime.utcnow()

        db.session.add(transaction)

        # Find user by phone number to log action
        from app.models.user import User
        user = User.query.filter_by(phone_number=phone_number).first()

        if user:
            AuditLog.log_action(
                user_id=user.user_id,
                action='webhook_received',
                details={
                    'transaction_cd': transaction_cd,
                    'amount': amount,
                    'business_shortcode': business_shortcode,
                    'bill_ref': bill_ref
                }
            )

        db.session.commit()

        return {
            'success': True,
            'message': 'Webhook processed successfully',
            'transaction': transaction.to_dict()
        }

    def get_transaction_history(self, user_id, filters=None):
        """
        Get transaction history for a user
        """
        query = Transaction.query.filter_by(user_id=user_id)

        if filters:
            if filters.get('status'):
                query = query.filter_by(status=filters['status'])
            if filters.get('date_from'):
                query = query.filter(Transaction.timestamp >= filters['date_from'])
            if filters.get('date_to'):
                query = query.filter(Transaction.timestamp <= filters['date_to'])
            if filters.get('search'):
                search = filters['search']
                query = query.filter(
                    Transaction.transaction_cd.ilike(f'%{search}%') |
                    Transaction.phone_number.ilike(f'%{search}%')
                )

        # Order by timestamp descending (most recent first)
        query = query.order_by(Transaction.timestamp.desc())

        # Pagination
        page = filters.get('page', 1)
        per_page = filters.get('per_page', 20)

        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'transactions': [t.to_dict() for t in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }

    def get_business_transactions(self, business_id, filters=None):
        """
        Get transactions for a business
        """
        query = Transaction.query.filter_by(business_id=business_id)

        if filters:
            if filters.get('status'):
                query = query.filter_by(status=filters['status'])
            if filters.get('date_from'):
                query = query.filter(Transaction.timestamp >= filters['date_from'])
            if filters.get('date_to'):
                query = query.filter(Transaction.timestamp <= filters['date_to'])
            if filters.get('search'):
                search = filters['search']
                query = query.filter(
                    Transaction.transaction_cd.ilike(f'%{search}%') |
                    Transaction.phone_number.ilike(f'%{search}%')
                )

        query = query.order_by(Transaction.timestamp.desc())

        page = filters.get('page', 1)
        per_page = filters.get('per_page', 20)

        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'transactions': [t.to_dict() for t in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }

    def get_business_stats(self, business_id):
        # Today's payments
        today = datetime.utcnow().date()
        today_start = datetime(today.year, today.month, today.day)

        # All verified transactions
        verified = Transaction.query.filter_by(
            business_id=business_id,
            status='verified'
        )

        # Today's total
        today_total = verified.filter(Transaction.timestamp >= today_start).all()
        today_sum = sum(float(t.amount) for t in today_total)

        # Total all time
        all_transactions = verified.all()
        total_sum = sum(float(t.amount) for t in all_transactions)

        # Pending count
        pending = Transaction.query.filter_by(
            business_id=business_id,
            status='pending'
        ).count()

        # Webhook count
        webhook_count = Transaction.query.filter_by(
            business_id=business_id,
            verification_source='webhook'
        ).count()

        return {
            'today': today_sum,
            'total': total_sum,
            'pending': pending,
            'webhook_count': webhook_count,
            'transaction_count': len(all_transactions)
        }