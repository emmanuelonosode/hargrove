from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from .models import Transaction, Payment, Invoice, TransactionStatus, InvoiceStatus


class PaymentInline(TabularInline):
    model = Payment
    extra = 0
    fields = ["amount", "payment_method", "status", "paid_at", "receipt_sent"]
    readonly_fields = ["paid_at"]


class InvoiceInline(TabularInline):
    model = Invoice
    extra = 1
    fields = ["invoice_number", "issued_date", "due_date", "subtotal", "tax_rate", "tax_amount", "total", "status"]
    readonly_fields = ["invoice_number"]


@admin.register(Transaction)
class TransactionAdmin(ModelAdmin):
    list_display = [
        "id", "client", "property_link", "agent",
        "transaction_type", "agreed_price_display",
        "commission_display", "status_badge", "created_at",
    ]
    list_filter = ["transaction_type", "status", "agent"]
    search_fields = ["client__lead__full_name", "property__title", "agent__email"]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"
    inlines = [PaymentInline, InvoiceInline]
    readonly_fields = ["commission_amount", "created_at", "updated_at"]
    actions = ["mark_completed", "mark_cancelled"]

    fieldsets = (
        ("Parties", {
            "fields": ("client", "property", "agent"),
        }),
        ("Deal", {
            "fields": ("transaction_type", "agreed_price", "commission_rate", "commission_amount"),
        }),
        ("Status", {
            "fields": ("status", "notes"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at", "completed_at"),
            "classes": ("collapse",),
        }),
    )

    def property_link(self, obj):
        return format_html('<a href="/admin/properties/property/{}/change/">{}</a>', obj.property.pk, obj.property.title)
    property_link.short_description = "Property"

    def agreed_price_display(self, obj):
        return f"${obj.agreed_price:,.0f}"
    agreed_price_display.short_description = "Price"

    def commission_display(self, obj):
        return f"${obj.commission_amount:,.0f} ({obj.commission_rate}%)"
    commission_display.short_description = "Commission"

    def status_badge(self, obj):
        colors = {
            TransactionStatus.PENDING: "#6b7280",
            TransactionStatus.DEPOSIT_PAID: "#2563eb",
            TransactionStatus.IN_PROGRESS: "#d97706",
            TransactionStatus.COMPLETED: "#16a34a",
            TransactionStatus.CANCELLED: "#dc2626",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:9999px;font-size:11px">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"

    @admin.action(description="Mark as Completed")
    def mark_completed(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status=TransactionStatus.COMPLETED, completed_at=timezone.now())
        self.message_user(request, f"{updated} transactions marked as Completed.")

    @admin.action(description="Mark as Cancelled")
    def mark_cancelled(self, request, queryset):
        updated = queryset.update(status=TransactionStatus.CANCELLED)
        self.message_user(request, f"{updated} transactions cancelled.")


@admin.register(Payment)
class PaymentAdmin(ModelAdmin):
    list_display = ["id", "transaction", "amount", "payment_method", "status", "paid_at", "receipt_sent"]
    list_filter = ["status", "payment_method", "receipt_sent"]
    search_fields = ["transaction__client__lead__full_name"]
    ordering = ["-paid_at"]
    readonly_fields = ["receipt_pdf", "paid_at"]

    fieldsets = (
        ("Payment Details", {
            "fields": ("transaction", "amount", "payment_method", "status"),
        }),
        ("Timing", {
            "fields": ("paid_at",),
        }),
        ("Receipt", {
            "fields": ("receipt_sent", "receipt_pdf"),
        }),
        ("Notes", {
            "fields": ("notes",),
        }),
    )


@admin.register(Invoice)
class InvoiceAdmin(ModelAdmin):
    list_display  = ["invoice_number", "transaction", "total_display", "status_badge", "issued_date", "due_date", "pdf_link"]
    list_filter   = ["status"]
    search_fields = ["invoice_number", "transaction__client__lead__full_name"]
    ordering      = ["-created_at"]
    readonly_fields = ["invoice_number", "pdf", "created_at", "pdf_link"]
    actions = ["generate_pdf_action", "send_invoice_action"]

    fieldsets = (
        ("Invoice Info", {
            "fields": ("transaction", "invoice_number", "status"),
        }),
        ("Dates", {
            "fields": ("issued_date", "due_date"),
        }),
        ("Line Items & Totals", {
            "fields": ("line_items", "subtotal", "tax_rate", "tax_amount", "total"),
        }),
        ("Documents & Integration", {
            "fields": ("pdf", "pdf_link"),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",),
        }),
    )

    def total_display(self, obj):
        return f"${obj.total:,.2f}"
    total_display.short_description = "Total"

    def status_badge(self, obj):
        colors = {
            InvoiceStatus.DRAFT: "#6b7280",
            InvoiceStatus.SENT: "#2563eb",
            InvoiceStatus.PAID: "#16a34a",
            InvoiceStatus.VOID: "#dc2626",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:9999px;font-size:11px">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"

    def pdf_link(self, obj):
        if obj.pdf:
            return format_html(
                '<a href="{}" target="_blank" style="color:#1A56DB;font-weight:600">Download</a>',
                obj.pdf,
            )
        return "—"
    pdf_link.short_description = "PDF"

    @admin.action(description="Generate PDF Invoice")
    def generate_pdf_action(self, request, queryset):
        try:
            from apps.notifications.tasks import generate_invoice_pdf
            count = 0
            for invoice in queryset:
                generate_invoice_pdf.delay(invoice.pk)
                count += 1
            self.message_user(
                request,
                f"PDF generation queued for {count} invoice(s). Refresh in a moment to see the download link.",
            )
        except Exception as e:
            self.message_user(request, f"Error: {e}. Is Celery running?", level="warning")

    @admin.action(description="Send Invoice to Client (email PDF)")
    def send_invoice_action(self, request, queryset):
        try:
            from apps.notifications.tasks import send_invoice_email
            sent = skipped = 0
            for invoice in queryset:
                if invoice.pdf:
                    send_invoice_email.delay(invoice.pk)
                    sent += 1
                else:
                    skipped += 1
            msg = f"Email queued for {sent} invoice(s)."
            if skipped:
                msg += f" {skipped} skipped — generate PDF first."
            self.message_user(request, msg)
        except Exception as e:
            self.message_user(request, f"Error: {e}. Is Celery running?", level="warning")
