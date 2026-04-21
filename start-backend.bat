@echo off
title Hasker Backend (Django)
cd /d "%~dp0backend"
set DJANGO_SETTINGS_MODULE=config.settings.local
set DATABASE_URL=sqlite:///db.sqlite3
py -3 manage.py runserver 8000
pause
