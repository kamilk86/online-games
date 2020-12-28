from django.shortcuts import render


# Create your views here.
def home_page(request):
    return render(request, 'games/home.html')

def about_page(request):
    return render(request, 'games/about.html')

def register_page(request):
    return render(request, 'games/register.html')

def battleship_lobby_page(request):
    return render(request, 'games/battleship_lobby.html')

def battleship_game_page(request, room_name):
    return render(request, 'games/battleship.html')

def escape_game_page(request):
    return render(request, 'games/escape.html')

def caterpillar_game_page(request):
    return render(request, 'games/caterpillar.html')

