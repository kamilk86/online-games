from django.urls import path, include
from .views import BattleshipGameView, AccountView, LogoutView, RegisterView, CustomLogin
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()

router.register('register', RegisterView, basename='register')
router.register('logout', LogoutView, basename='logout')
router.register('games/battleship', BattleshipGameView, basename='games')
router.register('account', AccountView, basename='account')


urlpatterns = [
    path('', include(router.urls)),
    path('user-auth/', CustomLogin.as_view(), name='user-auth'),
    #path('account/login', ),
    #path('flights/', api_all_user_flights_view, name='all_flights'),

]