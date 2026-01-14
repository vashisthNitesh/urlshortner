# PulseLink (Django + Jinja)

This repository now contains a Django application that renders Jinja templates for the PulseLink URL shortener experience. The stack no longer depends on Node.js, React, or Nuxt.

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

## Notes
- The dashboard includes a simple link creation form backed by Django models.
- Customize styles in `shortener/static/css/styles.css`.
