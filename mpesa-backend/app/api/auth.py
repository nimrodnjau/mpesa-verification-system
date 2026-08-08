from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app import db, bcrypt
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.auth import RegisterSchema, LoginSchema, RefreshTokenSchema
from app.utils.validators import validate_email, validate_phone
from datetime import datetime

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # Validate request data
        schema = RegisterSchema()
        data = schema.load(request.json)

        # Check if email exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409

        # Check if phone exists
        if User.query.filter_by(phone_number=data['phone_number']).first():
            return jsonify({'error': 'Phone number already registered'}), 409

        # ✅ Check if business name exists (if role is business)
        if data.get('role') == 'business' and data.get('business_data'):
            business_name = data['business_data'].get('business_name')
            if Business.query.filter_by(business_name=business_name).first():
                return jsonify({'error': 'Business name already registered'}), 409

        # Create user
        user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone_number=data['phone_number'],
            role='user',
            is_active=True
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

         # ✅ If role is 'business', create BUSINESS record
        business = None
        if user.role == 'business' and data.get('business_data'):
            business_data = data['business_data']
            business = Business(
                owner_user_id=user.user_id,  # Link to user account
                business_name=business_data.get('business_name'),
                location=business_data.get('location'),
                paybill_number=business_data.get('paybill_number'),
                till_number=business_data.get('till_number'),
                status='pending'
            )
            db.session.add(business)
            db.session.commit()

        # Create audit log
        AuditLog.log_action(
            user_id=user.user_id,
            action='user_registered',
            details={'email': user.email},
            ip_address=request.remote_addr
        )

        # Generate tokens (Convert ID to string for JWT compatibility)
        access_token = create_access_token(identity=str(user.user_id))
        refresh_token = create_refresh_token(identity=str(user.user_id))

        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except ValidationError as e:
        return jsonify({'errors': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        schema = LoginSchema()
        data = schema.load(request.json)

        # Find user by email
        user = User.query.filter_by(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401

        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401

        # Generate tokens (Convert ID to string for JWT compatibility)
        access_token = create_access_token(identity=str(user.user_id))
        refresh_token = create_refresh_token(identity=str(user.user_id))

        # Log login
        AuditLog.log_action(
            user_id=user.user_id,
            action='user_login',
            ip_address=request.remote_addr
        )

        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    except ValidationError as e:
        return jsonify({'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        access_token = create_access_token(identity=str(current_user_id))

        return jsonify({
            'access_token': access_token
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        user_id = get_jwt_identity()

        AuditLog.log_action(
            user_id=user_id,
            action='user_logout',
            ip_address=request.remote_addr
        )

        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    # In production, implement email verification with JWT
    return jsonify({'message': 'Email verification endpoint'}), 200