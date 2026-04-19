from django.urls import path
from . import views

urlpatterns = [
    path("", views.TransactionListCreateView.as_view(), name="transaction-list-create"),
    path("<int:pk>/", views.TransactionDetailView.as_view(), name="transaction-detail"),
    path("<int:transaction_pk>/payments/", views.PaymentListCreateView.as_view(), name="payment-list-create"),
    path("<int:transaction_pk>/invoices/", views.InvoiceListCreateView.as_view(), name="invoice-list-create"),
    path("<int:transaction_pk>/invoices/<int:invoice_pk>/send/", views.send_invoice, name="invoice-send"),
]
