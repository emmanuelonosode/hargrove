import django_filters
from django.db.models import Q
from .models import Property


class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    beds = django_filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    baths = django_filters.NumberFilter(field_name="bathrooms", lookup_expr="gte")
    min_sqft = django_filters.NumberFilter(field_name="sqft", lookup_expr="gte")
    max_sqft = django_filters.NumberFilter(field_name="sqft", lookup_expr="lte")
    q = django_filters.CharFilter(method="search_filter")
    sort = django_filters.CharFilter(method="sort_filter")

    class Meta:
        model = Property
        fields = {
            "type": ["exact"],
            "listing_type": ["exact"],
            "status": ["exact"],
            "condition": ["exact"],
            "city": ["exact", "icontains"],
            "state": ["exact", "icontains"],
            "zip_code": ["exact"],
            "is_featured": ["exact"],
            "is_published": ["exact"],
            "agent": ["exact"],
            "garage": ["exact", "gte"],
            "year_built": ["gte", "lte"],
        }

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value)
            | Q(address__icontains=value)
            | Q(city__icontains=value)
            | Q(neighborhood__icontains=value)
            | Q(state__icontains=value)
            | Q(zip_code__icontains=value)
        )

    def sort_filter(self, queryset, name, value):
        sort_map = {
            "price_asc": "price",
            "price_desc": "-price",
            "newest": "-created_at",
            "oldest": "created_at",
            "beds_asc": "bedrooms",
            "beds_desc": "-bedrooms",
            "sqft_desc": "-sqft",
        }
        order = sort_map.get(value, "-created_at")
        return queryset.order_by(order)
