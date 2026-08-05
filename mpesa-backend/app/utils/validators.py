# Validation utilities and security

import re
from datetime import datetime


def validate_email(email):
    # Validate email format
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))



# Validate Kenyan phone number
def validate_phone(phone):
    # Remove any whitespace
    phone = phone.strip()
    
    # Check length
    if len(phone) != 10:
        return False
    
    # Check if starts with 07 or 01
    if not (phone.startswith('07') or phone.startswith('01')):
        return False
    
    # Check if all digits
    if not phone.isdigit():
        return False
    
    return True


def validate_transaction_code(code):
    # Validate M-Pesa transaction code format. Usually alphanumeric, 10-15 characters
    if not code:
        return False
    
    # Remove whitespace
    code = code.strip()
    
    
    pattern = r'^[A-Za-z0-9]{10,15}$'
    return bool(re.match(pattern, code))


# Validate amount is positive number
def validate_amount(amount):
    
    try:
        amount = float(amount)
        return amount > 0
    except (ValueError, TypeError):
        return False


# Validate date format YYYY-MM-DD
def validate_date(date_str):
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False


def sanitize_input(text):
    # Sanitize input to prevent XSS/SQL injection
    if not text:
        return text
    
    # Remove any HTML tags
    import re
    text = re.sub(r'<[^>]*>', '', text)
    
    # Escape special characters
    text = text.replace('"', '&quot;')
    text = text.replace("'", '&#39;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    
    return text.strip()


# Validate password strength. At least 8 characters with uppercase, lowercase, number
def validate_password_strength(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    
    return True, "Password is strong"


# Format phone number to standard format
def format_phone_number(phone):
    
    # Remove any whitespace
    phone = phone.strip()
    
    # If starts with 0, replace with 254
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    
    # If starts with +, remove it
    if phone.startswith('+'):
        phone = phone[1:]
    
    return phone


# Mask phone number for privacy (e.g., 0712****78)
def mask_phone_number(phone):
    if not phone or len(phone) < 10:
        return phone
    
    return phone[:4] + '****' + phone[-2:]


def parse_pagination_params(args):
    # Parse pagination parameters from request args
    page = int(args.get('page', 1))
    per_page = int(args.get('per_page', 20))
    
    # Validate
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20
    
    return page, per_page


# Generate a unique reference number. Format: REF-YYYYMMDD-XXXX
def generate_reference_number():
    from datetime import datetime
    import random
    import string
    
    date_str = datetime.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    return f"REF-{date_str}-{random_str}"