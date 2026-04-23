from django.contrib.auth import get_user_model
User = get_user_model()
for user in User.objects.all():
    print(f"User: {user.email}, Role: {user.role}, Active: {user.is_active}")
