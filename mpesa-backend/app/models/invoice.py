from app import db
from datetime import datetime


class InvoicePaymentRequest(db.Model):
    __tablename__ = 'invoices_payment_requests'

    request_id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.business_id'), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    expected_amount = db.Column(db.Numeric(10, 2), nullable=False)
    reference = db.Column(db.String(50))
    status = db.Column(db.String(20), default='pending')  # pending, paid, overdue, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transaction = db.relationship('Transaction', backref='invoice', lazy=True, uselist=False)

    def to_dict(self):
        return {
            'request_id': self.request_id,
            'business_id': self.business_id,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'expected_amount': float(self.expected_amount),
            'reference': self.reference,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }