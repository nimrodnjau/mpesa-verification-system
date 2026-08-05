from marshmallow import Schema, fields, validate


class RegisterBusinessSchema(Schema):
    business_name = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    location = fields.Str(validate=validate.Length(max=200))
    paybill_number = fields.Str(validate=validate.Length(max=20))
    till_number = fields.Str(validate=validate.Length(max=20))


class WebhookSettingsSchema(Schema):
    paybill_number = fields.Str(validate=validate.Length(max=20))
    till_number = fields.Str(validate=validate.Length(max=20))
    webhook_endpoint = fields.Url()
    is_webhook_active = fields.Bool()


class InvoiceSchema(Schema):
    customer_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    customer_phone = fields.Str(required=True)
    expected_amount = fields.Float(required=True, validate=validate.Range(min=1))
    reference = fields.Str(validate=validate.Length(max=50))