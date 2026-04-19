# Hasker & Co. Realty Group — Email System Guide

Complete guide for configuring email credentials, sending emails from the admin panel, and understanding the full tenant communication flow.

---

## Part 1 — Setting Up Your Email Credentials in the Admin

Before any email can be sent, you must enter your SMTP credentials once in the admin panel.
This is done through the **Email Configuration** section.

### Step 1 — Get a Gmail App Password

You cannot use your regular Gmail password here. Gmail requires a special **App Password** for third-party applications.

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Make sure **2-Step Verification** is turned **On** (required)
3. In the search bar at the top of the page, type **"App passwords"** and click the result
4. Click **Create a new app password**
5. For the name, type: `Hasker & Co. Admin`
6. Google will generate a **16-character password** (example: `abcd efgh ijkl mnop`)
7. **Copy it immediately** — Google only shows it once

> If you use a different email provider (Outlook, Zoho, etc.) the process is similar —
> create an App Password or allow SMTP access in your account's security settings.

---

### Step 2 — Enter Credentials in the Admin Panel

1. Log into the Django admin at [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)
2. In the left sidebar, find **NOTIFICATIONS** → click **Email Configuration**
3. Click **Add Email Configuration** (top right)
4. Fill in the fields:

| Field | What to enter | Example |
|---|---|---|
| **Display Name** | The name shown in the recipient's inbox | `Hasker & Co. Realty Group` |
| **From Email** | The address you want to send from | `info@haskerrealtygroup.com` |
| **SMTP Host** | Leave as default for Gmail | `smtp.gmail.com` |
| **SMTP Port** | Leave as default | `587` |
| **Use TLS** | Leave ticked | ✓ |
| **Use SSL** | Leave unticked | ☐ |
| **Email Host User** | The actual Gmail account | `yourname@gmail.com` |
| **Email Host Password** | The 16-character App Password from Step 1 | `abcdefghijklmnop` |
| **Is Active** | Must be ticked for emails to send | ✓ |

5. Click **Save**

---

### Step 3 — Test It

1. In the **Email Configuration** list, tick the checkbox next to your config
2. In the **Action** dropdown, select **"Send a test email to verify the configuration"**
3. Click **Go**
4. Check the inbox of your **Email Host User** address — you should receive a test email within a minute

If it fails, the admin will show an error message. The most common causes are:

| Error | Fix |
|---|---|
| `Authentication failed` | Wrong App Password — regenerate it at myaccount.google.com |
| `Username and password not accepted` | 2-Step Verification is off — enable it first |
| `Connection refused` | Wrong SMTP host or port |
| `SSL wrong version` | Don't enable both TLS and SSL at the same time |

---

## Part 2 — Sending Emails From the Admin Panel

Once your credentials are saved and tested, you can send emails directly from the admin.
All email actions work the same way: **select records → choose action → click Go**.

---

### Sending an Inquiry Acknowledgment

**When to use:** A prospective tenant has submitted a contact form or inquiry on the website.
Send them an acknowledgment so they know you received it.

1. Go to **CRM** → **Leads**
2. Find the lead(s) you want to email (use the search bar or filters)
3. Tick the checkbox next to their name(s)
4. In the **Action** dropdown, select **"Send Inquiry Acknowledgment Email"**
5. Click **Go**

The tenant will receive a branded HTML email confirming you received their inquiry, showing their reference number, assigned agent name (if set), and a link to browse available properties.

---

### Sending an Application Approval Email

**When to use:** You have reviewed a rental application and decided to approve it.

1. Go to **CRM** → **Rental Applications**
2. Find the approved application(s)
3. Tick the checkbox(es)
4. In the **Action** dropdown, select **"Send Approval Email to Applicant(s)"**
5. Click **Go**

The tenant will receive a congratulations email that includes:
- The property name and address
- Their agent's name and phone number
- 3 clear next steps: sign lease → pay security deposit → schedule key handover
- Payment instructions: check payable to Hasker & Co. Realty Group, or ACH via the secure portal

> **Tip:** You can also first mark the status to Approved using "Mark selected as Approved",
> then immediately send the approval email in the same session.

---

### Sending an Application Rejection Email

**When to use:** An application was reviewed and is not going forward.

1. Go to **CRM** → **Rental Applications**
2. Find the application(s)
3. Tick the checkbox(es)
4. In the **Action** dropdown, select **"Send Rejection Email to Applicant(s)"**
5. Click **Go**

The tenant receives a polite, professional email thanking them for their interest, letting them know the application was unsuccessful, and directing them to browse other available listings. No harsh language, no explanation of the reason (which could create legal exposure).

---

### Sending Move-In Instructions

**When to use:** The lease has been signed, the deposit has been paid, and you are ready to confirm the move-in date and handover details.

