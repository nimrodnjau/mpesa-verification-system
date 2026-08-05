from marshmallow import Schema, fields, validate, ValidationError
import re


def validate_phone(phone):
    pattern = r'^(07|01)\d{8}$'
    if not re.match(pattern, phone):
        raise ValidationError('Invalid phone number. Must be 10 digits starting with 07 or 01')
    return phone


class RegisterSchema(Schema):
    first_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    email = fields.Email(required=True)
    phone_number = fields.Str(required=True, validate=validate_phone)
    password = fields.Str(required=True, validate=validate.Length(min=8))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class RefreshTokenSchema(Schema):
    refresh_token = fields.Str(required=True)


class ForgotPasswordSchema(Schema):
    email = fields.Email(required=True)


class ResetPasswordSchema(Schema):
    token = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=8))