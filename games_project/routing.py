from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator, OriginValidator
from django.urls import path

from games.consumers import LobbyConsumer, ChatConsumer, BattleshipGameConsumer


application = ProtocolTypeRouter({
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                [
                    path("games/<str:game_name>/lobby/", LobbyConsumer),
                    path("games/<str:game_name>/game/<str:chat_room_name>/", ChatConsumer),
                    path("games/battleship/game/<str:game_room_name>/comms/", BattleshipGameConsumer),
                    
                ]
            )
        )
    )
})