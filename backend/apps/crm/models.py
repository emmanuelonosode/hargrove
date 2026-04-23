from django.db import models


class LeadSource(models.TextChoices):
    CONTACT_FORM = "CONTACT_FORM", "Contact Form"
    PROPERTY_INQUIRY = "PROPERTY_INQUIRY", "Property Inquiry"
    AGENT_INQUIRY = "AGENT_INQUIRY", "Agent Inquiry"
    REFERRAL = "REFERRAL", "Referral"
    GOOGLE = "GOOGLE", "Google"
    INSTAGRAM = "INSTAGRAM", "Instagram"
    FACEBOOK = "FACEBOOK", "Facebook"
    DIRECT = "DIRECT", "Direct"


class InterestType(models.TextChoices):
    BUY = "BUY", "Buy"
    RENT = "RENT", "Rent"
    SELL = "SELL", "Sell"
    INVEST = "INVEST", "Invest"


class LeadStatus(models.TextChoices):
    NEW = "NEW", "New"
    CONTACTED = "CONTACTED", "Contacted"
    QUALIFIED = "QUALIFIED", "Qualified"
    VIEWING = "VIEWING", "Viewing Scheduled"
    NEGOTIATING = "NEGOTIATING", "Negotiating"
    CONVERTED = "CONVERTED", "Converted"
    LOST = "LOST", "Lost"


class ActivityType(models.TextChoices):
    CALL = "CALL", "Phone Call"
    EMAIL = "EMAIL", "Email"
    NOTE = "NOTE", "Note"
    STATUS_CHANGE = "STATUS_CHANGE", "Status Change"
    VIEWING_BOOKED = "VIEWING_BOOKED", "Viewing Booked"


class Lead(models.Model):
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    source = models.CharField(max_length=30, choices=LeadSource.choices, default=LeadSource.CONTACT_FORM)
    interest_type = models.CharField(max_length=10, choices=InterestType.choices, default=InterestType.BUY)

    # Budget
    budget_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    preferred_location = models.CharField(max_length=200, blank=True)

    # Property / agent interest (from inquiry forms)
    property_interest = models.ForeignKey(
        "properties.Property",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="inquiries",
    )
    agent_interest = models.ForeignKey(
        "accounts.CustomUser",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="requested_leads",
    )

    # What services they're interested in
    services_requested = models.JSONField(
        default=list,
        blank=True,
        help_text='e.g. ["Buyer Representation", "Property Valuation"]',
    )

    message = models.TextField(blank=True)

    # CRM pipeline
    status = models.CharField(max_length=20, choices=LeadStatus.choices, default=LeadStatus.NEW)
    assigned_agent = models.ForeignKey(
        "accounts.CustomUser",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_leads",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_contacted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["assigned_agent", "status"]),
            models.Index(fields=["source"]),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.get_status_display()})"


class LeadActivity(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="activities")
    agent = models.ForeignKey(
        "accounts.CustomUser",
        on_delete=models.PROTECT,
        related_name="lead_activities",
    )
    activity_type = models.CharField(max_length=20, choices=ActivityType.choices)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Lead Activity"
        verbose_name_plural = "Lead Activities"

    def __str__(self):
        return f"{self.get_activity_type_display()} on {self.lead}"


class Client(models.Model):
    """A Lead that has been converted into a paying client."""
    user = models.OneToOneField(
        "accounts.CustomUser",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="client_profile",
        help_text="Portal access account — created when client registers.",
    )
    lead = models.OneToOneField(Lead, on_delete=models.PROTECT, related_name="client")
    preferred_agent = models.ForeignKey(
        "accounts.CustomUser",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="clients",
    )
    kyc_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Client: {self.lead.full_name}"

    @property
    def full_name(self):
        return self.lead.full_name

    @property
    def email(self):
        return self.lead.email


