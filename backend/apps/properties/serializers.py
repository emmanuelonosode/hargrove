from rest_framework import serializers
from .models import Property, PropertyImage, PropertyAmenity, AmenityCategory
from apps.accounts.serializers import PublicAgentSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ["id", "image_url", "caption", "is_primary", "order"]

    def get_image_url(self, obj):
        if not obj.image:
            return None
        val = str(obj.image)
        return val if val.startswith("http") else obj.image.url


class PropertyAmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyAmenity
        fields = ["id", "name"]


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    primary_image_url = serializers.SerializerMethodField()
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id", "slug", "title", "type", "listing_type", "status",
            "price", "price_label", "bedrooms", "bathrooms", "sqft",
            "address", "city", "state", "neighborhood",
            "is_featured", "primary_image_url", "agent_name", "created_at",
            "latitude", "longitude",
        ]

    def get_primary_image_url(self, obj):
        img = obj.primary_image
        if not img or not img.image:
            return None
        val = str(img.image)
        return val if val.startswith("http") else img.image.url

    def get_agent_name(self, obj):
        return obj.agent.full_name


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views."""
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = PropertyAmenitySerializer(many=True, read_only=True)
    amenity_categories = serializers.SerializerMethodField()
    agent = PublicAgentSerializer(read_only=True)
    agent_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__("apps.accounts.models", fromlist=["CustomUser"]).CustomUser.objects.filter(role="AGENT"),
        source="agent",
        write_only=True,
        required=False,
    )

    class Meta:
        model = Property
        fields = [
            "id", "slug", "title", "description", "type", "listing_type", "status", "condition",
            "price", "price_label",
            "bedrooms", "bathrooms", "sqft", "lot_size", "year_built", "garage", "stories",
            "address", "cross_street", "city", "state", "zip_code", "latitude", "longitude", "neighborhood",
            "virtual_tour_url", "tour_360_url", "is_featured", "is_published",
            "images", "amenities", "amenity_categories", "agent", "agent_id",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_amenity_categories(self, obj):
        all_amenities = obj.amenities.select_related("category").all()
        grouped: dict = {}
        uncategorized = []
        for amenity in all_amenities:
            if amenity.category_id:
                cat = amenity.category
                if cat.id not in grouped:
                    grouped[cat.id] = {
                        "id": cat.id,
                        "name": cat.name,
                        "icon": cat.icon,
                        "order": cat.order,
                        "amenities": [],
                    }
                grouped[cat.id]["amenities"].append({"id": amenity.id, "name": amenity.name})
            else:
                uncategorized.append({"id": amenity.id, "name": amenity.name})
        result = sorted(grouped.values(), key=lambda x: x.pop("order", 0))
        if uncategorized:
            result.append({"id": None, "name": "Other Features", "icon": "", "amenities": uncategorized})
        return result
