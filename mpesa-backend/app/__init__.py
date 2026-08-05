from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
jwt = JWTManager()
bcrypt = Bcrypt()


def create_app(config_object=None):
    #Application factory pattern
    app = Flask(__name__)

    # Load configuration
    if config_object:
        app.config.from_object(config_object)
    else:
        app.config.from_object('app.config.Config')

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.payment import payment_bp
    from app.api.business import business_bp
    from app.api.admin import admin_bp
    from app.api.webhook import webhook_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')
    app.register_blueprint(business_bp, url_prefix='/api/business')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(webhook_bp, url_prefix='/api/webhook')

    # Register error handlers
    register_error_handlers(app)

    # Register CLI commands
    register_commands(app)

    return app


def register_error_handlers(app):
    #Register custom error handlers

    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500

    @app.errorhandler(400)
    def bad_request(error):
        return {'error': 'Bad request'}, 400


def register_commands(app):
# creating admin user
    @app.cli.command('create-admin')
    def create_admin():
        from app.models.user import User

        email = input('Enter admin email: ')
        password = input('Enter admin password: ')
        first_name = input('Enter first name: ')
        last_name = input('Enter last name: ')
        phone = input('Enter phone number: ')

        admin = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone,
            role='admin',
            is_verified=True
        )
        admin.set_password(password)

        db.session.add(admin)
        db.session.commit()
        print(f'✅ Admin user created: {email}')