# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hasker & Co. Realty Group** — a full-stack real estate platform with a Next.js frontend and Django REST Framework backend.

---

## Commands

### Frontend (`/frontend`)
```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # ESLint
```

### Backend (`/backend`)
```bash
python manage.py runserver                          # Dev server (port 8000)
python manage.py migrate                            # Apply migrations
python manage.py makemigrations                     # Generate new migrations
python manage.py createsuperuser                    # Create admin user
celery -A config worker -l info                     # Start Celery worker
celery -A config beat -l info                       # Start Celery beat scheduler
```

Backend settings module: `DJANGO_SETTINGS_MODULE=config.settings.local` (dev) or `config.settings.production`.

---

## Architecture

### Frontend (`/frontend`)

**Next.js App Router** with route groups:
- `app/(auth)/` — `/login`, `/register`, `/forgot-password` (no auth required)
- `app/(public)/` — Public-facing pages: home, properties, agents, blog, apply
- `app/portal/` — Authenticated tenant portal: profile, documents, maintenance, payments, settings
- `app/rentals/` — Rental application flow

**Key files:**
- `context/AuthContext.tsx` — Global JWT auth state (login/register/logout, user object)
- `lib/auth.ts` — Token storage (localStorage + cookies), `apiFetch()` utility that injects `Authorization: Bearer` header
- `next.config.ts` — API rewrites (`/api/v1/*` → Django), security headers (CSP, HSTS), remote image domains

**Tech:** TypeScript, Tailwind CSS v4, Radix UI, react-hook-form + Zod, SWR for caching, Framer Motion, Leaflet maps.

### Backend (`/backend`)

**Django 4.2 + DRF** with 11 apps under `apps/`:

| App | Purpose |
|-----|---------|
| `accounts` | Custom user model (email-based), roles: ADMIN, MANAGER, AGENT, CLIENT, ACCOUNTANT |
| `properties` | Listings, images, amenities, favorites |
| `crm` | Leads, clients, rental applications |
| `transactions` | Sales/rent agreements, payments, invoices |
| `scheduler` | Property viewing appointments |
| `documents` | Tenant-facing documents (leases, etc.) |
| `notifications` | Celery email tasks, webhooks |
| `analytics` | Dashboard metrics |
| `blog` | Marketing blog posts |
| `maintenance` | Tenant maintenance requests |

**API base path:** `/api/v1/` — configured in `config/urls.py`.

**Settings split:** `config/settings/base.py` (shared) → `local.py` / `production.py`.

### API Proxy

Next.js rewrites all `/api/v1/*` requests to the Django backend. The rewrite includes `trailingSlash` handling to preserve POST bodies — do not change this without care.

### Authentication Flow

1. User registers → OTP email sent via Celery → email verified via `/api/v1/auth/verify/`
2. JWT issued: 4h access token, 14d refresh token (auto-rotated)
3. Frontend stores tokens in localStorage + HttpOnly cookies
4. `apiFetch()` auto-injects `Authorization: Bearer <token>`

### Async Tasks (Celery + Redis)

Tasks live in `apps/notifications/tasks.py` and app-level `tasks.py` files:
- `send_verification_email` — OTP on registration
- `send_lead_notification` — Alert agents/managers on new lead
- `generate_invoice_pdf` / `generate_payment_receipt` — WeasyPrint → Cloudinary upload
- `weekly_lead_followup` — Scheduled Monday task via celery-beat

### File Storage

Cloudinary via `django-cloudinary-storage`. All uploaded images/PDFs go to Cloudinary; reference domains are whitelisted in Next.js CSP headers.

### Permission Patterns (Backend)

```python
# Public read, authenticated write
permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# Staff only (AGENT, MANAGER, ADMIN, ACCOUNTANT)
permission_classes = [IsAgentOrAbove()]

# Per-method
def get_permissions(self):
    if self.request.method == 'GET':
        return [permissions.AllowAny()]
    return [IsAgentOrAbove()]
```

### Serializer Pattern

Separate read/write serializers (e.g., `PropertyListSerializer` vs `PropertyDetailSerializer`). Commission auto-calculated from price in `validated_data`.

---

## Environment Variables

See `backend/.env.example` for required secrets: `DATABASE_URL`, `REDIS_URL`, `STRIPE_*`, `EMAIL_*`, `CLOUDINARY_*`, `SECRET_KEY`.

Frontend reads `NEXT_PUBLIC_API_URL` to target the Django backend.
