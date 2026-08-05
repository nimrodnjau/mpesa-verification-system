from app import db
from datetime import datetime


class Transaction(db.Model):
    __tablename__ = 'transactions'

    transaction_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.business_id'), nullable=True)
    transaction_cd = db.Column(db.String(50), unique=True, nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, verified, failed
    verification_source = db.Column(db.String(20), default='manual')  # manual, webhook
    verified_at = db.Column(db.DateTime)
    webhook_received_at = db.Column(db.DateTime)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Optional invoice relationship
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices_payment_requests.request_id'), nullable=True)

    def to_dict(self):
        return {
            'transaction_id': self.transaction_id,
            'user_id': self.user_id,
            'business_id': self.business_id,
            'transaction_cd': self.transaction_cd,
            'amount': float(self.amount),
            'phone_number': self.phone_number,
            'status': self.status,
            'verification_source': self.verification_source,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'webhook_received_at': self.webhook_received_at.isoformat() if self.webhook_received_at else None
        }

    def __repr__(self):
        return f'<Transaction {self.transaction_cd}>'