from rest_framework import serializers
from .models import Property, PropertyImage, PropertyAmenity
from apps.accounts.serializers import PublicAgentSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ["id", "image_url", "caption", "is_primary", "order"]

    def get_image_url(self, obj):
        return obj.image.url if obj.image else None


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
        ]

    def get_primary_image_url(self, obj):
        img = obj.primary_image
        return img.image.url if img else None

    def get_agent_name(self, obj):
        return obj.agent.full_name


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views."""
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = PropertyAmenitySerializer(many=True, read_only=True)
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
            "id", "slug", "title", "description", "type", "listing_type", "status",
            "price", "price_label",
            "bedrooms", "bathrooms", "sqft", "lot_size", "year_built", "garage", "stories",
            "address", "city", "state", "zip_code", "latitude", "longitude", "neighborhood",
            "virtual_tour_url", "is_featured", "is_published",
            "images", "amenities", "agent", "agent_id",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]
