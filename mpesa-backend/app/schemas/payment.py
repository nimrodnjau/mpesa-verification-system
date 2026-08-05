from marshmallow import Schema, fields, validate


class VerifyPaymentSchema(Schema):
    transaction_cd = fields.Str(required=True, validate=validate.Length(min=10, max=50))
    amount = fields.Float(required=True, validate=validate.Range(min=1))
    phone_number = fields.Str(required=True)


class TransactionHistorySchema(Schema):
    page = fields.Int(missing=1, validate=validate.Range(min=1))
    per_page = fields.Int(missing=20, validate=validate.Range(min=1, max=100))
    status = fields.Str(validate=validate.OneOf(['pending', 'verified', 'failed']))
    date_from = fields.Date()
    date_to = fields.Date()
    search = fields.Str()