# Plan: Manual Payment Architecture

## Objective
Implement the payment architecture to support manual, unautomated payment methods like PayPal, CashApp, Chime, and Direct Bank Transfer using an "Upload & Verify" flow.

## Key Files & Context
- `backend/apps/transactions/models.py`: Defines the `Payment`, `PaymentMethod`, and `PaymentStatus` models.
- `backend/apps/crm/models.py`: Defines `RentalApplication` and `ApplicationStatus`.
- `backend/apps/crm/serializers.py` & `backend/apps/transactions/serializers.py`: Serializers for applications and payments.
- `frontend/components/public/RentalApplicationForm.tsx`: UI for the application process.
- `frontend/app/(public)/apply/success/page.tsx`: UI for the success message.
- `backend/apps/transactions/admin.py`: Admin dashboard for verifying payments.

## Implementation Steps

### 1. Database Schema Updates
**`backend/apps/transactions/models.py`**
- Update `PaymentMethod` choices to include `PAYPAL`, `CASHAPP`, `CHIME`.
- Update `PaymentStatus` choices to include `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`.
- Update `Payment` model:
  - Make `transaction` field nullable (`null=True, blank=True`).
  - Add `rental_application = models.ForeignKey("crm.RentalApplication", null=True, blank=True, on_delete=models.CASCADE, related_name="payments")`.
  - Add `reference_id = models.CharField(max_length=100, blank=True)`.
  - Add `proof_image = models.CharField(max_length=500, blank=True)`.
  - Add `verified_by = models.ForeignKey("accounts.CustomUser", null=True, blank=True, on_delete=models.SET_NULL, related_name="verified_payments")`.
  - Add `verified_at = models.DateTimeField(null=True, blank=True)`.
  - Add `rejection_reason = models.TextField(blank=True)`.

**`backend/apps/crm/models.py`**
- Ensure `ApplicationStatus` includes `PENDING_VERIFICATION` (currently we only have `PENDING_PAYMENT` and `SUBMITTED`, so I will add `PENDING_VERIFICATION` and `PAYMENT_FAILED`).

### 2. Backend Serializers and Views
- Update `RentalApplicationCreateSerializer` to handle the new fields (or create a separate endpoint for submitting the payment proof).
- We'll create a nested or separate `PaymentSerializer` to handle proof submission.
- Modify the `RentalApplication` submit flow in the API to create a `Payment` record tied to the application.

### 3. Frontend UI Updates
**`frontend/components/public/RentalApplicationForm.tsx`**
- Modify the `PAYMENT_STEP` to display a grid of options (PayPal, CashApp, Chime, Bank Transfer).
- When a method is selected, show instructions (e.g., "Send $50 to $HaskerRealty on CashApp").
- Add input fields for:
  - **Reference ID / Username** (e.g., "$JohnDoe")
  - **Upload Proof** (Receipt Screenshot upload to Cloudinary)
- Change the submit button logic to include these details in the payload.

**`frontend/app/(public)/apply/success/page.tsx`**
- Update the success page to reflect the `PENDING_VERIFICATION` status.
- Show a message: "Your payment proof has been submitted and is under review."

### 4. Admin Verification Workflow
**`backend/apps/transactions/admin.py`**
- Register the `Payment` model in the admin if not already.
- Create an Unfold admin view for "Pending Payments" that displays the uploaded proof image, reference ID, amount, and buttons to either "Verify" or "Reject".
- Add custom admin actions `verify_payment` and `reject_payment`.
  - `verify_payment`: Sets status to `VERIFIED`, updates `verified_by` and `verified_at`, and changes the linked `RentalApplication` status to `SUBMITTED`.
  - `reject_payment`: Sets status to `REJECTED`, captures the rejection reason, and changes the linked `RentalApplication` status to `PAYMENT_FAILED`.

## Verification & Testing
- Attempt to submit a rental application with a simulated CashApp payment.
- Verify that a `Payment` record is created with `PENDING_VERIFICATION` status.
- Verify the frontend redirects to the correct success page state.
- Log in to the Django admin and use the new actions to approve the payment. Check that the application advances to `SUBMITTED`.
