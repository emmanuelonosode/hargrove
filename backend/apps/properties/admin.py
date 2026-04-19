from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from .models import Property, PropertyImage, PropertyAmenity


class PropertyImageInline(TabularInline):
    model = PropertyImage
    extra = 1
    fields = ["image", "caption", "is_primary", "order"]
    readonly_fields = []


class PropertyAmenityInline(TabularInline):
    model = PropertyAmenity
    extra = 3
    fields = ["name"]


@admin.register(Property)
class PropertyAdmin(ModelAdmin):
    list_display = [
        "title", "type", "listing_type", "status_badge",
        "price_display", "city", "state", "agent",
        "is_featured", "is_published", "created_at",
    ]
    list_filter = ["type", "listing_type", "status", "is_featured", "is_published", "city", "state"]
    search_fields = ["title", "address", "city", "neighborhood", "agent__email", "agent__first_name", "agent__last_name"]
    ordering = ["-created_at"]
    prepopulated_fields = {}  # slug is auto-generated
    readonly_fields = ["slug", "created_at", "updated_at"]
    date_hierarchy = "created_at"
    inlines = [PropertyImageInline, PropertyAmenityInline]
    actions = ["publish_properties", "unpublish_properties", "mark_featured", "unmark_featured"]

    fieldsets = (
        ("Core", {
            "fields": ("title", "slug", "description", "type", "listing_type", "status", "agent"),
        }),
        ("Pricing", {
            "fields": ("price", "price_label"),
        }),
        ("Physical Details", {
            "fields": ("bedrooms", "bathrooms", "sqft", "lot_size", "year_built", "garage", "stories"),
        }),
        ("Location", {
            "fields": ("address", "city", "state", "zip_code", "neighborhood", "latitude", "longitude"),
        }),
        ("Media & Flags", {
            "fields": ("virtual_tour_url", "is_featured", "is_published"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def status_badge(self, obj):
        colors = {
            "available": "#16a34a",
            "under-contract": "#d97706",
            "sold": "#dc2626",
            "rented": "#2563eb",
            "off-market": "#6b7280",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:9999px;font-size:11px">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"

    def price_display(self, obj):
        return f"${obj.price:,.0f}{obj.price_label}"
    price_display.short_description = "Price"

    @admin.action(description="Publish selected properties")
    def publish_properties(self, request, queryset):
        updated = queryset.update(is_published=True)
        self.message_user(request, f"{updated} properties published.")

    @admin.action(description="Unpublish selected properties")
    def unpublish_properties(self, request, queryset):
        updated = queryset.update(is_published=False)
        self.message_user(request, f"{updated} properties unpublished.")

    @admin.action(description="Mark as featured")
    def mark_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f"{updated} properties marked as featured.")

    @admin.action(description="Remove from featured")
    def unmark_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f"{updated} properties removed from featured.")


# PropertyImage and PropertyAmenity are managed exclusively via inlines in PropertyAdmin.
