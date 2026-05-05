# Hasker & Co. Realty Group — Project Intelligence

Comprehensive overview and instructional context for the Hasker & Co. Realty Group full-stack real estate platform.

## Project Overview
A sophisticated real estate management system featuring a modern property listing portal, agent dashboards, and an internal CRM for operations.

- **Frontend:** Next.js 16 (Beta/Experimental) using App Router, React 19, and Tailwind CSS v4.
- **Backend:** Django 4.2 with Django REST Framework (DRF), PostgreSQL, and Celery for background tasks.
- **Architecture:** Decoupled Monorepo structure with independent `backend/` and `frontend/` directories.
- **Authentication:** JWT-based (SimpleJWT) with a custom User model supporting multi-role access (Admin, Manager, Agent, Client).
- **Admin Interface:** Enhanced with `django-unfold` for a modern, responsive dashboard.
- **Media:** Cloudinary for robust image and asset management.

---

## Technical Stack

### Backend (`/backend`)
- **Framework:** Django 4.2.x
- **API:** Django REST Framework (DRF) 3.14+
- **Database:** PostgreSQL (Production) / SQLite (Local development)
- **Auth:** `djangorestframework-simplejwt`
- **Task Queue:** Celery + Redis
- **Styling:** `django-unfold` (Admin)
- **Email:** Custom SMTP configuration with synchronous fallback for shared hosting environments.

### Frontend (`/frontend`)
- **Framework:** Next.js 16.2.3 (App Router)
- **Library:** React 19.2.4
- **Styling:** Tailwind CSS v4.0.0
- **UI Components:** Radix UI primitives, Lucide React icons.
- **Animations:** Framer Motion 12+
- **Maps:** Leaflet for property geographic visualization.
- **State/Data:** SWR for data fetching, React Hook Form + Zod for validation.

---

## Building and Running

### Backend Setup
```bash
cd backend
# 1. Install dependencies
pip install -r requirements/local.txt

# 2. Configure environment
cp .env.example .env  # Update with your local database and Cloudinary keys

# 3. Database setup
python manage.py migrate
python manage.py seed_data  # Optional: seed initial data if script exists

# 4. Run server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```

---

## Development Conventions

### General
- **Monorepo Workflow:** Work within the respective sub-directories. Do not mix dependencies between frontend and backend.
- **API Versioning:** All APIs are versioned under `/api/v1/`.

### Backend (Django)
- **Settings:** Managed via `python-decouple`. Configuration is split into `base.py`, `local.py`, and `production.py`.
- **User Roles:** Use `apps.accounts.models.Role` for permission checks.
- **Media Storage:** Always use the `avatar_url` property or Cloudinary fields for images; do not rely on local file paths.
- **Middleware:** `DisableCSRFForAPI` is active for API routes; ensure it remains before `CsrfViewMiddleware`.

### Frontend (Next.js/React)
- **Next.js 16 Warning:** This project uses an experimental/beta version of Next.js. Refer to `frontend/AGENTS.md` regarding breaking changes in APIs and file structures.
- **Tailwind 4:** Utilizes the new `@tailwindcss/postcss` engine. Configuration is simplified; rely on `globals.css` for theme extensions.
- **Utility:** Use the `cn()` utility in `lib/utils.ts` for conditional class merging.
- **Price Formatting:** Use `formatPrice()` from `lib/utils.ts` for consistent currency display.

### Testing
- **Backend:** Run tests using `python manage.py test`.
- **Frontend:** Run linting with `npm run lint`. (Add unit tests as the project matures).

---

## Implemented Features & Architecture Notes

### Client Portal & Data
- **Dashboard (`/portal/profile`):** Acts as the central hub for authenticated clients. It integrates data concurrently from multiple endpoints:
  - **My Applications:** Tracks the status of rental applications (e.g., `DRAFT`, `PENDING_VERIFICATION`, `REVIEWED`).
  - **My Payments & Invoices:** Displays payment history, statuses, and outstanding invoices.
  - **Favorites:** Shows properties the user has saved via the `FavoriteProperty` API.
- **Favorites System:** Users can save properties by clicking the heart icon on property detail pages.

### Authentication Flow
- **Seamless Registration:** If a user registers with an intended destination (e.g., `?next=/apply`), the system bypasses the generic onboarding intent selection after email verification, automatically setting a default intent and redirecting them to complete their task.
- **Tokens:** JWT access tokens (4h) and refresh tokens (14d) are managed securely using localStorage and HttpOnly cookies via `apiFetch()`.

### Payment Architecture
- **Manual Verification Flow:** To accommodate diverse payment methods (CashApp, Venmo, Zelle, Bank Transfers), users select a method during the rental application or invoice payment, transfer the funds externally, and upload a screenshot/receipt as proof (saved via Cloudinary).
- **Backend Processing:** The submitted proof creates a `Payment` record with a `PENDING_VERIFICATION` status. Admins review and either verify or reject the payment via the Django admin interface, which triggers corresponding status updates on the linked `RentalApplication` or `Invoice` and fires celery notification emails.

---

## Key Files & Directories
- `backend/apps/`: Contains all modular Django applications (accounts, properties, crm, etc.).
- `backend/config/`: Core Django configuration and URL routing.
- `frontend/app/`: Next.js App Router directory.
- `frontend/components/`: Reusable UI and layout components.
- `frontend/lib/`: Shared utilities, API clients, and constants.
- `GEMINI.md`: This instruction file.
