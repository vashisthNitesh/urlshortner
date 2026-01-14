from django.contrib.staticfiles.storage import staticfiles_storage
from django.middleware.csrf import get_token
from django.urls import reverse
from django.utils.safestring import mark_safe
from jinja2 import Environment, pass_context


@pass_context
def csrf_input(context):
    request = context.get("request")
    token = get_token(request)
    return mark_safe(
        f'<input type="hidden" name="csrfmiddlewaretoken" value="{token}">'
    )


def environment(**options):
    env = Environment(**options)
    env.globals.update(
        {
            "static": staticfiles_storage.url,
            "url": reverse,
            "csrf_input": csrf_input,
        }
    )
    return env
