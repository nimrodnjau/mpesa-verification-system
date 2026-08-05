from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.services.payment_service import PaymentService
from app.schemas.payment import VerifyPaymentSchema, TransactionHistorySchema
from app.models.audit_log import AuditLog
from app.models.transaction import Transaction
from app import db

payment_bp = Blueprint('payment', __name__)
payment_service = PaymentService()


@payment_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    try:
        user_id = get_jwt_identity()
        schema = VerifyPaymentSchema()
        data = schema.load(request.json)

        result = payment_service.verify_payment(
            user_id=user_id,
            transaction_cd=data['transaction_cd'],
            amount=data['amount'],
            phone_number=data['phone_number']
        )

        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except ValidationError as e:
        return jsonify({'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_transaction_history():
    # Get user's transaction history
    try:
        user_id = get_jwt_identity()
        schema = TransactionHistorySchema()
        data = schema.load(request.args)

        result = payment_service.get_transaction_history(user_id, data)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/transaction/<transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    # Get a specific transaction
    try:
        user_id = get_jwt_identity()
        from app.models.transaction import Transaction

        transaction = Transaction.query.get(transaction_id)

        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404

        # Check if user owns this transaction
        if transaction.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        return jsonify(transaction.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/receipt/<transaction_id>', methods=['GET'])
@jwt_required()
def download_receipt(transaction_id):
    #Download receipt for a transaction
    try:
        user_id = get_jwt_identity()
        from app.models.transaction import Transaction

        transaction = Transaction.query.get(transaction_id)

        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404

        if transaction.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        # return transaction details
        return jsonify({
            'message': 'Receipt generated',
            'transaction': transaction.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_payment_statistics():
    #Get payment statistics for the current user
    try:
        user_id = get_jwt_identity()
        from app.models.transaction import Transaction
        from datetime import datetime, timedelta

        # Last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        total = Transaction.query.filter_by(
            user_id=user_id,
            status='verified'
        ).count()

        total_amount = db.session.query(
            db.func.sum(Transaction.amount)
        ).filter_by(
            user_id=user_id,
            status='verified'
        ).scalar() or 0

        recent = Transaction.query.filter_by(
            user_id=user_id,
            status='verified'
        ).filter(Transaction.timestamp >= thirty_days_ago).count()

        return jsonify({
            'total_verifications': total,
            'total_amount': float(total_amount),
            'recent_verifications': recent,
            'period': 'last_30_days'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500