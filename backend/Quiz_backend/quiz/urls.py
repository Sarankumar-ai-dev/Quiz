from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_quiz),
    path('list/', views.list_quizzes),
    path('delete/<int:quiz_id>/', views.delete_quiz),
    path('stats/<int:quiz_id>/', views.quiz_stats),
    path('validate-key/', views.validate_key),
    path('questions/', views.get_questions),
    path('submit/', views.submit_quiz),
]