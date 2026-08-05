# Helper utilities for common operations
import json
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify


def generate_token():
    # Generate a secure random token
    return secrets.token_urlsafe(32)


def hash_string(text):
    # Hash a string using SHA-256
    return hashlib.sha256(text.encode()).hexdigest()


def calculate_expiry(minutes=30):
    #Calculate expiry time
    return datetime.utcnow() + timedelta(minutes=minutes)


def is_expired(expiry_time):
    # Check if expiry time has passed
    if not expiry_time:
        return True
    return datetime.utcnow() > expiry_time


def parse_json_body():
    # Parse JSON body from request
    try:
        return request.get_json()
    except:
        return None


def success_response(data=None, message="Success", status_code=200):
    # Create a success response
    response = {
        'success': True,
        'message': message
    }
    if data is not None:
        response['data'] = data
    return jsonify(response), status_code


def error_response(message="Error", status_code=400, errors=None):
    # Create an error response
    response = {
        'success': False,
        'message': message
    }
    if errors is not None:
        response['errors'] = errors
    return jsonify(response), status_code


def require_json(f):
    # Decorator to require JSON body
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return error_response("Request must be JSON", 400)
        return f(*args, **kwargs)
    return decorated_function


def get_client_ip():
    # Get client IP address from request
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr


def calculate_percentage(part, total):
    # Calculate percentage
    if total == 0:
        return 0
    return round((part / total) * 100, 2)


def format_currency(amount, currency="KES"):
    # Format currency amount
    return f"{currency} {float(amount):,.2f}"


def truncate_text(text, length=50, suffix="..."):
    # Truncate text to specified length
    if not text:
        return text
    if len(text) <= length:
        return text
    return text[:length] + suffix


def dict_merge(dict1, dict2):
    # Merge two dictionaries
    result = dict1.copy()
    result.update(dict2)
    return result


def filter_dict(data, keys):
    # Filter dictionary to only include specified keys
    return {k: v for k, v in data.items() if k in keys}


def safe_get(data, keys, default=None):
    # Safely get nested dictionary values
    if not data:
        return default
    
    current = data
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default
    return current


def to_snake_case(text):
    # Convert text to snake_case
    import re
    text = re.sub(r'([A-Z])', r'_\1', text)
    text = text.lower()
    text = re.sub(r'^_', '', text)
    text = re.sub(r'_+', '_', text)
    return text


def to_camel_case(text):
    # Convert text to camelCase
    parts = text.split('_')
    return parts[0] + ''.join(part.title() for part in parts[1:])


def is_valid_uuid(uuid_string):
    # Check if string is a valid UUID
    import re
    pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return bool(re.match(pattern, uuid_string.lower()))


def generate_otp(length=6):
    # Generate a numeric OTP
    import random
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


def log_to_file(data, filename="app.log"):
    # Simple file logger
    import os
    from datetime import datetime
    
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    filepath = os.path.join(log_dir, filename)
    
    timestamp = datetime.now().isoformat()
    log_entry = f"[{timestamp}] {json.dumps(data)}\n"
    
    with open(filepath, 'a') as f:
        f.write(log_entry)