from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator

# Create your models here.
class CustomUser(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    #email = models.EmailField(('email address'), unique=True)

    #USERNAME_FIELD = 'email'
    #REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username}"

class BattleshipGame(models.Model):
    
    game_name = models.CharField(max_length=100, unique=True, primary_key=True) # player_1 + player_2 username
    player_1 = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    player_2 = models.CharField(max_length=100)
    player_1_ready = models.BooleanField(default=False)
    player_2_ready = models.BooleanField(default=False)
    turn = models.PositiveIntegerField(validators=[MaxValueValidator(1)])#models.CharField(max_length=1) # 0 for player_1 1 for player_2
    player_1_board_state = models.TextField() 
    player_1_ships = models.TextField() 
    player_2_board_state = models.TextField() 
    player_2_ships = models.TextField() 

    def __str__(self):
        return f"Battleship game name: {self.game_name}"