1. Go to **CRM** → **Rental Applications**
2. Find the approved application with a confirmed move-in date
3. Make sure the **Move-In Date** field on the application is set correctly (edit it first if needed)
4. Tick the checkbox
5. In the **Action** dropdown, select **"Send Move-In Instructions Email"**
6. Click **Go**

The tenant receives a move-in email with:
- Their confirmed move-in date
- Property address
- Key handover: in person at the property with the agent
- Utilities checklist (electricity, gas, water, internet)
- Move-in inspection instructions
- 24/7 maintenance emergency number

---

## Part 3 — The Complete Tenant Communication Flow

Here is how the entire email journey maps to the tenant pipeline, from first contact to moving in.

```
WEBSITE                          ADMIN PANEL                    TENANT INBOX
───────                          ───────────                    ────────────

1. Tenant submits inquiry
   (contact form / property
    listing page)
        │
        ▼
   Lead created in CRM
        │
        ├─── Auto: Agent/manager ──────────────────────────────► Agent receives
        │    notification email                                   new lead alert
        │
        └─── Manual trigger ──────────────────────────────────► "We received your
             "Send Inquiry                                        inquiry" email
             Acknowledgment"                                      (with ref number,
                                                                  agent name, link
                                                                  to properties)

2. Agent contacts tenant,
   books a viewing
        │
        ▼
   Viewing scheduled
        │
        └─── Auto (24h before) ───────────────────────────────► Viewing reminder
             Celery Beat task                                     sent to tenant
                                                                  + agent

3. Tenant submits rental
   application (website form)
        │
        ▼
   RentalApplication created
        │
        └─── Auto: Confirmation ──────────────────────────────► "Your application
             email + PDF                                          has been received"
                                                                  email + PDF copy

4. Admin reviews application
        │
        ├── APPROVED ──────────────────────────────────────────► "Congratulations!
        │   "Send Approval Email"                                 Your application
        │                                                         is approved"
        │                                                         (sign lease,
        │                                                          pay deposit,
        │                                                          schedule handover)
        │
        └── REJECTED ─────────────────────────────────────────► "Update on your
            "Send Rejection Email"                                application"
                                                                  (polite decline,
                                                                   link to other
                                                                   listings)

5. Lease signed & deposit paid
        │
        ▼
   Admin confirms move-in date
   on the application record
        │
        └─── Manual trigger ──────────────────────────────────► "Your move-in
             "Send Move-In                                        instructions"
             Instructions"                                        (date, address,
                                                                  key handover,
                                                                  utilities, 24/7
                                                                  emergency line)
```

---

## Part 4 — How the System Works (Technical Overview)

Understanding this helps you troubleshoot and extend the system.

### Email Delivery Pipeline

```
Admin clicks action
        │
        ▼
Django admin action method (crm/admin.py)
        │
        └── Calls task.delay(id)  ← queues the task asynchronously
                │
                ▼
        Celery worker picks it up (notifications/tasks.py)
                │
                ├── Loads EmailConfiguration from the database
                │   (your SMTP credentials — entered in admin)
                │
                ├── Renders the HTML template
                │   (templates/notifications/*.html)
                │
                └── Opens SMTP connection → sends email
                            │
                            ▼
                    Gmail SMTP → Tenant inbox
```

### Key Files

| File | Purpose |
|---|---|
| `apps/notifications/models.py` | `EmailConfiguration` — stores your SMTP credentials |
| `apps/notifications/admin.py` | Admin UI for credentials + test send action |
| `apps/notifications/tasks.py` | Celery tasks that actually send each email |
| `apps/crm/admin.py` | Admin actions on Leads and RentalApplications |
| `templates/notifications/email_base.html` | Branded HTML shell used by all emails |
| `templates/notifications/inquiry_acknowledgment.html` | Inquiry received email |
| `templates/notifications/application_approved.html` | Approval email |
| `templates/notifications/application_rejected.html` | Rejection email |
| `templates/notifications/move_in_instructions.html` | Move-in instructions email |

### Fallback Behaviour

If no active `EmailConfiguration` is saved in the database, the system automatically falls back to the `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` values in the `.env` file. This means the system always has a way to send email even if the admin config is missing.

### Celery Requirement

The email actions queue tasks through **Celery**. This means:
- A Celery worker must be running for emails to actually send
- The admin will say "Email queued" immediately — the email arrives when the worker processes it (usually within seconds)
- To start Celery locally: `celery -A config worker -l info`
- If Celery is not running, emails will queue and send once a worker starts

---

## Quick Reference

| What you want to send | Where in admin | Action name |
|---|---|---|
| Inquiry received confirmation | CRM → Leads | Send Inquiry Acknowledgment Email |
| Application approved | CRM → Rental Applications | Send Approval Email to Applicant(s) |
| Application rejected | CRM → Rental Applications | Send Rejection Email to Applicant(s) |
| Move-in instructions | CRM → Rental Applications | Send Move-In Instructions Email |
| Test that email is working | Notifications → Email Configuration | Send a test email to verify the configuration |
