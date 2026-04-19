from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Post
from .serializers import PostListSerializer, PostDetailSerializer


class PostListView(generics.ListAPIView):
    """GET /api/v1/blog/posts/ — public, filterable by category and is_featured."""
    serializer_class   = PostListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ["category", "is_featured"]
    search_fields      = ["title", "excerpt"]
    ordering_fields    = ["published_at", "read_time_minutes"]
    ordering           = ["-published_at"]

    def get_queryset(self):
        return (
            Post.objects
            .filter(is_published=True)
            .select_related("author", "author__agent_profile")
        )


class PostDetailView(generics.RetrieveAPIView):
    """GET /api/v1/blog/posts/<slug>/ — public."""
    serializer_class   = PostDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field       = "slug"

    def get_queryset(self):
        return (
            Post.objects
            .filter(is_published=True)
            .select_related("author", "author__agent_profile")
        )
