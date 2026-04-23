from .base import *  # noqa
from decouple import config, Csv

DEBUG = False

# Robust allowed hosts for production
ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS", 
    default="admin.haskerrealtygroup.com,www.haskerrealtygroup.com,haskerrealtygroup.com", 
    cast=Csv()
)

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
] + MIDDLEWARE[1:]  # noqa — replace SecurityMiddleware with whitenoise version

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# SSL & Security
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Required for admin login & forms in production SSL
CSRF_TRUSTED_ORIGINS = [
    "https://admin.haskerrealtygroup.com",
    "https://www.haskerrealtygroup.com",
    "https://haskerrealtygroup.com",
]

# CORS fallbacks for production
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://www.haskerrealtygroup.com,https://haskerrealtygroup.com",
    cast=Csv()
)

# cPanel email uses SSL on port 465 (override TLS setting from base)
EMAIL_USE_SSL = config("EMAIL_USE_SSL", default=False, cast=bool)
if EMAIL_USE_SSL:
    EMAIL_USE_TLS = False

SENTRY_DSN = config("SENTRY_DSN", default="")
if SENTRY_DSN:
    import sentry_sdk
    sentry_sdk.init(dsn=SENTRY_DSN, traces_sample_rate=0.2)
