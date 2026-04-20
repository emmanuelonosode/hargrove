from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, Role
from .serializers import MeSerializer, PublicAgentSerializer, RegisterSerializer
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


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — create a CLIENT account and return JWT tokens."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "full_name": user.full_name,
                    "role": user.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )
