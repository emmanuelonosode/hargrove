.PHONY: run migrate migrations shell superuser seed install

run:
	python manage.py runserver 8000

migrate:
	python manage.py migrate

migrations:
	python manage.py makemigrations

shell:
	python manage.py shell_plus

superuser:
	python manage.py createsuperuser

seed:
	python manage.py seed_dev

install:
	pip install -r requirements/local.txt

worker:
	celery -A config worker -l info

beat:
	celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
