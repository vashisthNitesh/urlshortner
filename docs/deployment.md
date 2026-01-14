# Deployment on Render

## Environment variables

Set the following variables in Render (or your hosting provider):

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG` (`0` for production)
- `DJANGO_ALLOWED_HOSTS` (comma-separated list)
- `DB_ENGINE=django.db.backends.postgresql`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `RAZORPAY_WEBHOOK_SECRET`

## Render setup

1. Create a PostgreSQL database (Neon or Render Postgres) and populate the DB variables.
2. Create a new Web Service connected to this repository.
3. Use the following build command:
   ```bash
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```
4. Use the following start command:
   ```bash
   gunicorn pulselink.wsgi:application
   ```

## Scheduled jobs

Add a cron job (Render Cron, GitHub Actions, or server cron) to deactivate expired links:

```bash
python manage.py cleanup_expired_links
```
