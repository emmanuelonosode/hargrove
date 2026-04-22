from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Property
from .serializers import PropertyListSerializer, PropertyDetailSerializer
from .filters import PropertyFilter
from apps.accounts.permissions import IsAgentOrAbove


class FlexiblePageSize(PageNumberPagination):
    """Allow clients to request up to 5 000 results via ?page_size=N."""
    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 5000


class PropertyListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/properties/  — public list with filters
    POST /api/v1/properties/  — staff only, create listing
    """
    queryset = Property.objects.select_related("agent", "agent__agent_profile").prefetch_related("images", "amenities")
    filterset_class = PropertyFilter
    search_fields = ["title", "address", "city", "neighborhood"]
    ordering_fields = ["price", "created_at", "bedrooms", "sqft"]
    ordering = ["-created_at"]
    pagination_class = FlexiblePageSize

    def get_serializer_class(self):
        return PropertyDetailSerializer if self.request.method == "POST" else PropertyListSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [IsAgentOrAbove()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Public users only see published properties
        if not self.request.user or not self.request.user.is_authenticated:
            return qs.filter(is_published=True)
        if self.request.user.role == "CLIENT":
            return qs.filter(is_published=True)
        return qs


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/v1/properties/{slug}/"""
    queryset = Property.objects.select_related("agent", "agent__agent_profile").prefetch_related("images", "amenities")
    serializer_class = PropertyDetailSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [IsAgentOrAbove()]


class FeaturedPropertiesView(generics.ListAPIView):
    """GET /api/v1/properties/featured/ — for homepage ISR."""
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]
    queryset = (
        Property.objects
        .filter(is_featured=True, is_published=True, status="available")
        .select_related("agent")
        .prefetch_related("images")
        .order_by("-created_at")[:6]
    )


class AgentListingsView(generics.ListAPIView):
    """GET /api/v1/agents/{agent_id}/listings/ — public agent listings."""
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Property.objects
            .filter(agent_id=self.kwargs["agent_id"], is_published=True)
            .select_related("agent")
            .prefetch_related("images")
            .order_by("-created_at")
        )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def property_inquiry(request, slug):
    """POST /api/v1/properties/{slug}/inquiries/ — creates a Lead from property detail page."""
    try:
        prop = Property.objects.get(slug=slug, is_published=True)
    except Property.DoesNotExist:
        return Response({"detail": "Property not found."}, status=status.HTTP_404_NOT_FOUND)

    from apps.crm.serializers import LeadCreateSerializer
    data = request.data.copy()
    data["source"] = "PROPERTY_INQUIRY"
    data["property_interest"] = prop.id
    data["interest_type"] = "BUY" if prop.listing_type == "for-sale" else "RENT"

    serializer = LeadCreateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    lead = serializer.save()

    # Async: notify the listing agent
    from apps.notifications.tasks import send_lead_notification
    send_lead_notification.delay(lead.id)

    return Response({"message": "Inquiry received. An advisor will contact you within 24 hours."}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def agent_inquiry(request, agent_id):
    """POST /api/v1/agents/{agent_id}/inquiries/ — contact a specific agent."""
    from apps.accounts.models import CustomUser, Role
    try:
        agent = CustomUser.objects.get(id=agent_id, role=Role.AGENT, is_active=True)
    except CustomUser.DoesNotExist:
        return Response({"detail": "Agent not found."}, status=status.HTTP_404_NOT_FOUND)

    from apps.crm.serializers import LeadCreateSerializer
    data = request.data.copy()
    data["source"] = "AGENT_INQUIRY"
    data["agent_interest"] = agent.id
    data["interest_type"] = data.get("interest_type", "BUY")

    serializer = LeadCreateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    lead = serializer.save()

    from apps.notifications.tasks import send_lead_notification
    send_lead_notification.delay(lead.id)

    return Response({"message": "Message sent. The advisor will be in touch shortly."}, status=status.HTTP_201_CREATED)
