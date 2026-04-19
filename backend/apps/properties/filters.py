import django_filters
from .models import Property


class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    beds = django_filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    q = django_filters.CharFilter(method="search_filter")

    class Meta:
        model = Property
        fields = {
            "type": ["exact"],
            "listing_type": ["exact"],
            "status": ["exact"],
            "city": ["exact", "icontains"],
            "state": ["exact"],
            "is_featured": ["exact"],
            "is_published": ["exact"],
            "agent": ["exact"],
        }

    def search_filter(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value)
            | Q(address__icontains=value)
            | Q(city__icontains=value)
            | Q(neighborhood__icontains=value)
            | Q(state__icontains=value)
        )
