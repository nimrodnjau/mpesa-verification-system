from app import db
from datetime import datetime


class Business(db.Model):
    __tablename__ = 'businesses'

    business_id = db.Column(db.Integer, primary_key=True)
    owner_user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    business_name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    status = db.Column(db.String(20), default='pending')  # pending, active, suspended
    paybill_number = db.Column(db.String(20))
    till_number = db.Column(db.String(20))
    webhook_endpoint = db.Column(db.String(255))
    is_webhook_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    invoices = db.relationship('InvoicePaymentRequest', backref='business', lazy=True)
    transactions = db.relationship('Transaction', backref='business', lazy=True)

    def to_dict(self):
        return {
            'business_id': self.business_id,
            'owner_user_id': self.owner_user_id,
            'business_name': self.business_name,
            'location': self.location,
            'status': self.status,
            'paybill_number': self.paybill_number,
            'till_number': self.till_number,
            'is_webhook_active': self.is_webhook_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Business {self.business_name}>'