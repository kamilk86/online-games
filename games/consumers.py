# import asyncio
import json
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import CustomUser, BattleshipGame
from rest_framework.authtoken.models import Token

users_in_lobby = {
    'lobby_battleship': []
}
 
class LobbyConsumer(AsyncWebsocketConsumer):
        #self.commands = {
         #   'game_request': 
        #}
    async def connect(self):

        self.game_name = self.scope['url_route']['kwargs']['game_name']
        self.lobby_room_name = 'lobby_%s' % self.game_name

        await self.accept()

    async def receive(self, text_data):

        @database_sync_to_async
        def get_user_by_token(token):
            try:
                user_id = Token.objects.get(key=token).user_id
                user = CustomUser.objects.get(id=user_id)
            except:
                return False
            return user

        async def add_user(user_name):
            if user_name not in users_in_lobby[self.lobby_room_name]:
                users_in_lobby[self.lobby_room_name].append(
                    user_name)

                await self.channel_layer.group_send(
                    self.lobby_room_name,
                    {
                        "type": "send_users",
                        "users": users_in_lobby[self.lobby_room_name],
                    }
                )

        if self.scope['user'].id and not self.scope['user'].username == 'admin':

            data = json.loads(text_data)
         
            if 'game_req' in data.keys():
             
                opponent_private_room = 'private_%s' % data['game_req']['recipient']
                print(opponent_private_room)
                await self.channel_layer.group_add(
                    opponent_private_room,
                    self.channel_name
                )
                await self.channel_layer.group_send(
                    opponent_private_room,
                    {
                        "type": "send_game_request",
                        "user": self.scope['user'].username,
                        "recipient_lobby_id": data['game_req']['recipient_lobby_id'],
                        "current_channel_name": self.channel_name
                    }
                )
            if 'req_refused' in data.keys():
                opponent_private_room = 'private_%s' % str(
                    data['req_refused']['recipient'])

                await self.channel_layer.group_send(
                    opponent_private_room,
                    {
                        "type": "send_request_refused",
                        "user": self.scope['user'].username,
                        "user_lobby_id": data['req_refused']['sender_lobby_id'],
                        "current_channel_name": self.channel_name
                    }
                )
                await self.channel_layer.group_discard(
                    opponent_private_room,
                    self.channel_name
                )

            if 'req_accepted' in data.keys():
                print("REQ ACCEPTED DATA: ", data)
                print("USER RECEIVING ", self.scope['user'].username)
                opponent_private_room = 'private_%s' % data['req_accepted']['recipient']
                await self.channel_layer.group_send(
                    opponent_private_room,
                    {
                        "type": "send_request_accepted",
                        "user": self.scope['user'].username,
                        "recipient": data['req_accepted']['recipient'],
                        "current_channel_name": self.channel_name
                    }
                )

                await self.channel_layer.group_discard(
                    opponent_private_room,
                    self.channel_name
                )


            # User is authenticated. Add to group
            await add_user(self.scope['user'].username)

        else:
            #  User is not authenticated yet.
            try:

                data = json.loads(text_data)

                if 'games_user_token' in data.keys():

                    token = data['games_user_token']

                    user = await get_user_by_token(token)

                    if user:

                        self.scope['user'] = user
                        self.private_room_name = 'private_%s' % str(
                            self.scope['user'].username)

                        await self.channel_layer.group_add(
                            self.lobby_room_name,
                            self.channel_name
                        )
                        # Creates a private room for the user so that game request can be sent from individual users
                        print('CREATING PRIVATE ROOM. ROOM NAME: ',
                              self.private_room_name)
                        await self.channel_layer.group_add(
                            self.private_room_name,
                            self.channel_name
                        )
                        await add_user(self.scope['user'].username)
               
            except Exception as e:
                # Data is not valid, so close it.
                print("ERROR ", e)
                pass

        if not self.scope['user'].id:
            await self.close()

    async def disconnect(self, close_code):

        async def remove_user(user_name):
            if user_name in users_in_lobby[self.lobby_room_name]:
                users_in_lobby[self.lobby_room_name].remove(
                    user_name)

                await self.channel_layer.group_send(
                    self.lobby_room_name,
                    {
                        "type": "send_users",
                        "users": users_in_lobby[self.lobby_room_name],
                    }
                )
        print("*****REMOVING USER AND CHANNEL ")
        await self.channel_layer.group_discard(
            self.lobby_room_name,
            self.channel_name
        )
        await remove_user(self.scope['user'].username)



    async def send_users(self, event):
        #print(users_in_lobby)
        await self.send(text_data=json.dumps({
            "users": event["users"],
        }))

    async def send_game_request(self, event):

        if self.channel_name != event['current_channel_name']:
            await self.send(text_data=json.dumps({
                "game_req": {
                    "sender": event["user"],
                    "recipient_lobby_id": event['recipient_lobby_id']
            }}))

    async def send_request_accepted(self, event):

        if self.channel_name != event['current_channel_name']:
            await self.send(text_data=json.dumps({
                "req_accepted": {
                    "sender": event['user'],
                    "recipient": event['recipient']
            }}))

    async def send_request_refused(self, event):

        if self.channel_name != event['current_channel_name']:
            await self.send(text_data=json.dumps({
                "request_refused": {
                    "sender": event["user"],
                    "sender_lobby_id": event["user_lobby_id"]
            }}))