class ApplicationStatus(models.TextChoices):
    DRAFT                = "DRAFT",                "Draft"
    PENDING_PAYMENT      = "PENDING_PAYMENT",      "Pending Payment"
    PENDING_VERIFICATION = "PENDING_VERIFICATION", "Pending Verification"
    SUBMITTED            = "SUBMITTED",            "Submitted"
    REVIEWED             = "REVIEWED",             "Reviewed"
    APPROVED             = "APPROVED",             "Approved"
    REJECTED             = "REJECTED",             "Rejected"
    PAYMENT_FAILED       = "PAYMENT_FAILED",       "Payment Failed"


class RentalApplication(models.Model):
    # ── Application Meta ──────────────────────────────────────────────────────
    application_fee = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    is_fee_paid     = models.BooleanField(default=False)
    payment_intent_id = models.CharField(max_length=200, blank=True, null=True)

    # ── Personal Info ─────────────────────────────────────────────────────────
    first_name  = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name   = models.CharField(max_length=100)
    email       = models.EmailField()
    cell_phone  = models.CharField(max_length=20)
    home_phone  = models.CharField(max_length=20, blank=True)

    # ── Household ─────────────────────────────────────────────────────────────
    has_kids       = models.BooleanField(default=False)
    number_of_kids = models.PositiveIntegerField(default=0)

    # ── Current Address ───────────────────────────────────────────────────────
    present_address = models.CharField(max_length=300)
    city            = models.CharField(max_length=100)
    state           = models.CharField(max_length=50)
    zip_code        = models.CharField(max_length=10)

    # ── Rental Intent ─────────────────────────────────────────────────────────
    move_in_date           = models.DateField()
    intended_stay_duration = models.CharField(max_length=100, help_text='e.g. "12 months"')
    months_rent_upfront    = models.PositiveIntegerField(default=1)

    # ── Lifestyle ─────────────────────────────────────────────────────────────
    has_pets        = models.BooleanField(default=False)
    pet_description = models.CharField(max_length=300, blank=True)
    smokes          = models.BooleanField(default=False)
    drinks          = models.BooleanField(default=False)

    # ── Relations ─────────────────────────────────────────────────────────────
    rental_property = models.ForeignKey(
        "properties.Property",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="rental_applications",
    )
    lead = models.ForeignKey(
        Lead,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="rental_applications",
    )

    # ── Status & Meta ─────────────────────────────────────────────────────────
    status       = models.CharField(max_length=20, choices=ApplicationStatus.choices, default=ApplicationStatus.DRAFT)
    submitted_at = models.DateTimeField(auto_now_add=True)
    ip_address   = models.GenericIPAddressField(null=True, blank=True)

    # ── Legal ─────────────────────────────────────────────────────────────────
    certification_text = models.CharField(
        max_length=500,
        blank=True,
        help_text="Auto-populated: applicant certifies information is true.",
    )

    # ── Generated PDF ─────────────────────────────────────────────────────────
    application_pdf = models.CharField(
        max_length=500,
        blank=True,
        help_text="Cloudinary URL of the generated application PDF.",
    )

    class Meta:
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["email"]),
            models.Index(fields=["rental_property", "status"]),
        ]
        verbose_name = "Rental Application"
        verbose_name_plural = "Rental Applications"

    def __str__(self):
        prop = str(self.rental_property) if self.rental_property else "No property"
        return f"{self.full_name} — {prop}"

    @property
    def full_name(self):
        parts = [self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        parts.append(self.last_name)
        return " ".join(parts)

    def save(self, *args, **kwargs):
        # Auto-generate certification text
        if not self.certification_text:
            self.certification_text = (
                f"I, {self.full_name}, certify that the answers given herein are true and "
                f"complete to the best of my knowledge. I authorize investigation of all "
                f"statements contained in this application."
            )
        # Auto-link to an existing Lead by email
        if not self.lead_id and self.email:
            match = Lead.objects.filter(email=self.email).order_by("-created_at").first()
            if match:
                self.lead = match
        super().save(*args, **kwargs)
