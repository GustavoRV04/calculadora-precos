from django.contrib.auth import authenticate
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Item, Prato, PratoItem, Produto, Restaurante
from .serializers import (
    ItemSerializer,
    PratoItemSerializer,
    PratoSerializer,
    ProdutoSerializer,
    RestauranteCadastroSerializer,
    RestauranteSerializer,
)


class CadastroRestauranteView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RestauranteCadastroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        restaurante = serializer.save()
        token, _ = Token.objects.get_or_create(user=restaurante.usuario)
        return Response(
            {
                "token": token.key,
                "restaurante": RestauranteSerializer(restaurante).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginRestauranteView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        senha = request.data.get("senha", "")
        user = authenticate(request, username=email, password=senha)
        restaurante = Restaurante.objects.filter(usuario=user).first() if user else None

        if not restaurante:
            return Response(
                {"detail": "E-mail ou senha inválidos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "restaurante": RestauranteSerializer(restaurante).data,
            }
        )


class RestauranteScopedViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_restaurante(self):
        restaurante = Restaurante.objects.filter(usuario=self.request.user).first()
        if not restaurante:
            raise PermissionDenied("Esta conta não possui um comércio associado.")
        return restaurante


class ProdutoViewSet(RestauranteScopedViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer

    def get_queryset(self):
        return Produto.objects.filter(restaurante=self.get_restaurante())

    def perform_create(self, serializer):
        serializer.save(restaurante=self.get_restaurante())


class ItemViewSet(RestauranteScopedViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def get_queryset(self):
        return Item.objects.filter(produto__restaurante=self.get_restaurante())


class PratoViewSet(RestauranteScopedViewSet):
    queryset = Prato.objects.all().prefetch_related("pratoitem_set__item__produto")
    serializer_class = PratoSerializer

    def get_queryset(self):
        return Prato.objects.filter(restaurante=self.get_restaurante()).prefetch_related(
            "pratoitem_set__item__produto"
        )

    def perform_create(self, serializer):
        serializer.save(restaurante=self.get_restaurante())


class PratoItemViewSet(RestauranteScopedViewSet):
    queryset = PratoItem.objects.all()
    serializer_class = PratoItemSerializer

    def get_queryset(self):
        return PratoItem.objects.filter(prato__restaurante=self.get_restaurante())