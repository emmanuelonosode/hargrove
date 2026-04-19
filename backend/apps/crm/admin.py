from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from unfold.admin import ModelAdmin, TabularInline
from .models import Lead, LeadActivity, Client, LeadStatus, RentalApplication, ApplicationStatus


class LeadActivityInline(TabularInline):
    model = LeadActivity
    extra = 1
    fields = ["activity_type", "agent", "note", "created_at"]
    readonly_fields = ["created_at"]


class RentalApplicationInline(TabularInline):
    model = RentalApplication
    extra = 0
    fields = ["full_name_display", "rental_property", "status", "move_in_date", "submitted_at", "pdf_link"]
    readonly_fields = ["full_name_display", "rental_property", "submitted_at", "pdf_link"]
    can_delete = False
    verbose_name = "Rental Application"
    verbose_name_plural = "Rental Applications"

    def full_name_display(self, obj):
        return obj.full_name
    full_name_display.short_description = "Applicant"

    def pdf_link(self, obj):
        if obj.application_pdf:
            return format_html('<a href="{}" target="_blank">Download PDF</a>', obj.application_pdf)
        return "—"
    pdf_link.short_description = "PDF"


@admin.register(Lead)
class LeadAdmin(ModelAdmin):
    list_display = [
        "full_name", "email", "phone",
        "source", "interest_type", "status_badge",
        "assigned_agent", "created_at",
    ]
    list_filter = ["status", "source", "interest_type", "assigned_agent"]
    search_fields = ["full_name", "email", "phone", "preferred_location"]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"
    inlines = [LeadActivityInline, RentalApplicationInline]
    actions = ["mark_contacted", "mark_qualified", "mark_lost", "send_acknowledgment_email"]

    fieldsets = (
        ("Contact", {
            "fields": ("full_name", "email", "phone"),
        }),
        ("Interest", {
            "fields": ("source", "interest_type", "budget_min", "budget_max", "preferred_location",
                       "property_interest", "agent_interest", "services_requested", "message"),
        }),
        ("Pipeline", {
            "fields": ("status", "assigned_agent", "last_contacted_at"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )
    readonly_fields = ["created_at", "updated_at"]

    def status_badge(self, obj):
        colors = {
            LeadStatus.NEW: "#2563eb",
            LeadStatus.CONTACTED: "#7c3aed",
            LeadStatus.QUALIFIED: "#0891b2",
            LeadStatus.VIEWING: "#d97706",
            LeadStatus.NEGOTIATING: "#ea580c",
            LeadStatus.CONVERTED: "#16a34a",
            LeadStatus.LOST: "#dc2626",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:9999px;font-size:11px">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"

    @admin.action(description="Mark as Contacted")
    def mark_contacted(self, request, queryset):
        updated = queryset.update(status=LeadStatus.CONTACTED, last_contacted_at=timezone.now())
        self.message_user(request, f"{updated} leads marked as Contacted.")

    @admin.action(description="Mark as Qualified")
    def mark_qualified(self, request, queryset):
        updated = queryset.update(status=LeadStatus.QUALIFIED)
        self.message_user(request, f"{updated} leads marked as Qualified.")

    @admin.action(description="Mark as Lost")
    def mark_lost(self, request, queryset):
        updated = queryset.update(status=LeadStatus.LOST)
        self.message_user(request, f"{updated} leads marked as Lost.")

    @admin.action(description="Send Inquiry Acknowledgment Email")
    def send_acknowledgment_email(self, request, queryset):
        try:
            from apps.notifications.tasks import send_lead_acknowledgment_email
            count = 0
            for lead in queryset:
                send_lead_acknowledgment_email.delay(lead.pk)
                count += 1
            self.message_user(request, f"Acknowledgment email queued for {count} lead(s).")
        except Exception as e:
            self.message_user(request, f"Error queuing email: {e}", level="error")


@admin.register(LeadActivity)
class LeadActivityAdmin(ModelAdmin):
    list_display = ["lead", "activity_type", "agent", "created_at"]
    list_filter = ["activity_type", "agent"]
    search_fields = ["lead__full_name", "note"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at"]

    fieldsets = (
        ("Activity", {
            "fields": ("lead", "agent", "activity_type"),
        }),
        ("Detail", {
            "fields": ("note",),
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",),
        }),
    )


@admin.register(Client)
class ClientAdmin(ModelAdmin):
    list_display = ["full_name", "email", "preferred_agent", "kyc_verified", "created_at"]
    list_filter = ["kyc_verified", "preferred_agent"]
    search_fields = ["lead__full_name", "lead__email"]
    readonly_fields = ["created_at"]

    fieldsets = (
        ("Client Info", {
            "fields": ("lead", "user", "preferred_agent", "kyc_verified"),
        }),
        ("Timestamps", {
            "fields": ("created_at",),
        }),
    )


@admin.register(RentalApplication)
class RentalApplicationAdmin(ModelAdmin):
    list_display    = ["full_name", "email", "rental_property", "status_badge", "submitted_at", "pdf_download"]
    list_filter     = ["status", "has_pets", "has_kids", "smokes", "drinks"]
    search_fields   = ["first_name", "last_name", "email", "cell_phone", "present_address"]
    ordering        = ["-submitted_at"]
    readonly_fields = ["submitted_at", "ip_address", "lead", "application_pdf", "pdf_download", "certification_text"]
    actions         = ["mark_reviewed", "mark_approved", "mark_rejected", "regenerate_pdf",
                      "send_approval_email", "send_rejection_email", "send_move_in_email"]

    fieldsets = (
        ("Applicant", {
            "fields": ("first_name", "middle_name", "last_name", "email", "cell_phone", "home_phone"),
        }),
        ("Household", {
            "fields": ("has_kids", "number_of_kids", "has_pets", "pet_description", "smokes", "drinks"),
        }),
        ("Current Address", {
            "fields": ("present_address", "city", "state", "zip_code"),
        }),
        ("Rental Details", {
            "fields": ("rental_property", "move_in_date", "intended_stay_duration", "months_rent_upfront"),
        }),
        ("Status & Documents", {
            "fields": ("status", "lead", "submitted_at", "ip_address", "certification_text", "pdf_download"),
        }),
    )

    def status_badge(self, obj):
        colors = {
            ApplicationStatus.NEW:      "#2563eb",
            ApplicationStatus.REVIEWED: "#d97706",
            ApplicationStatus.APPROVED: "#16a34a",
            ApplicationStatus.REJECTED: "#dc2626",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:9999px;font-size:11px">{}</span>',
            color, obj.get_status_display(),
        )
    status_badge.short_description = "Status"

    def pdf_download(self, obj):
        if obj.application_pdf:
            return format_html(
                '<a href="{}" target="_blank" style="color:#1A56DB;font-weight:600">Download PDF</a>',
                obj.application_pdf,
            )
        return "PDF not yet generated"
    pdf_download.short_description = "Application PDF"

    @admin.action(description="Mark selected as Reviewed")
    def mark_reviewed(self, request, queryset):
        queryset.update(status=ApplicationStatus.REVIEWED)
        self.message_user(request, "Marked as Reviewed.")

    @admin.action(description="Mark selected as Approved")
    def mark_approved(self, request, queryset):
        queryset.update(status=ApplicationStatus.APPROVED)
        self.message_user(request, "Marked as Approved.")

    @admin.action(description="Mark selected as Rejected")
    def mark_rejected(self, request, queryset):
        queryset.update(status=ApplicationStatus.REJECTED)
        self.message_user(request, "Marked as Rejected.")

    @admin.action(description="Re-generate application PDF")
    def regenerate_pdf(self, request, queryset):
        try:
            from apps.notifications.tasks import generate_rental_application_pdf
            count = 0
            for app in queryset:
                generate_rental_application_pdf.delay(app.id)
                count += 1
            self.message_user(request, f"PDF generation queued for {count} application(s).")
        except Exception as e:
            self.message_user(request, f"Error: {e}", level="error")

    @admin.action(description="Send Approval Email to Applicant(s)")
    def send_approval_email(self, request, queryset):
        try:
            from apps.notifications.tasks import send_application_approved_email
            count = 0
            for app in queryset:
                send_application_approved_email.delay(app.pk)
                count += 1
            self.message_user(request, f"Approval email queued for {count} applicant(s).")
        except Exception as e:
            self.message_user(request, f"Error queuing email: {e}", level="error")

    @admin.action(description="Send Rejection Email to Applicant(s)")
    def send_rejection_email(self, request, queryset):
        try:
            from apps.notifications.tasks import send_application_rejected_email
            count = 0
            for app in queryset:
                send_application_rejected_email.delay(app.pk)
                count += 1
            self.message_user(request, f"Rejection email queued for {count} applicant(s).")
        except Exception as e:
            self.message_user(request, f"Error queuing email: {e}", level="error")

    @admin.action(description="Send Move-In Instructions Email")
    def send_move_in_email(self, request, queryset):
        try:
            from apps.notifications.tasks import send_move_in_instructions_email
            count = 0
            for app in queryset:
                send_move_in_instructions_email.delay(app.pk)
                count += 1
            self.message_user(request, f"Move-in instructions queued for {count} applicant(s).")
        except Exception as e:
            self.message_user(request, f"Error queuing email: {e}", level="error")
