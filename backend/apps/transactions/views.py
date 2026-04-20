from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.accounts.permissions import IsAgentOrAbove, IsManagerOrAbove, IsAccountantOrAbove
from .models import Transaction, Payment, Invoice, TransactionStatus
from .serializers import (
    TransactionListSerializer, TransactionDetailSerializer,
    PaymentSerializer, InvoiceSerializer, ClientInvoiceSerializer,
)


class TransactionListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/transactions/"""
    permission_classes = [IsAgentOrAbove]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TransactionDetailSerializer
        return TransactionListSerializer

    def get_queryset(self):
        qs = Transaction.objects.select_related("client__lead", "property", "agent")
        user = self.request.user
        if user.role == "AGENT":
            return qs.filter(agent=user)
        if user.role == "CLIENT":
            return qs.filter(client__user=user)
        return qs


class TransactionDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/transactions/{id}/"""
    serializer_class = TransactionDetailSerializer
    permission_classes = [IsAgentOrAbove]

    def get_queryset(self):
        qs = Transaction.objects.select_related(
            "client__lead", "property", "agent"
        ).prefetch_related("payments", "invoices")
        user = self.request.user
        if user.role == "AGENT":
            return qs.filter(agent=user)
        if user.role == "CLIENT":
            return qs.filter(client__user=user)
        return qs

    def perform_update(self, serializer):
        instance = serializer.save()
        # Auto-set completed_at when status changes to COMPLETED
        if instance.status == TransactionStatus.COMPLETED and not instance.completed_at:
            Transaction.objects.filter(pk=instance.pk).update(completed_at=timezone.now())


class PaymentListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/transactions/{transaction_pk}/payments/"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAccountantOrAbove]

    def get_queryset(self):
        return Payment.objects.filter(transaction_id=self.kwargs["transaction_pk"])

    def perform_create(self, serializer):
        transaction = Transaction.objects.get(pk=self.kwargs["transaction_pk"])
        payment = serializer.save(transaction=transaction)

        # Trigger receipt PDF generation for successful payments
        if payment.status == "SUCCESSFUL":
            try:
                from apps.notifications.tasks import generate_payment_receipt
                generate_payment_receipt.delay(payment.id)
            except Exception:
                pass


class InvoiceListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/transactions/{transaction_pk}/invoices/"""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAccountantOrAbove]

    def get_queryset(self):
        return Invoice.objects.filter(transaction_id=self.kwargs["transaction_pk"])

    def perform_create(self, serializer):
        transaction = Transaction.objects.get(pk=self.kwargs["transaction_pk"])
        invoice = serializer.save(transaction=transaction)

        # Kick off PDF generation
        try:
            from apps.notifications.tasks import generate_invoice_pdf
            generate_invoice_pdf.delay(invoice.id)
        except Exception:
            pass


@api_view(["POST"])
@permission_classes([IsAccountantOrAbove])
def send_invoice(request, transaction_pk, invoice_pk):
    """POST /api/v1/transactions/{id}/invoices/{id}/send/ — email PDF to client."""
    try:
        invoice = Invoice.objects.select_related("transaction__client__lead").get(
            pk=invoice_pk, transaction_id=transaction_pk
        )
    except Invoice.DoesNotExist:
        return Response({"detail": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

    if not invoice.pdf:
        return Response({"detail": "Invoice PDF has not been generated yet."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        from apps.notifications.tasks import send_invoice_email
        send_invoice_email.delay(invoice.id)
    except Exception as e:
        return Response({"detail": f"Failed to queue email: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    Invoice.objects.filter(pk=invoice.pk).update(status="SENT")
    return Response({"detail": "Invoice queued for delivery."})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def client_invoices(request):
    """GET /api/v1/transactions/my-invoices/ — invoices for the logged-in client."""
    invoices = (
        Invoice.objects
        .filter(
            transaction__client__user=request.user,
            status__in=["SENT", "PAID"],
        )
        .select_related("transaction__property")
        .order_by("-issued_date")
    )
    serializer = ClientInvoiceSerializer(invoices, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_payment_intent(request, pk):
    """POST /api/v1/transactions/{pk}/pay/ — create Stripe PaymentIntent for rent payment."""
    try:
        if request.user.role == "CLIENT":
            transaction = Transaction.objects.get(pk=pk, client__user=request.user)
        else:
            transaction = Transaction.objects.get(pk=pk)
    except Transaction.DoesNotExist:
        return Response({"detail": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

    if not settings.STRIPE_SECRET_KEY:
        return Response({"detail": "Payment processing is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        intent = stripe.PaymentIntent.create(
            amount=int(transaction.agreed_price * 100),
            currency="usd",
            metadata={"transaction_id": transaction.pk, "user_id": request.user.pk},
        )
        transaction.stripe_payment_intent_id = intent.id
        transaction.save(update_fields=["stripe_payment_intent_id"])
        return Response({"client_secret": intent.client_secret, "amount": float(transaction.agreed_price)})
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
