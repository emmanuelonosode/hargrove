from rest_framework import serializers
from .models import Lead, LeadActivity, Client, LeadStatus, RentalApplication


class LeadCreateSerializer(serializers.ModelSerializer):
    """Used by public inquiry forms — minimal required fields."""

    class Meta:
        model = Lead
        fields = [
            "id", "full_name", "email", "phone",
            "source", "interest_type",
            "budget_min", "budget_max", "preferred_location",
            "property_interest", "agent_interest",
            "services_requested", "message",
        ]

    def validate_services_requested(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Must be a list.")
        return value


class LeadActivitySerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="agent.full_name", read_only=True)

    class Meta:
        model = LeadActivity
        fields = ["id", "activity_type", "note", "agent", "agent_name", "created_at"]
        read_only_fields = ["id", "created_at"]


class LeadListSerializer(serializers.ModelSerializer):
    """Lightweight — for kanban and list views."""
    assigned_agent_name = serializers.CharField(source="assigned_agent.full_name", read_only=True, default=None)
    property_title = serializers.CharField(source="property_interest.title", read_only=True, default=None)

    class Meta:
        model = Lead
        fields = [
            "id", "full_name", "email", "phone",
            "source", "interest_type", "status",
            "assigned_agent", "assigned_agent_name",
            "property_interest", "property_title",
            "budget_min", "budget_max",
            "created_at", "last_contacted_at",
        ]


class LeadDetailSerializer(serializers.ModelSerializer):
    activities = LeadActivitySerializer(many=True, read_only=True)
    assigned_agent_name = serializers.CharField(source="assigned_agent.full_name", read_only=True, default=None)
    property_title = serializers.CharField(source="property_interest.title", read_only=True, default=None)

    class Meta:
        model = Lead
        fields = [
            "id", "full_name", "email", "phone",
            "source", "interest_type", "status",
            "budget_min", "budget_max", "preferred_location",
            "property_interest", "property_title",
            "agent_interest",
            "services_requested", "message",
            "assigned_agent", "assigned_agent_name",
            "activities",
            "created_at", "updated_at", "last_contacted_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LeadAssignSerializer(serializers.Serializer):
    agent_id = serializers.IntegerField()

    def validate_agent_id(self, value):
        from apps.accounts.models import CustomUser, Role
        try:
            CustomUser.objects.get(id=value, role=Role.AGENT, is_active=True)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Active agent not found.")
        return value


class ClientSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="lead.full_name", read_only=True)
    email = serializers.CharField(source="lead.email", read_only=True)
    phone = serializers.CharField(source="lead.phone", read_only=True)
    preferred_agent_name = serializers.CharField(source="preferred_agent.full_name", read_only=True, default=None)
    lead_source = serializers.CharField(source="lead.source", read_only=True)
    interest_type = serializers.CharField(source="lead.interest_type", read_only=True)

    class Meta:
        model = Client
        fields = [
            "id", "full_name", "email", "phone",
            "lead", "lead_source", "interest_type",
            "preferred_agent", "preferred_agent_name",
            "kyc_verified", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class RentalApplicationCreateSerializer(serializers.ModelSerializer):
    """Used by the public /apply form."""

    # Accept either a slug string (from the website URL) or a numeric PK
    rental_property = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=__import__("apps.properties.models", fromlist=["Property"]).Property.objects.filter(is_published=True),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = RentalApplication
        fields = [
            "id",
            "first_name", "middle_name", "last_name",
            "email", "cell_phone", "home_phone",
            "has_kids", "number_of_kids",
            "present_address", "city", "state", "zip_code",
            "move_in_date", "intended_stay_duration", "months_rent_upfront",
            "has_pets", "pet_description",
            "smokes", "drinks",
            "rental_property",
            "certification_text",
            "application_fee", "is_fee_paid", "status",
            # Virtual fields for payment proof submission
            "payment_method", "reference_id", "proof_image",
        ]
        read_only_fields = ["id", "application_fee", "is_fee_paid", "status"]

    payment_method = serializers.CharField(write_only=True, required=False)
    reference_id   = serializers.CharField(write_only=True, required=False)
    proof_image    = serializers.CharField(write_only=True, required=False)

    def validate(self, data):
        if data.get("has_kids") and not data.get("number_of_kids"):
            raise serializers.ValidationError(
                {"number_of_kids": "Please specify how many children."}
            )
        if data.get("has_pets") and not data.get("pet_description"):
            raise serializers.ValidationError(
                {"pet_description": "Please describe your pet(s)."}
            )
        return data


class RentalApplicationLatestProfileSerializer(serializers.ModelSerializer):
    """Used to pre-fill the form for returning applicants."""
    class Meta:
        model = RentalApplication
        fields = [
            "first_name", "middle_name", "last_name",
            "email", "cell_phone", "home_phone",
            "has_kids", "number_of_kids",
            "present_address", "city", "state", "zip_code",
            "intended_stay_duration", "months_rent_upfront",
            "has_pets", "pet_description",
            "smokes", "drinks",
        ]
class RentalApplicationAdminSerializer(serializers.ModelSerializer):
    """Full serializer for staff views."""
    full_name      = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    property_title = serializers.CharField(source="rental_property.title", read_only=True, default=None)
    lead_name      = serializers.SerializerMethodField()

    class Meta:
        model = RentalApplication
        fields = "__all__"
        read_only_fields = ["submitted_at", "application_pdf", "ip_address"]

    def get_lead_name(self, obj):
        return obj.lead.full_name if obj.lead else None
