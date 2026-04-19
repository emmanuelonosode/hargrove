from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import CustomUser, Role
from .serializers import MeSerializer, PublicAgentSerializer
from .permissions import IsAdmin


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/auth/me/ — current user profile."""
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AgentListView(generics.ListAPIView):
    """GET /api/v1/agents/ — public agent directory."""
    serializer_class = PublicAgentSerializer
    permission_classes = [permissions.AllowAny]
    queryset = CustomUser.objects.filter(role=Role.AGENT, is_active=True).select_related("agent_profile")


class AgentDetailView(generics.RetrieveAPIView):
    """GET /api/v1/agents/{id}/ — public agent profile."""
    serializer_class = PublicAgentSerializer
    permission_classes = [permissions.AllowAny]
    queryset = CustomUser.objects.filter(role=Role.AGENT, is_active=True).select_related("agent_profile")
