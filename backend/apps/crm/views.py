from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.accounts.permissions import IsAgentOrAbove, IsManagerOrAbove
from .models import Lead, LeadActivity, Client, LeadStatus, RentalApplication
from .serializers import (
    LeadCreateSerializer, LeadListSerializer, LeadDetailSerializer,
    LeadActivitySerializer, LeadAssignSerializer, ClientSerializer,
    RentalApplicationCreateSerializer, RentalApplicationAdminSerializer,
    RentalApplicationLatestProfileSerializer,
)


# ... (keep other views)

class RentalApplicationLatestProfileView(generics.RetrieveAPIView):
    """GET /api/v1/leads/latest-profile/ — fetch most recent application for autofill."""
    serializer_class = RentalApplicationLatestProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        application = RentalApplication.objects.filter(
            email=user.email
        ).order_by("-submitted_at").first()
        
        if not application:
            from django.http import Http404
            raise Http404("No previous application found.")
        return application


class LeadListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/leads/  — staff see all or own leads
    POST /api/v1/leads/  — public (contact form submission)
    """
    queryset = Lead.objects.select_related("assigned_agent", "property_interest").all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "source", "interest_type", "assigned_agent"]
    search_fields = ["full_name", "email", "phone", "preferred_location"]
    ordering_fields = ["created_at", "last_contacted_at", "status"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return LeadCreateSerializer
        return LeadListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.AllowAny()]
        return [IsAgentOrAbove()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user or not user.is_authenticated:
            return qs.none()
        # Agents see only their assigned leads
        if user.role == "AGENT":
            return qs.filter(assigned_agent=user)
        return qs

    def perform_create(self, serializer):
        lead = serializer.save()
        # Notify any currently assigned agent (or broadcast to managers)
        try:
            from apps.notifications.tasks import send_lead_notification
            send_lead_notification.delay(lead.id)
        except Exception:
            pass  # Don't let notification failure break lead creation


class LeadDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/leads/{id}/"""
    queryset = Lead.objects.select_related("assigned_agent", "property_interest", "agent_interest").prefetch_related("activities__agent")
    permission_classes = [IsAgentOrAbove]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return LeadDetailSerializer
        return LeadDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "AGENT":
            return qs.filter(assigned_agent=user)
        return qs

    def perform_update(self, serializer):
        lead = serializer.save()
        # Track last_contacted_at if status changed from NEW
        if lead.status != LeadStatus.NEW:
            Lead.objects.filter(pk=lead.pk, last_contacted_at__isnull=True).update(
                last_contacted_at=timezone.now()
            )


@api_view(["POST"])
@permission_classes([IsManagerOrAbove])
def lead_assign(request, pk):
    """POST /api/v1/leads/{id}/assign/ — assign to an agent."""
    try:
        lead = Lead.objects.get(pk=pk)
    except Lead.DoesNotExist:
        return Response({"detail": "Lead not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = LeadAssignSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    from apps.accounts.models import CustomUser
    agent = CustomUser.objects.get(id=serializer.validated_data["agent_id"])
    lead.assigned_agent = agent
    lead.save(update_fields=["assigned_agent", "updated_at"])

    # Log the assignment as a NOTE activity
    LeadActivity.objects.create(
        lead=lead,
        agent=request.user,
        activity_type="NOTE",
        note=f"Lead assigned to {agent.full_name} by {request.user.full_name}.",
    )

    return Response({"detail": f"Lead assigned to {agent.full_name}."})


class LeadActivityListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/leads/{pk}/activity/"""
    serializer_class = LeadActivitySerializer
    permission_classes = [IsAgentOrAbove]

    def get_queryset(self):
        return LeadActivity.objects.filter(lead_id=self.kwargs["pk"]).select_related("agent")

    def perform_create(self, serializer):
        lead = Lead.objects.get(pk=self.kwargs["pk"])
        serializer.save(lead=lead, agent=self.request.user)
        # Update last_contacted_at
        lead.last_contacted_at = timezone.now()
        lead.save(update_fields=["last_contacted_at"])


@api_view(["GET"])
@permission_classes([IsAgentOrAbove])
def lead_pipeline(request):
    """GET /api/v1/leads/pipeline/ — kanban counts by status."""
    from django.db.models import Count

    qs = Lead.objects.all()
    if request.user.role == "AGENT":
        qs = qs.filter(assigned_agent=request.user)

    counts = qs.values("status").annotate(count=Count("id"))
    pipeline = {s[0]: 0 for s in LeadStatus.choices}
    for row in counts:
        pipeline[row["status"]] = row["count"]

    return Response({"pipeline": pipeline, "total": sum(pipeline.values())})


class ClientListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/clients/"""
    serializer_class = ClientSerializer
    permission_classes = [IsAgentOrAbove]

    def get_queryset(self):
        qs = Client.objects.select_related("lead", "preferred_agent", "user")
        user = self.request.user
        if user.role == "AGENT":
            return qs.filter(preferred_agent=user)
        return qs


class ClientDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/clients/{id}/"""
    serializer_class = ClientSerializer
    permission_classes = [IsAgentOrAbove]

    def get_queryset(self):
        qs = Client.objects.select_related("lead", "preferred_agent", "user")
        user = self.request.user
        if user.role == "AGENT":
            return qs.filter(preferred_agent=user)
        return qs


# ── Rental Application Views ───────────────────────────────────────────────────

class RentalApplicationCreateView(generics.CreateAPIView):
    """POST /api/v1/leads/apply/ — public form submission."""
    serializer_class   = RentalApplicationCreateSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Capture client IP
        x_forwarded = self.request.META.get("HTTP_X_FORWARDED_FOR")
        ip = x_forwarded.split(",")[0].strip() if x_forwarded else self.request.META.get("REMOTE_ADDR")
        
        # Check for payment proof data
        payment_method = self.request.data.get("payment_method")
        reference_id   = self.request.data.get("reference_id")
        proof_image    = self.request.data.get("proof_image")
        proof_file     = self.request.FILES.get("proof_file")
        
        final_proof_url = proof_image or ""

        if proof_file:
            import cloudinary.uploader
            try:
                upload_res = cloudinary.uploader.upload(proof_file)
                final_proof_url = upload_res.get("secure_url", "")
            except Exception:
                pass

        if payment_method:
            # If payment info is provided, set status to PENDING_VERIFICATION
            application = serializer.save(ip_address=ip, status="PENDING_VERIFICATION")
            
            # Create a Payment record tied to this application
            from apps.transactions.models import Payment
            Payment.objects.create(
                rental_application=application,
                amount=application.application_fee,
                payment_method=payment_method,
                reference_id=reference_id or "",
                proof_image=final_proof_url,
                status="PENDING_VERIFICATION"
            )
        else:
            application = serializer.save(ip_address=ip)

            
        # Trigger async PDF generation
        try:
            from apps.notifications.tasks import generate_rental_application_pdf
            generate_rental_application_pdf.delay(application.id)
        except Exception:
            pass  # Celery may not be running in dev — fail silently


class RentalApplicationDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/leads/apply/<pk>/ — staff only."""
    serializer_class   = RentalApplicationAdminSerializer
    permission_classes = [IsAgentOrAbove]
    queryset           = RentalApplication.objects.select_related("property", "lead")