class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.chat_room_name = f"chat_{self.scope['url_route']['kwargs']['chat_room_name']}"
        await self.accept()

    async def receive(self, text_data):

        @database_sync_to_async
        def get_user_by_token(token):
            try:
                user_id = Token.objects.get(key=token).user_id
                user = CustomUser.objects.get(id=user_id)
            except:
                return False
            return user

        data = json.loads(text_data)
        print("chat receiving data: ", data)

        if self.scope['user'].id and not self.scope['user'].username == 'admin':
            

            if 'chat_message' in data.keys():
                print("CHAT MESSAGE: ", data)
                # send message
                await self.channel_layer.group_send(
                    self.chat_room_name,
                    {
                        "type": "send_chat_message",
                        "user": self.scope['user'].username,
                        "chat_message": data['chat_message']
                    }
                )
      
        else:
            # User not authenticated. Authenticate
            try:
                data = json.loads(text_data)

                if 'games_user_token' in data.keys():

                    token = data['games_user_token']

                    user = await get_user_by_token(token)

                    if user:
                        self.scope['user'] = user
                    
                        await self.channel_layer.group_add(
                            self.chat_room_name,
                            self.channel_name
                        )
                        """
                        if self.scope['user'].username not in users_in_chat[self.chat_room_name]:
                            users_in_chat[self.chat_room_name].append(
                                self.scope['user'].username) """

                        await self.channel_layer.group_send(
                            self.chat_room_name,
                            {
                                "type": "send_user_online",
                                "user": self.scope['user'].username,
                                "sender_channel_name": self.channel_name
                            }
                        )

            except Exception as e:
                # Data is not valid, so close it.
                print("ERROR ", e)
                pass

            
        if not self.scope['user'].id:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.chat_room_name,
            self.channel_name
        )

        await self.channel_layer.group_send(
            self.chat_room_name,
                {
                    "type": "send_user_offline",
                    "user": self.scope['user'].username,
                }
            )
        print("CHAT SOCKET Disconnected")

    async def send_user_online(self, event):

        if self.channel_name != event['sender_channel_name']:
            await self.send(text_data=json.dumps({
                "user_online": event["user"],
            }))

    async def send_user_offline(self, event):

        await self.send(text_data=json.dumps({
            "user_offline": event["user"],
         }))

    async def send_chat_message(self, event):

        # Sending to both other user and myself. If I received my msg then the other user received too
        await self.send(text_data=json.dumps({
            "from_user": event["user"],
            "chat_message": event["chat_message"]
        }))


class BattleshipGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
    
        self.game_room_name = f"battleship-{self.scope['url_route']['kwargs']['game_room_name']}"
        self.game_name = self.scope['url_route']['kwargs']['game_room_name']
        player_1, player_2 = self.game_name.split("-")
        self.players = {player_1: "player_1",
                        player_2: "player_2"}
        await self.accept()

    async def receive(self, text_data):

        @database_sync_to_async
        def update_game_state(field_name, val):
            
            try:
                game = BattleshipGame.objects.get(pk=self.game_name)

            except BattleshipGame.DoesNotExist:  
                print("Exception triggered!!!!!!")
                return False
        
            setattr(game, field_name, val)
            game.save()

            return True
            
       
        @database_sync_to_async
        def mark_board_key(key, user_name):
           
            field_name = self.players[user_name] + "_board_state"

            try:
                game = BattleshipGame.objects.get(pk=self.game_name)
                
            except BattleshipGame.DoesNotExist:

                return False

            old_state = getattr(game, field_name)
            temp = json.loads(old_state)
          
            if temp[key]['is_taken']:
                temp[key]['is_hit'] = True
            else:
                temp[key]['is_miss'] = True

            new_state = json.dumps(temp)

            setattr(game, field_name, new_state)
            game.save()

            return True

        @database_sync_to_async
        def get_user_by_token(token):
            try:
                user_id = Token.objects.get(key=token).user_id
                user = CustomUser.objects.get(id=user_id)
            except:
                return False
            return user

        data = json.loads(text_data)

        if self.scope['user'].id and not self.scope['user'].username == 'admin':
            
            if data['msg_type'] == 'ready':
                print("READY TRIGGERED. get player num by name: ",self.scope['user'].username, self.players[self.scope['user'].username])
                if await update_game_state(self.players[self.scope['user'].username] + "_board_state", data['board_state']) == True:
                    await update_game_state(self.players[self.scope['user'].username] + "_ready", True)
                    await update_game_state(self.players[self.scope['user'].username] + "_ships", data['ships'])   
                    await self.channel_layer.group_send(
                        self.game_room_name,
                            {
                                "type": "send_ready_message",
                                "user": self.scope['user'].username,
                                "ships": data['ships'],
                                "board_state": data['board_state'],
                                "sender_channel_name": self.channel_name
                            }
                        )
                
            elif data['msg_type'] == 'shot':
                print(data)
                await mark_board_key(data['key'], data['opponent'])

                await self.channel_layer.group_send(
                    self.game_room_name,
                        {
                            "type": "send_shot_message",
                            "user": self.scope['user'].username,
                            "key": data['key']
                        }
                )
                

        else:
            # User not authenticated. Authenticate
            try:
                data = json.loads(text_data)

                if 'games_user_token' in data.keys():

                    token = data['games_user_token']

                    user = await get_user_by_token(token)

                    if user:
                        self.scope['user'] = user
                    
                        await self.channel_layer.group_add(
                            self.game_room_name,
                            self.channel_name
                        )
            except Exception as e:
                # Data is not valid, so close it.
                print("ERROR ", e)
                pass

            
        if not self.scope['user'].id:
            await self.close()

    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.game_room_name,
            self.channel_name
        )

    async def send_ready_message(self, event):
        print("SENDING READY MESSEAGE")
        if self.channel_name != event['sender_channel_name']:
            await self.send(text_data=json.dumps({
                "msg_type": "ready",
                "user": event["user"],
                "board_state": event['board_state'],
                "ships": event['ships']
            }))

    async def send_shot_message(self, event):
        # send to both myself and opponent to make sure I send correctly
        await self.send(text_data=json.dumps({
            "msg_type": "shot",
            "user": event["user"],
            "key": event["key"]
        }))
      

