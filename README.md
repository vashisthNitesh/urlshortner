# PulseLink (Django + Nuxt rebuild)

This project now ships a Python/Django backend (REST API) and a Nuxt 3 frontend. The backend targets PostgreSQL (Render + Neon) and integrates Razorpay for payments; the frontend includes Google AdSense rendering support.

## Stack
- **Backend**: Django 5, Django REST Framework, PostgreSQL via `DATABASE_URL`, Razorpay order endpoint.
- **Frontend**: Nuxt 3 (Vue), runtime-configurable API base URL, Razorpay checkout, and AdSense banner component.

## Quickstart
1. Copy `.env.example` to `.env` at the repository root. Fill in `DATABASE_URL`, `SECRET_KEY`, and Razorpay/AdSense values.
2. Backend setup
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser  # optional, for admin
   python manage.py runserver 0.0.0.0:8000
   ```
3. Frontend setup
   ```bash
   cd frontend
   npm install
   npm run dev -- --port 3000
   ```
4. Configure Nuxt runtime env (e.g., `API_BASE=http://localhost:8000/api`).

## Deployment (Render + Neon)
- Set `DATABASE_URL` to your Neon connection string (include `sslmode=require` as needed).
- Run `python manage.py migrate` during the Render build/launch phase.
- Expose env vars for `SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NUXT_PUBLIC_ADSENSE_CLIENT`.
- Serve the Django app with Gunicorn (see `backend/requirements.txt`) and deploy the Nuxt build separately (e.g., Render static or Node service).

## API surface
- `POST /api/payments/razorpay/order/` – creates a Razorpay order using backend credentials.
- `GET/POST /api/links/` – basic CRUD for links (slug + destination URL).

## Notes
- The previous Next.js/Prisma implementation has been superseded by this Django + Nuxt stack; migrate data into the new schema before going live.
