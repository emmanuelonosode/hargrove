"""
Celery tasks for Hasker & Co. Realty Group.

Task registry:
  - send_lead_notification      → email assigned agent (or managers) when a new lead arrives
  - generate_invoice_pdf        → WeasyPrint → PDF → upload to Cloudinary
  - generate_payment_receipt    → same pipeline for one-off payment receipts
  - send_invoice_email          → email branded PDF to client
  - send_viewing_reminder       → 24h reminder before a scheduled viewing
  - weekly_lead_followup        → every Monday, remind agents of stale leads (>7 days)
"""

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string


def _get_email_sender():
    """
    Returns (from_header, connection) using the active EmailConfiguration
    stored in the database.  Falls back to Django settings if none is configured.
    """
    try:
        from apps.notifications.models import EmailConfiguration
        config = EmailConfiguration.get_active()
        if config:
            return config.get_from_header(), config.get_connection()
    except Exception:
        pass
    # Fallback: use settings.py / .env values
    return settings.DEFAULT_FROM_EMAIL, None


# ---------------------------------------------------------------------------
# Lead notifications
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_lead_notification(self, lead_id: int):
    """Email the assigned agent (or all managers) when a new lead is created."""
    try:
        from apps.crm.models import Lead
        from apps.accounts.models import CustomUser, Role

        lead = Lead.objects.select_related("assigned_agent", "property_interest").get(pk=lead_id)

        # Determine recipients
        if lead.assigned_agent:
            recipients = [lead.assigned_agent.email]
        else:
            # Notify all active managers
            recipients = list(
                CustomUser.objects.filter(role=Role.MANAGER, is_active=True).values_list("email", flat=True)
            )

        if not recipients:
            return "No recipients — skipped."

        from_header, connection = _get_email_sender()
        subject = f"New Lead: {lead.full_name} ({lead.get_source_display()})"
        body = render_to_string("notifications/lead_notification.txt", {"lead": lead})

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=recipients,
            connection=connection,
        )
        msg.send()
        return f"Notification sent to {recipients}"

    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_email(self, user_id: int):
    """Email the 6-digit OTP code to a newly registered user."""
    try:
        from apps.accounts.models import CustomUser

        user = CustomUser.objects.get(pk=user_id)
        if not user.email_verification_code:
            return "No OTP code set — skipped."

        from_header, connection = _get_email_sender()
        subject = f"{user.email_verification_code} is your Hasker & Co. verification code"
        
        # Render HTML template 
        body = render_to_string("notifications/email_verification.html", {
            "user": user,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[user.email],
            connection=connection,
        )
        msg.content_subtype = "html"
        msg.send()
        return f"Verification email sent to {user.email}"

    except Exception as exc:
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# PDF generation
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def generate_invoice_pdf(self, invoice_id: int):
    """
    Render an invoice as HTML → convert to PDF via WeasyPrint
    → upload to Cloudinary → update Invoice.pdf.
    """
    try:
        from apps.transactions.models import Invoice
        import cloudinary.uploader
        from weasyprint import HTML
        import tempfile, os

        invoice = Invoice.objects.select_related(
            "transaction__client__lead",
            "transaction__property",
            "transaction__agent",
        ).get(pk=invoice_id)

        html_string = render_to_string("notifications/invoice_pdf.html", {"invoice": invoice})

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            HTML(string=html_string, base_url=settings.FRONTEND_URL).write_pdf(tmp.name)
            tmp_path = tmp.name

        result = cloudinary.uploader.upload(
            tmp_path,
            resource_type="raw",
            folder="hasker/invoices",
            public_id=f"invoice_{invoice.invoice_number}",
            overwrite=True,
        )
        os.unlink(tmp_path)

        Invoice.objects.filter(pk=invoice_id).update(pdf=result["secure_url"])
        return f"Invoice PDF generated: {result['secure_url']}"

    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def generate_payment_receipt(self, payment_id: int):
    """Generate a PDF receipt for a completed payment."""
    try:
        from apps.transactions.models import Payment
        import cloudinary.uploader
        from weasyprint import HTML
        import tempfile, os

        payment = Payment.objects.select_related(
            "transaction__client__lead",
            "transaction__property",
        ).get(pk=payment_id)

        html_string = render_to_string("notifications/receipt_pdf.html", {"payment": payment})

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            HTML(string=html_string, base_url=settings.FRONTEND_URL).write_pdf(tmp.name)
            tmp_path = tmp.name

        result = cloudinary.uploader.upload(
            tmp_path,
            resource_type="raw",
            folder="hasker/receipts",
            public_id=f"receipt_payment_{payment.pk}",
            overwrite=True,
        )
        os.unlink(tmp_path)

        Payment.objects.filter(pk=payment_id).update(receipt_pdf=result["secure_url"])
        return f"Receipt PDF generated: {result['secure_url']}"

    except Exception as exc:
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Email delivery
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_invoice_email(self, invoice_id: int):
    """Email the invoice PDF to the client."""
    try:
        from apps.transactions.models import Invoice
        import urllib.request

        invoice = Invoice.objects.select_related(
            "transaction__client__lead",
            "user",
        ).get(pk=invoice_id)

        # Recipient logic: check user profile first, then fallback to transaction client
        if invoice.user:
            client_email = invoice.user.email
            client_name = invoice.user.full_name
        elif invoice.transaction and invoice.transaction.client:
            client_email = invoice.transaction.client.email
            client_name = invoice.transaction.client.full_name
        else:
            return "No recipient found — skipped."

        from_header, connection = _get_email_sender()
        subject = f"Invoice {invoice.invoice_number}: {invoice.title}"
        body = render_to_string("notifications/invoice_email.html", {
            "invoice": invoice,
            "client_name": client_name,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[client_email],
            connection=connection,
        )
        msg.content_subtype = "html"

        # Attach PDF if available; send without attachment if still generating
        if invoice.pdf:
            try:
                pdf_data = urllib.request.urlopen(invoice.pdf).read()
                msg.attach(f"{invoice.invoice_number}.pdf", pdf_data, "application/pdf")
            except Exception:
                pass

        msg.send()
        return f"Invoice emailed to {client_email}"

    except Exception as exc:
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Careers / Job Applications
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_job_application_notification(self, application_id: int):
    """
    1. Send confirmation email to the applicant.
    2. Send an alert with full details to careers@ and all active managers.
    """
    try:
        from apps.careers.models import JobApplication
        from apps.accounts.models import CustomUser, Role

        app = JobApplication.objects.get(pk=application_id)
        from_header, connection = _get_email_sender()

        # 1. Confirmation to applicant
        confirmation_body = render_to_string(
            "notifications/job_application_confirmation.html", {"app": app}
        )
        msg_confirm = EmailMessage(
            subject=f"Application received — {app.role_title} | Hasker & Co. Realty Group",
            body=confirmation_body,
            from_email=from_header,
            to=[app.email],
            connection=connection,
        )
        msg_confirm.content_subtype = "html"
        msg_confirm.send()

        # 2. Alert to hiring team (active managers + careers@ inbox)
        manager_emails = list(
            CustomUser.objects.filter(role=Role.MANAGER, is_active=True)
            .values_list("email", flat=True)
        )
        staff_recipients = list(set(manager_emails + ["careers@haskerrealtygroup.com"]))

        alert_body = render_to_string(
            "notifications/job_application_staff_alert.html", {"app": app}
        )
        msg_alert = EmailMessage(
            subject=f"New Job Application: {app.full_name} — {app.role_title}",
            body=alert_body,
            from_email=from_header,
            to=staff_recipients,
            connection=connection,
        )
        msg_alert.content_subtype = "html"
        msg_alert.send()

        return f"Job application notifications sent for application {application_id}"

    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_job_rejection_email(self, application_id: int):
    """Send a polite rejection email to an applicant."""
    try:
        from apps.careers.models import JobApplication

        app = JobApplication.objects.get(pk=application_id)
        from_header, connection = _get_email_sender()

        subject = f"Re: Your application for {app.role_title} — Hasker & Co. Realty Group"
        body = render_to_string(
            "notifications/job_application_rejection.html", {"app": app}
        )
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[app.email],
            connection=connection,
        )
        msg.content_subtype = "html"
        msg.send()
        return f"Rejection email sent to {app.email}"

    except Exception as exc:
        raise self.retry(exc=exc)

def _payment_recipient(payment):
    """
    Resolve a payment to (email, full_name) across all three payment contexts:
    invoice (direct user), invoice (via transaction client), rental application, transaction.
    Returns None if no recipient can be determined.
    """
    if payment.invoice:
        if payment.invoice.user:
            return payment.invoice.user.email, payment.invoice.user.full_name
        if payment.invoice.transaction and payment.invoice.transaction.client:
            client = payment.invoice.transaction.client
            return client.lead.email, client.lead.full_name
    if payment.rental_application:
        return payment.rental_application.email, payment.rental_application.full_name
    if payment.transaction and payment.transaction.client:
        client = payment.transaction.client
        return client.lead.email, client.lead.full_name
    return None


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_payment_submitted_email(self, payment_id: int):
    """Notify the user that their payment proof was received."""
    try:
        from apps.transactions.models import Payment

        payment = Payment.objects.select_related(
            "invoice__user",
            "invoice__transaction__client__lead",
            "rental_application",
            "transaction__client__lead",
        ).get(pk=payment_id)

        result = _payment_recipient(payment)
        if not result:
            return "No recipient found — skipped."
        recipient_email, recipient_name = result

        from_header, connection = _get_email_sender()
        subject = "Payment Received & Pending Verification — Hasker & Co."
        body = render_to_string("notifications/payment_submitted.html", {
            "payment": payment,
            "recipient_name": recipient_name,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(subject=subject, body=body, from_email=from_header, to=[recipient_email], connection=connection)
        msg.content_subtype = "html"
        msg.send()
        return f"Payment confirmation sent to {recipient_email}"
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_payment_verified_email(self, payment_id: int):
    """Notify the user that their payment has been verified."""
    try:
        from apps.transactions.models import Payment

        payment = Payment.objects.select_related(
            "invoice__user",
            "invoice__transaction__client__lead",
            "rental_application",
            "transaction__client__lead",
        ).get(pk=payment_id)

        result = _payment_recipient(payment)
        if not result:
            return "No recipient found — skipped."
        recipient_email, recipient_name = result

        from_header, connection = _get_email_sender()
        subject = "Payment Verified — Hasker & Co. Realty Group"
        body = render_to_string("notifications/payment_verified.html", {
            "payment": payment,
            "recipient_name": recipient_name,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(subject=subject, body=body, from_email=from_header, to=[recipient_email], connection=connection)
        msg.content_subtype = "html"
        msg.send()
        return f"Payment verification sent to {recipient_email}"
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_payment_rejected_email(self, payment_id: int):
    """Notify the user that their payment proof was rejected."""
    try:
        from apps.transactions.models import Payment

        payment = Payment.objects.select_related(
            "invoice__user",
            "invoice__transaction__client__lead",
            "rental_application",
            "transaction__client__lead",
        ).get(pk=payment_id)

        result = _payment_recipient(payment)
        if not result:
            return "No recipient found — skipped."
        recipient_email, recipient_name = result

        from_header, connection = _get_email_sender()
        subject = "Action Required: Payment Proof Not Verified — Hasker & Co."
        body = render_to_string("notifications/payment_rejected.html", {
            "payment": payment,
            "recipient_name": recipient_name,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(subject=subject, body=body, from_email=from_header, to=[recipient_email], connection=connection)
        msg.content_subtype = "html"
        msg.send()
        return f"Payment rejection notice sent to {recipient_email}"
    except Exception as exc:
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Viewing reminders
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_viewing_reminder(self, viewing_id: int):
    """Send a 24h-before reminder to the lead (and the agent)."""
    try:
        from apps.scheduler.models import Viewing

        viewing = Viewing.objects.select_related("lead", "property", "agent").get(pk=viewing_id)

        from_header, connection = _get_email_sender()
        recipients = [viewing.lead.email, viewing.agent.email]
        subject = f"Viewing Reminder: {viewing.property.title} tomorrow"
        body = render_to_string("notifications/viewing_reminder.txt", {"viewing": viewing})

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=recipients,
            connection=connection,
        )
        msg.send()

        Viewing.objects.filter(pk=viewing_id).update(reminder_sent=True)
        return f"Reminder sent for viewing #{viewing_id}"

    except Exception as exc:
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Scheduled (Celery Beat) tasks
# ---------------------------------------------------------------------------

@shared_task
def weekly_lead_followup():
    """
    Runs every Monday via Celery Beat.
    Reminds agents of any leads they haven't contacted in 7+ days.
    """
    from django.utils import timezone
    from datetime import timedelta
    from apps.crm.models import Lead, LeadStatus
    from apps.accounts.models import CustomUser, Role

    cutoff = timezone.now() - timedelta(days=7)
    stale_leads = (
        Lead.objects
        .filter(
            status__in=[LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED],
            last_contacted_at__lt=cutoff,
            assigned_agent__isnull=False,
        )
        .select_related("assigned_agent")
    )

    # Group by agent
    agent_leads: dict = {}
    for lead in stale_leads:
        agent = lead.assigned_agent
        agent_leads.setdefault(agent, []).append(lead)

    from_header, connection = _get_email_sender()
    for agent, leads in agent_leads.items():
        subject = f"Follow-up Reminder: {len(leads)} leads need your attention"
        body = render_to_string("notifications/weekly_followup.txt", {
            "agent": agent,
            "leads": leads,
        })
        EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[agent.email],
            connection=connection,
        ).send()

    return f"Weekly follow-up sent for {len(agent_leads)} agents, {stale_leads.count()} leads."


@shared_task
def schedule_viewing_reminders():
    """
    Runs hourly via Celery Beat.
    Queues send_viewing_reminder for viewings starting in 20–26 hours.
    """
    from django.utils import timezone
    from datetime import timedelta
    from apps.scheduler.models import Viewing, ViewingStatus

    now = timezone.now()
    window_start = now + timedelta(hours=20)
    window_end = now + timedelta(hours=26)

    viewings = Viewing.objects.filter(
        scheduled_at__range=(window_start, window_end),
        status__in=[ViewingStatus.SCHEDULED, ViewingStatus.CONFIRMED],
        reminder_sent=False,
    )

    for viewing in viewings:
        send_viewing_reminder.delay(viewing.pk)

    return f"Queued reminders for {viewings.count()} viewings."


# ---------------------------------------------------------------------------
# Tenant communication emails (admin-triggered)
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_lead_acknowledgment_email(self, lead_id: int):
    """Send a branded inquiry acknowledgment email to the prospective tenant."""
    try:
        from apps.crm.models import Lead

        lead = Lead.objects.select_related(
            "assigned_agent",
            "property_interest",
            "property_interest__agent",
        ).prefetch_related(
            "property_interest__images",
        ).get(pk=lead_id)

        prop = lead.property_interest
        subject = (
            f"{prop.title} is Available — Hasker & Co. Realty Group"
            if prop else
            "We received your inquiry — Hasker & Co. Realty Group"
        )

        from_header, connection = _get_email_sender()
        body = render_to_string("notifications/inquiry_acknowledgment.html", {
            "lead": lead,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[lead.email],
            connection=connection,
        )
        msg.content_subtype = "html"
        msg.send()
        return f"Acknowledgment email sent to {lead.email}"

    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_approved_email(self, application_id: int):
    """Send branded approval email with legitimate next steps to the applicant."""
    try:
        from apps.crm.models import RentalApplication

        app = RentalApplication.objects.select_related(
            "rental_property", "rental_property__agent",
        ).get(pk=application_id)

        from_header, connection = _get_email_sender()
        subject = "Congratulations — Your Application Has Been Approved"
        if app.rental_property:
            subject = f"Congratulations — Your Application for {app.rental_property.title} Has Been Approved"

        body = render_to_string("notifications/application_approved.html", {
            "app": app,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[app.email],
            connection=connection,
        )
        msg.content_subtype = "html"
        msg.send()
        return f"Approval email sent to {app.email}"

    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_rejected_email(self, application_id: int):
    """Send polite rejection email with link to other listings."""
    try:
        from apps.crm.models import RentalApplication

        app = RentalApplication.objects.select_related("rental_property").get(pk=application_id)

        from_header, connection = _get_email_sender()
        subject = "Update on Your Application — Hasker & Co. Realty Group"
        body = render_to_string("notifications/application_rejected.html", {
            "app": app,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[app.email],
            connection=connection,
        )
        msg.content_subtype = "html"
        msg.send()
        return f"Rejection email sent to {app.email}"

    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_move_in_instructions_email(self, application_id: int):
    """Send move-in instructions email with in-person key handover details."""
    try:
        from apps.crm.models import RentalApplication

        app = RentalApplication.objects.select_related(
            "rental_property", "rental_property__agent",
        ).get(pk=application_id)

        from_header, connection = _get_email_sender()
        property_title = app.rental_property.title if app.rental_property else "Your New Home"
        subject = f"Your Move-In Instructions — {property_title}"
        body = render_to_string("notifications/move_in_instructions.html", {
            "app": app,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[app.email],
            connection=connection,
        )
        msg.content_subtype = "html"
        msg.send()
        return f"Move-in instructions sent to {app.email}"

    except Exception as exc:
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Rental Application emails / PDF


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_under_review_email(self, application_id: int):
    """Notify the applicant that their application is now being actively reviewed."""
    try:
        from apps.crm.models import RentalApplication

        app = RentalApplication.objects.select_related("rental_property").get(pk=application_id)

        from_header, connection = _get_email_sender()
        subject = "Your Application Is Under Review — Hasker & Co. Realty Group"
        body = render_to_string("notifications/application_under_review.html", {
            "app": app,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[app.email],
            connection=connection,
        )
        msg.content_subtype = "html"
        msg.send()
        return f"Under-review email sent to {app.email}"

    except Exception as exc:
        raise self.retry(exc=exc)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_submitted_email(self, application_id: int):
    """
    Send an immediate HTML confirmation to the applicant when their application
    is received. Fires directly from perform_create — does NOT depend on PDF
    generation, so the applicant always gets a confirmation even if Celery or
    WeasyPrint is misconfigured.
    """
    try:
        from apps.crm.models import RentalApplication

        app = RentalApplication.objects.select_related("rental_property").get(pk=application_id)

        from_header, connection = _get_email_sender()
        subject = "Your Application Has Been Received — Hasker & Co. Realty Group"
        body = render_to_string("notifications/application_submitted.html", {
            "app": app,
            "frontend_url": settings.FRONTEND_URL,
        })

        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_header,
            to=[app.email],
            connection=connection,
        )
        msg.content_subtype = "html"
        msg.send()
        return f"Application confirmation sent to {app.email}"

    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def generate_rental_application_pdf(self, application_id: int):
    """
    Render rental application → WeasyPrint PDF → Cloudinary → email applicant + agent.
    Fails silently if WeasyPrint or Cloudinary are not fully configured in dev.
    """
    try:
        import tempfile
        import os
        import cloudinary.uploader
        from weasyprint import HTML
        from apps.crm.models import RentalApplication

        app = RentalApplication.objects.select_related(
            "rental_property", "rental_property__agent", "lead",
        ).get(pk=application_id)

        html_string = render_to_string(
            "notifications/rental_application_pdf.html",
            {"app": app},
        )

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            HTML(string=html_string).write_pdf(tmp.name)
            tmp_path = tmp.name

        result = cloudinary.uploader.upload(
            tmp_path,
            resource_type="raw",
            folder="hasker/rental_applications",
            public_id=f"application_{app.pk}_{app.last_name.lower()}",
            overwrite=True,
        )
        os.unlink(tmp_path)

        RentalApplication.objects.filter(pk=application_id).update(
            application_pdf=result["secure_url"]
        )

        _send_rental_application_emails(app, result["secure_url"])
        return f"Rental application PDF generated: {result['secure_url']}"

    except Exception as exc:
        raise self.retry(exc=exc)


def _send_rental_application_emails(app, pdf_url: str):
    """Email PDF + notification to the property agent/managers after PDF generation."""
    try:
        import urllib.request
        pdf_data = urllib.request.urlopen(pdf_url).read()
    except Exception:
        pdf_data = None

    from_header, connection = _get_email_sender()

    # Determine agent recipients
    if app.rental_property and app.rental_property.agent:
        agent_recipients = [app.rental_property.agent.email]
    else:
        # Fall back to notifying all active managers
        from apps.accounts.models import CustomUser, Role
        agent_recipients = list(
            CustomUser.objects.filter(role=Role.MANAGER, is_active=True).values_list("email", flat=True)
        )

    if agent_recipients:
        admin_url = getattr(settings, "BACKEND_ADMIN_URL", settings.FRONTEND_URL)
        agent_body = render_to_string(
            "notifications/rental_application_agent_email.txt",
            {"app": app, "admin_url": admin_url},
        )
        prop_title = app.rental_property.title if app.rental_property else "No property"
        agent_msg = EmailMessage(
            subject=f"New Rental Application: {app.full_name} — {prop_title}",
            body=agent_body,
            from_email=from_header,
            to=agent_recipients,
            connection=connection,
        )
        if pdf_data:
            agent_msg.attach(f"RentalApplication_{app.last_name}.pdf", pdf_data, "application/pdf")
        agent_msg.send(fail_silently=True)
