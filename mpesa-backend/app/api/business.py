from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app import db
from app.models.business import Business
from app.models.invoice import InvoicePaymentRequest
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.business import RegisterBusinessSchema, WebhookSettingsSchema, InvoiceSchema
from app.services.payment_service import PaymentService

business_bp = Blueprint('business', __name__)
payment_service = PaymentService()


@business_bp.route('/register', methods=['POST'])
@jwt_required()
def register_business():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        schema = RegisterBusinessSchema()
        data = schema.load(request.json)

        # Check if user already has a business
        existing = Business.query.filter_by(owner_user_id=user_id).first()
        if existing:
            return jsonify({'error': 'User already owns a business'}), 409

        # Check if business name exists
        if Business.query.filter_by(business_name=data['business_name']).first():
            return jsonify({'error': 'Business name already registered'}), 409

        business = Business(
            owner_user_id=user_id,
            business_name=data['business_name'],
            location=data.get('location'),
            paybill_number=data.get('paybill_number'),
            till_number=data.get('till_number'),
            status='pending'
        )

        db.session.add(business)
        db.session.commit()

        # Update user role
        user.role = 'business'
        db.session.commit()

        AuditLog.log_action(
            user_id=user_id,
            action='business_registered',
            details={'business_name': business.business_name},
            ip_address=request.remote_addr
        )

        return jsonify({
            'message': 'Business registered successfully',
            'business': business.to_dict()
        }), 201

    except ValidationError as e:
        return jsonify({'errors': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@business_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_business_dashboard():
    try:
        user_id = get_jwt_identity()
        business = Business.query.filter_by(owner_user_id=user_id).first()

        if not business:
            return jsonify({'error': 'No business found'}), 404

        # Get statistics
        stats = payment_service.get_business_stats(business.business_id)

        # Get recent transactions
        filters = {'page': 1, 'per_page': 20}
        transactions = payment_service.get_business_transactions(
            business.business_id, filters
        )

        return jsonify({
            'business': business.to_dict(),
            'stats': stats,
            'transactions': transactions
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@business_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_business_transactions():
    try:
        user_id = get_jwt_identity()
        business = Business.query.filter_by(owner_user_id=user_id).first()

        if not business:
            return jsonify({'error': 'No business found'}), 404

        from app.schemas.payment import TransactionHistorySchema
        schema = TransactionHistorySchema()
        filters = schema.load(request.args)

        result = payment_service.get_business_transactions(
            business.business_id, filters
        )

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@business_bp.route('/webhook-settings', methods=['PUT'])
@jwt_required()
def update_webhook_settings():
    try:
        user_id = get_jwt_identity()
        business = Business.query.filter_by(owner_user_id=user_id).first()

        if not business:
            return jsonify({'error': 'No business found'}), 404

        schema = WebhookSettingsSchema()
        data = schema.load(request.json)

        if 'paybill_number' in data:
            business.paybill_number = data['paybill_number']
        if 'till_number' in data:
            business.till_number = data['till_number']
        if 'webhook_endpoint' in data:
            business.webhook_endpoint = data['webhook_endpoint']
        if 'is_webhook_active' in data:
            business.is_webhook_active = data['is_webhook_active']

        db.session.commit()

        AuditLog.log_action(
            user_id=user_id,
            action='webhook_settings_updated',
            details={'business_id': business.business_id},
            ip_address=request.remote_addr
        )

        return jsonify({
            'message': 'Webhook settings updated',
            'business': business.to_dict()
        }), 200

    except ValidationError as e:
        return jsonify({'errors': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@business_bp.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    try:
        user_id = get_jwt_identity()
        business = Business.query.filter_by(owner_user_id=user_id).first()

        if not business:
            return jsonify({'error': 'No business found'}), 404

        schema = InvoiceSchema()
        data = schema.load(request.json)

        invoice = InvoicePaymentRequest(
            business_id=business.business_id,
            customer_name=data['customer_name'],
            customer_phone=data['customer_phone'],
            expected_amount=data['expected_amount'],
            reference=data.get('reference'),
            status='pending'
        )

        db.session.add(invoice)
        db.session.commit()

        return jsonify({
            'message': 'Invoice created successfully',
            'invoice': invoice.to_dict()
        }), 201

    except ValidationError as e:
        return jsonify({'errors': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@business_bp.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    try:
        user_id = get_jwt_identity()
        business = Business.query.filter_by(owner_user_id=user_id).first()

        if not business:
            return jsonify({'error': 'No business found'}), 404

        invoices = InvoicePaymentRequest.query.filter_by(
            business_id=business.business_id
        ).order_by(InvoicePaymentRequest.created_at.desc()).all()

        return jsonify({
            'invoices': [i.to_dict() for i in invoices]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@business_bp.route('/reports', methods=['GET'])
@jwt_required()
def generate_reports():
    try:
        user_id = get_jwt_identity()
        business = Business.query.filter_by(owner_user_id=user_id).first()

        if not business:
            return jsonify({'error': 'No business found'}), 404

        # Get all verified transactions
        transactions = Transaction.query.filter_by(
            business_id=business.business_id,
            status='verified'
        ).all()

        # Generate summary
        total_income = sum(float(t.amount) for t in transactions)
        total_count = len(transactions)
        webhook_count = sum(1 for t in transactions if t.verification_source == 'webhook')

        return jsonify({
            'business': business.business_name,
            'summary': {
                'total_income': total_income,
                'total_transactions': total_count,
                'webhook_verified': webhook_count,
                'manual_verified': total_count - webhook_count
            },
            'recent': [t.to_dict() for t in transactions[:50]]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500