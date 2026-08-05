from flask import Blueprint, request, jsonify
from app.services.payment_service import PaymentService
from flask_jwt_extended import jwt_required
from app.models.audit_log import AuditLog
from app.models.user import User
from datetime import datetime
import json

webhook_bp = Blueprint('webhook', __name__)
payment_service = PaymentService()


@webhook_bp.route('/callback', methods=['POST'])
def webhook_callback():
    # Receive webhook from Safaricom for C2B payments. This is the endpoint that Safaricom will call
    
    try:
        # Get webhook data
        webhook_data = request.get_json()

        if not webhook_data:
            return jsonify({
                'ResultCode': 0,
                'ResultDesc': 'No data received'
            }), 200

        # Log raw webhook
        print(f"Webhook received: {json.dumps(webhook_data, indent=2)}")

        # Process webhook
        result = payment_service.process_webhook(webhook_data)

        # Safaricom expects 200 OK with specific format
        if result['success']:
            return jsonify({
                'ResultCode': 0,
                'ResultDesc': 'Success'
            }), 200
        else:
            return jsonify({
                'ResultCode': 1,
                'ResultDesc': result.get('message', 'Processing failed')
            }), 200

    except Exception as e:
        # Even on error, return 200 to Safaricom to prevent retries
        # But log the error
        print(f"Webhook error: {str(e)}")
        return jsonify({
            'ResultCode': 1,
            'ResultDesc': f'Error: {str(e)}'
        }), 200


@webhook_bp.route('/callback/stk', methods=['POST'])
def stk_push_callback():
    # Receive STK Push callback from Safaricom
    try:
        data = request.get_json()

        if not data:
            return jsonify({'ResultCode': 0, 'ResultDesc': 'No data'}), 200

        # Extract result
        body = data.get('Body', {})
        result_code = body.get('stkCallback', {}).get('ResultCode')

        if result_code == 0:
            # Success
            transaction_code = body.get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])
            # Process success...
        else:
            # Failed
            result_desc = body.get('stkCallback', {}).get('ResultDesc', 'Unknown error')
            # Handle failure...

        return jsonify({'ResultCode': 0, 'ResultDesc': 'Success'}), 200

    except Exception as e:
        return jsonify({'ResultCode': 1, 'ResultDesc': str(e)}), 200


@webhook_bp.route('/simulate', methods=['POST'])
def simulate_webhook():
    # Simulate a webhook for testing purposes
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Simulate webhook processing
        result = payment_service.process_webhook(data)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@webhook_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_webhook_logs():
    # Get webhook logs (admin/business only)
    try:
        from flask_jwt_extended import get_jwt_identity
        from app.models.user import User
        from app.models.audit_log import AuditLog

        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if user.role not in ['admin', 'business']:
            return jsonify({'error': 'Unauthorized'}), 403

        # Get webhook logs from audit logs
        webhook_logs = AuditLog.query.filter_by(action='webhook_received').order_by(
            AuditLog.timestamp.desc()
        ).limit(100).all()

        return jsonify({
            'logs': [log.to_dict() for log in webhook_logs],
            'count': len(webhook_logs)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500