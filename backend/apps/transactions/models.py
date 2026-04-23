from django.db import models


class TransactionType(models.TextChoices):
    SALE = "SALE", "Sale"
    RENT = "RENT", "Rent"
    LEASE = "LEASE", "Lease"


class TransactionStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    DEPOSIT_PAID = "DEPOSIT_PAID", "Deposit Paid"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class PaymentMethod(models.TextChoices):
    BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"
    CASH = "CASH", "Cash"
    CHECK = "CHECK", "Check"
    PAYPAL = "PAYPAL", "PayPal"
    CASHAPP = "CASHAPP", "CashApp"
    CHIME = "CHIME", "Chime"


class PaymentStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    PENDING_VERIFICATION = "PENDING_VERIFICATION", "Pending Verification"
    SUCCESSFUL = "SUCCESSFUL", "Successful"
    VERIFIED = "VERIFIED", "Verified"
    FAILED = "FAILED", "Failed"
    REJECTED = "REJECTED", "Rejected"
    REFUNDED = "REFUNDED", "Refunded"


class InvoiceStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    SENT = "SENT", "Sent"
    PAID = "PAID", "Paid"
    VOID = "VOID", "Void"


class Transaction(models.Model):
    # ... (existing Transaction model fields)
    client = models.ForeignKey(
        "crm.Client",
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    agent = models.ForeignKey(
        "accounts.CustomUser",
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices)
    agreed_price = models.DecimalField(max_digits=12, decimal_places=2)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=3.00)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Transaction #{self.pk} — {self.client} / {self.property}"

    def save(self, *args, **kwargs):
        # Auto-calculate commission if not manually set
        if not self.commission_amount:
            self.commission_amount = self.agreed_price * (self.commission_rate / 100)
        super().save(*args, **kwargs)


class Payment(models.Model):
    transaction = models.ForeignKey(
        Transaction, 
        on_delete=models.CASCADE, 
        related_name="payments",
        null=True, blank=True
    )
    rental_application = models.ForeignKey(
        "crm.RentalApplication",
        on_delete=models.CASCADE,
        related_name="payments",
        null=True, blank=True
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    
    # Manual Verification Fields
    reference_id = models.CharField(
        max_length=100, 
        blank=True, 
        help_text="User-provided Ref ID, CashTag, or PayPal email"
    )
    proof_image = models.CharField(
        max_length=500, 
        blank=True, 
        help_text="Cloudinary URL of the receipt/screenshot"
    )
    
    verified_by = models.ForeignKey(
        "accounts.CustomUser",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="verified_payments"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    paid_at = models.DateTimeField(null=True, blank=True)
    receipt_sent = models.BooleanField(default=False)
    receipt_pdf = models.CharField(max_length=500, blank=True, help_text="Cloudinary URL of generated PDF receipt")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-paid_at", "-id"]

    def __str__(self):
        return f"Payment ${self.amount} ({self.get_status_display()})"


class Invoice(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="invoices")
    invoice_number = models.CharField(max_length=20, unique=True)  # HRG-2025-0001
    issued_date = models.DateField()
    due_date = models.DateField()
    line_items = models.JSONField(
        default=list,
        help_text='[{"description": "...", "quantity": 1, "unit_price": 100.00, "total": 100.00}]',
    )
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    pdf = models.CharField(max_length=500, blank=True, help_text="Cloudinary URL of generated PDF invoice")
    status = models.CharField(max_length=10, choices=InvoiceStatus.choices, default=InvoiceStatus.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice {self.invoice_number} — {self.get_status_display()}"

    @classmethod
    def generate_invoice_number(cls):
        from django.utils import timezone
        year = timezone.now().year
        last = cls.objects.filter(invoice_number__startswith=f"HRG-{year}-").order_by("-id").first()
        if last:
            try:
                seq = int(last.invoice_number.split("-")[-1]) + 1
            except (ValueError, IndexError):
                seq = 1
        else:
            seq = 1
        return f"HRG-{year}-{seq:04d}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        super().save(*args, **kwargs)
