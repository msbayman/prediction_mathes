from django.urls import path
from . import views
from .views import  PredictionsView

urlpatterns = [
    path('matches/', views.matches, name='matches'),
    path('predictions/', PredictionsView.as_view(), name='predictions'), 
    path('predictions/<str:username>/', PredictionsView.as_view(), name='user_predictions'),  
    path('leaderboard/', views.leaderboard, name='leaderboard'),
]
