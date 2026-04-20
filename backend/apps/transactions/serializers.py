from rest_framework import serializers
from .models import Transaction, Payment, Invoice


class ClientInvoiceSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="transaction.property.title", read_only=True)
    property_address = serializers.SerializerMethodField()
    transaction_type = serializers.CharField(source="transaction.transaction_type", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "invoice_number", "issued_date", "due_date",
            "line_items", "subtotal", "tax_rate", "tax_amount", "total",
            "pdf", "status", "created_at",
            "property_title", "property_address", "transaction_type",
        ]

    def get_property_address(self, obj):
        p = obj.transaction.property
        return f"{p.address}, {p.city}, {p.state} {p.zip_code}"


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id", "transaction", "amount", "payment_method",
            "stripe_charge_id", "stripe_receipt_url",
            "status", "paid_at", "receipt_sent", "receipt_pdf", "notes",
        ]
        read_only_fields = ["id", "stripe_charge_id", "stripe_receipt_url", "receipt_pdf"]


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            "id", "transaction", "invoice_number",
            "issued_date", "due_date", "line_items",
            "subtotal", "tax_rate", "tax_amount", "total",
            "pdf", "stripe_invoice_id", "status", "created_at",
        ]
        read_only_fields = ["id", "invoice_number", "pdf", "stripe_invoice_id", "created_at"]

    def create(self, validated_data):
        validated_data["invoice_number"] = Invoice.generate_invoice_number()
        return super().create(validated_data)


class TransactionListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.full_name", read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)
    agent_name = serializers.CharField(source="agent.full_name", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "client", "client_name",
            "property", "property_title",
            "agent", "agent_name",
            "transaction_type", "agreed_price",
            "commission_rate", "commission_amount",
            "status", "created_at", "completed_at",
        ]


class TransactionDetailSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.full_name", read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)
    agent_name = serializers.CharField(source="agent.full_name", read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    invoices = InvoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "client", "client_name",
            "property", "property_title",
            "agent", "agent_name",
            "transaction_type", "agreed_price",
            "commission_rate", "commission_amount",
            "status", "stripe_payment_intent_id",
            "notes", "payments", "invoices",
            "created_at", "updated_at", "completed_at",
        ]
        read_only_fields = ["id", "commission_amount", "stripe_payment_intent_id", "created_at", "updated_at"]
