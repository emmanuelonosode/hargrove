from rest_framework import serializers
from .models import Payment, Transaction, Invoice

class PaymentSerializer(serializers.ModelSerializer):
    proof_file = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Payment
        fields = [
            "id", "transaction", "rental_application", "invoice", "amount", 
            "payment_method", "status", "reference_id", "proof_image", "proof_file",
            "verified_by", "verified_at", "rejection_reason", "paid_at",
            "receipt_sent", "receipt_pdf", "notes", "created_at"
        ]
        read_only_fields = ["id", "status", "verified_by", "verified_at", "rejection_reason", "paid_at", "created_at"]

    def create(self, validated_data):
        validated_data.pop("proof_file", None)
        return super().create(validated_data)

class TransactionListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.lead.full_name", read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)
    agent_name = serializers.CharField(source="agent.full_name", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "client", "client_name", "property", "property_title",
            "agent", "agent_name", "transaction_type", "agreed_price",
            "status", "created_at"
        ]

class TransactionDetailSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.lead.full_name", read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)
    agent_name = serializers.CharField(source="agent.full_name", read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "completed_at"]

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ["invoice_number", "created_at"]

class ClientInvoiceSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="transaction.property.title", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "invoice_number", "issued_date", "due_date",
            "total", "status", "pdf", "property_title"
        ]
