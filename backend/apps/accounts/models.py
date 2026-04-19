from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from cloudinary.models import CloudinaryField


class Role(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    MANAGER = "MANAGER", "Manager"
    AGENT = "AGENT", "Agent"
    ACCOUNTANT = "ACCOUNTANT", "Accountant"
    CLIENT = "CLIENT", "Client"


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)
    avatar = CloudinaryField("avatar", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = CustomUserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} <{self.email}>"

    @property
    def username(self):
        """Satisfy any template/library that looks up user.username directly."""
        return self.email

    def get_full_name(self):
        """
        Required by AbstractBaseUser and called by Django admin / unfold templates via
        {{ user.get_full_name|default:user.username }}.
        Returning a non-empty string here prevents the |default fallback from ever running.
        """
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        """Required by AbstractBaseUser."""
        return self.first_name

    @property
    def full_name(self):
        return self.get_full_name()

    @property
    def avatar_url(self):
        """Return the Cloudinary HTTPS URL for the avatar, or None if not set."""
        try:
            return self.avatar.url if self.avatar else None
        except Exception:
            return None

    @property
    def is_agent(self):
        return self.role == Role.AGENT

    @property
    def is_admin_or_manager(self):
        return self.role in (Role.ADMIN, Role.MANAGER)


class AgentProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="agent_profile"
    )
    avatar = CloudinaryField("profile_photo", blank=True, null=True)
    bio = models.TextField(blank=True)
    license_number = models.CharField(max_length=50, blank=True)
    specialties = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=3.00)
    total_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    years_experience = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Agent Profile"

    def __str__(self):
        return f"Profile — {self.user.full_name}"
