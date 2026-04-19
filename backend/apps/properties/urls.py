from django.urls import path
from . import views

urlpatterns = [
    path("", views.PropertyListCreateView.as_view(), name="property-list-create"),
    path("featured/", views.FeaturedPropertiesView.as_view(), name="property-featured"),
    path("<slug:slug>/", views.PropertyDetailView.as_view(), name="property-detail"),
    path("<slug:slug>/inquiries/", views.property_inquiry, name="property-inquiry"),
]
