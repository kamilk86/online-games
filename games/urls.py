from django.urls import path
from . import views


urlpatterns = [
    path('', views.home_page, name='home'),
    path('about/', views.about_page, name='about'),
    path('register/', views.register_page, name='register'),
    path('games/battleship/lobby/', views.battleship_lobby_page, name='battleship_lobby'),
    path('games/battleship/game/<str:room_name>/', views.battleship_game_page, name='battleship_game'),
    path('games/escape/', views.escape_game_page, name='escape_game'),
    path('games/caterpillar/', views.caterpillar_game_page, name='caterpillar_game'),
]