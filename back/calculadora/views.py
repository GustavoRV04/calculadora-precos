from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Item, Prato, PratoItem, Produto, Restaurante
from .serializers import (
    ItemSerializer,
    MargemLucroGeralSerializer,
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


class MargemLucroGeralView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_restaurante(self):
        restaurante = Restaurante.objects.filter(usuario=self.request.user).first()
        if not restaurante:
            raise PermissionDenied("Esta conta não possui um comércio associado.")
        return restaurante

    def get(self, request):
        restaurante = self.get_restaurante()
        return Response(MargemLucroGeralSerializer(restaurante).data)

    def patch(self, request):
        restaurante = self.get_restaurante()
        serializer = MargemLucroGeralSerializer(
            restaurante,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            serializer.save()
            pratos_atualizados = Prato.objects.filter(
                restaurante=restaurante,
            ).update(
                margem_lucro_percentual=restaurante.margem_lucro_percentual,
            )

        return Response({
            **serializer.data,
            "pratos_atualizados": pratos_atualizados,
        })


class RestauranteScopedViewSet(viewsets.ModelViewSet):
    #authentication_classes = [TokenAuthentication]
    #permission_classes = [IsAuthenticated]

    def get_restaurante(self):
        if self.request.user.is_authenticated:
            restaurante = Restaurante.objects.filter(
                usuario=self.request.user,
            ).first()
        else:
            restaurante = Restaurante.objects.first()
        if not restaurante:
            raise PermissionDenied("Esta conta não possui um comércio associado.")
        return restaurante


class ProdutoViewSet(RestauranteScopedViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer

    search_fields = ["nome"]

    def get_queryset(self):
        return Produto.objects.filter(restaurante=self.get_restaurante())

    def perform_create(self, serializer):
        serializer.save(restaurante=self.get_restaurante())


class ItemViewSet(RestauranteScopedViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    search_fields = ["produto__nome"]

    def get_queryset(self):
        return Item.objects.filter(produto__restaurante=self.get_restaurante())


class PratoViewSet(RestauranteScopedViewSet):
    queryset = Prato.objects.all().prefetch_related("pratoitem_set__item__produto")
    serializer_class = PratoSerializer

    # pesquisa exata
    # filterset_fields = ["nome"]
    # pesquisa parcial '%teste%'
    search_fields = ["nome"]

    def get_queryset(self):
        return Prato.objects.filter(restaurante=self.get_restaurante()).prefetch_related(
            "pratoitem_set__item__produto"
        )

    def perform_create(self, serializer):
        restaurante = self.get_restaurante()
        serializer.save(
            restaurante=restaurante,
            margem_lucro_percentual=restaurante.margem_lucro_percentual,
        )


class PratoItemViewSet(RestauranteScopedViewSet):
    queryset = PratoItem.objects.all()
    serializer_class = PratoItemSerializer

    def get_queryset(self):
        return PratoItem.objects.filter(prato__restaurante=self.get_restaurante())