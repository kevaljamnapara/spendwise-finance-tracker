from django.urls import path
from . import views

urlpatterns = [
    path('export-csv/', views.export_csv, name='export_csv'),
    path('analytics/', views.analytics_summary, name='analytics_summary'),
    path('predict/', views.predict_expense, name='predict_expense'),
]
