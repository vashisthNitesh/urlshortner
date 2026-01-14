# PulseLink (Django + Jinja)

This repository now contains a Django application that renders Jinja templates for the PulseLink URL shortener experience. The stack no longer depends on Node.js, React, or Nuxt.
Legacy front-end assets have been removed so the repository reflects the Django-only stack.

## Stack
- **Web app**: Django + Jinja2
- **Database**: SQLite (default)

## Quickstart
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Visit `http://127.0.0.1:8000` to view the marketing site and demo dashboard.

## Environment
- `DJANGO_SECRET_KEY`: Django secret key (defaults to `dev-secret-key`).
- `DJANGO_DEBUG`: Set to `1` to enable debug mode (defaults to `1`).

## Notes
- The dashboard includes a simple link creation form backed by Django models.
- Customize styles in `shortener/static/css/styles.css`.
