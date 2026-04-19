"""Stripe webhook handler."""

import stripe
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse("Invalid payload", status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse("Invalid signature", status=400)

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "charge.succeeded":
        _handle_charge_succeeded(data)
    elif event_type == "payment_intent.payment_failed":
        _handle_payment_failed(data)
    elif event_type == "invoice.paid":
        _handle_invoice_paid(data)

    return HttpResponse(status=200)


def _handle_charge_succeeded(charge):
    """Create a Payment record and trigger receipt PDF generation."""
    from apps.transactions.models import Transaction, Payment, PaymentMethod, PaymentStatus

    pi_id = charge.get("payment_intent")
    if not pi_id:
        return

    try:
        transaction = Transaction.objects.get(stripe_payment_intent_id=pi_id)
    except Transaction.DoesNotExist:
        return

    payment, created = Payment.objects.get_or_create(
        stripe_charge_id=charge["id"],
        defaults={
            "transaction": transaction,
            "amount": charge["amount"] / 100,  # Stripe uses cents
            "payment_method": PaymentMethod.STRIPE,
            "stripe_receipt_url": charge.get("receipt_url", ""),
            "status": PaymentStatus.SUCCESSFUL,
            "paid_at": timezone.now(),
        },
    )

    if created:
        from apps.notifications.tasks import generate_payment_receipt
        generate_payment_receipt.delay(payment.pk)

        # Advance transaction to DEPOSIT_PAID if it was PENDING
        Transaction.objects.filter(pk=transaction.pk, status="PENDING").update(status="DEPOSIT_PAID")


def _handle_payment_failed(payment_intent):
    """Mark the related Payment as FAILED and notify the agent."""
    from apps.transactions.models import Transaction, Payment, PaymentStatus

    pi_id = payment_intent.get("id")
    try:
        transaction = Transaction.objects.get(stripe_payment_intent_id=pi_id)
    except Transaction.DoesNotExist:
        return

    Payment.objects.filter(
        transaction=transaction,
        status="PENDING",
    ).update(status=PaymentStatus.FAILED)


def _handle_invoice_paid(stripe_invoice):
    """Mark our Invoice as PAID when Stripe confirms payment."""
    from apps.transactions.models import Invoice

    stripe_invoice_id = stripe_invoice.get("id")
    Invoice.objects.filter(
        stripe_invoice_id=stripe_invoice_id,
    ).update(status="PAID")
