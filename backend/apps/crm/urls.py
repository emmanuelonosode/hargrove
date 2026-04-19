from django.urls import path
from . import views

urlpatterns = [
    # Pipeline summary
    path("pipeline/", views.lead_pipeline, name="lead-pipeline"),

    # Leads
    path("", views.LeadListCreateView.as_view(), name="lead-list-create"),
    path("<int:pk>/", views.LeadDetailView.as_view(), name="lead-detail"),
    path("<int:pk>/assign/", views.lead_assign, name="lead-assign"),
    path("<int:pk>/activity/", views.LeadActivityListCreateView.as_view(), name="lead-activity"),

    # Rental Applications (public submit + staff detail)
    path("apply/", views.RentalApplicationCreateView.as_view(), name="rental-application-create"),
    path("apply/<int:pk>/", views.RentalApplicationDetailView.as_view(), name="rental-application-detail"),
]
