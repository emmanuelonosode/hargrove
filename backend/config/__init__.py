from .celery import app as celery_app
from .celery import app  # celery -A config CLI resolves the 'app' attribute

__all__ = ("celery_app",)
