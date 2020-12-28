from django.contrib import admin

# Register your models here.
from .models import CustomUser, BattleshipGame
app_models = [CustomUser, BattleshipGame]
admin.site.register(app_models)