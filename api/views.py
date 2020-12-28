from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404


from .models import CustomUser, BattleshipGame # Account
from .serializers import UserSerializer, BattleshipGameSerializer

class CustomLogin(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        """
        resp = Response()
        resp.set_cookie("token", token.key)
        resp.set_cookie("user", user.username)
        return resp
        """
        return Response({
            "username": user.username,
            "token": token.key
        })


class RegisterView(viewsets.ViewSet):

    permission_classes = [AllowAny,]

    def create(self, request):
        
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

        #return Response(status=status.HTTP_400_BAD_REQUEST)
        

class LogoutView(viewsets.ViewSet):

    def list(self, request):
       
        # get only the user details associated with requesting user
        request.user.auth_token.delete()
        """
        resp = Response()
        
        resp.delete_cookie('token')
        resp.delete_cookie('user')
        
        return resp
        """
        return Response(status=status.HTTP_200_OK)


class AccountView(viewsets.ViewSet):

    def list(self, request):
    
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
  

    def update(self, request, pk=None):
        # update user details
        user = CustomUser.objects.get(pk=pk)
        serializer = UserSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
        

    def destroy(self, request, pk=None):
        try:
            CustomUser.objects.get(pk=pk).delete() # request.user.id
            return Response(status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)



class BattleshipGameView(viewsets.ViewSet):

    def retrieve(self, request , pk=None):
        try:
            game = BattleshipGame.objects.get(pk=pk)

        except BattleshipGame.DoesNotExist:

            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = BattleshipGameSerializer(game)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request):
        #print("REQ DATA: ", request.data)
        serializer = BattleshipGameSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)