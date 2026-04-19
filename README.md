# Hasker & Co. Realty Group

Full-stack real estate web application.

- **Frontend** — Next.js (App Router) · Tailwind CSS v4 · deployed on Vercel
- **Backend** — Django REST Framework · hosted on cPanel (Phusion Passenger)

## Quick start

```bash
# Backend
cd backend && pip install -r requirements/local.txt
cp .env.example .env   # fill in values
python manage.py migrate && python manage.py runserver

# Frontend
cd frontend && npm install && npm run dev
```

See `backend/.env.production` for cPanel deployment configuration.
