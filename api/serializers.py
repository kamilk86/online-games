from rest_framework import serializers
from .models import CustomUser, BattleshipGame


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password']

    def create(self, validated_data):
        user = CustomUser()
        password = validated_data.get('password')
        user.username = validated_data.get('username')
        user.set_password(password)
        user.save()

        return user

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        password = validated_data.get('password', instance.password)
        instance.set_password(password)
        instance.save()

        return instance



class BattleshipGameSerializer(serializers.ModelSerializer):

    class Meta:
        model = BattleshipGame
        fields = ['game_name', 'player_2', 'player_1_ready', 'player_2_ready', 'turn', 'player_1_board_state', 'player_1_ships', 'player_2_board_state', 'player_2_ships' ]

    def create(self, validated_data):
        user = self.context['request'].user
        # copy here in order to reduce sent data, by not sending fields that are the same at the start
        validated_data['player_2_board_state'] = validated_data['player_1_board_state']
        validated_data['player_2_ships'] = validated_data['player_1_ships']
        
        return BattleshipGame.objects.create(player_1=user, **validated_data)