from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.business import Business
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.services.payment_service import PaymentService
from datetime import datetime

admin_bp = Blueprint('admin', __name__)
payment_service = PaymentService()


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        users = User.query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'users': [u.to_dict() for u in users.items],
            'total': users.total,
            'page': users.page,
            'pages': users.pages
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)

        if admin.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.json

        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']

        db.session.commit()

        AuditLog.log_action(
            user_id=admin_id,
            action='admin_updated_user',
            details={'user_id': user_id, 'changes': data},
            ip_address=request.remote_addr
        )

        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)

        if admin.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        db.session.delete(user)
        db.session.commit()

        AuditLog.log_action(
            user_id=admin_id,
            action='admin_deleted_user',
            details={'user_id': user_id},
            ip_address=request.remote_addr
        )

        return jsonify({'message': 'User deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/businesses', methods=['GET'])
@jwt_required()
def get_businesses():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        businesses = Business.query.all()

        return jsonify({
            'businesses': [b.to_dict() for b in businesses]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/businesses/<int:business_id>/approve', methods=['PUT'])
@jwt_required()
def approve_business(business_id):
    try:
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)

        if admin.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        business = Business.query.get(business_id)
        if not business:
            return jsonify({'error': 'Business not found'}), 404

        business.status = 'active'
        db.session.commit()

        # Log action
        AuditLog.log_action(
            user_id=admin_id,
            action='admin_approved_business',
            details={'business_id': business_id, 'business_name': business.business_name},
            ip_address=request.remote_addr
        )

        return jsonify({
            'message': 'Business approved successfully',
            'business': business.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)

        logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'logs': [l.to_dict() for l in logs.items],
            'total': logs.total,
            'page': logs.page,
            'pages': logs.pages
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        # Count users
        user_count = User.query.count()

        # Count businesses
        business_count = Business.query.count()

        # Count transactions by status
        pending = Transaction.query.filter_by(status='pending').count()
        verified = Transaction.query.filter_by(status='verified').count()
        failed = Transaction.query.filter_by(status='failed').count()

        # Count webhook transactions
        webhook_count = Transaction.query.filter_by(verification_source='webhook').count()

        # Total amount verified
        total_amount = db.session.query(
            db.func.sum(Transaction.amount)
        ).filter_by(status='verified').scalar() or 0

        # Recent activity
        recent_logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(50).all()

        return jsonify({
            'stats': {
                'total_users': user_count,
                'total_businesses': business_count,
                'transactions': {
                    'pending': pending,
                    'verified': verified,
                    'failed': failed,
                    'total': pending + verified + failed,
                    'webhook_verified': webhook_count
                },
                'total_amount_verified': float(total_amount)
            },
            'recent_activity': [l.to_dict() for l in recent_logs]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500