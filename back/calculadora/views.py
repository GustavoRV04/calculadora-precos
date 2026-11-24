from django.contrib.auth import authenticate
from django.db import IntegrityError, transaction
from django.db.models import F, OuterRef, Prefetch, Subquery
from django.db.models.functions import Lower, Trim
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Item, Prato, PratoProduto, Produto, Restaurante
from .serializers import (
    ItemSerializer,
    MargemLucroGeralSerializer,
    PratoProdutoSerializer,
    PratoSerializer,
    ProdutoSerializer,
    RestauranteCadastroSerializer,
    RestauranteSerializer,
)

def ultimo_item_queryset():
    return Item.objects.order_by(
        F("criado_em").desc(nulls_last=True),
        "-id",
    )[:1]

def produto_com_ultimo_item():
    return Produto.objects.prefetch_related(
        Prefetch(
            "itens",
            queryset=ultimo_item_queryset(),
            to_attr="ultimo_item_lista",
        )
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
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_restaurante(self):
        restaurante = Restaurante.objects.filter(
            usuario=self.request.user,
        ).first()
        if not restaurante:
            raise PermissionDenied("Esta conta não possui um comércio associado.")
        return restaurante

class ItemViewSet(RestauranteScopedViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    search_fields = ["quantidade_compra", "preco_custo", "unidade_medida"]
    filterset_fields = ["produto_id"]

    def get_queryset(self):
        queryset = self.queryset.filter(
            produto__restaurante=self.get_restaurante(),
        )
        if self.request.query_params.get("atuais") == "true":
            item_mais_recente = Item.objects.filter(
                produto_id=OuterRef("produto_id"),
            ).order_by(
                F("criado_em").desc(nulls_last=True),
                "-id",
            ).values("id")[:1]
            queryset = queryset.filter(pk=Subquery(item_mais_recente))
        return queryset.order_by(
            F("criado_em").desc(nulls_last=True),
            "-id",
        )

class ProdutoViewSet(RestauranteScopedViewSet):
    queryset = produto_com_ultimo_item()
    serializer_class = ProdutoSerializer

    search_fields = ["nome"]

    def get_queryset(self):
        return self.queryset.filter(restaurante=self.get_restaurante())

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        nome = serializer.validated_data["nome"]
        restaurante = self.get_restaurante()

        with transaction.atomic():
            restaurante = Restaurante.objects.select_for_update().get(pk=restaurante.pk)
            produto_existente = self._produto_por_nome(restaurante, nome)
            if produto_existente:
                return Response(
                    self.get_serializer(produto_existente).data,
                    status=status.HTTP_200_OK,
                )

            try:
                with transaction.atomic():
                    produto = serializer.save(restaurante=restaurante)
            except IntegrityError:
                produto = self._produto_por_nome(restaurante, nome)
                if produto is None:
                    raise
                return Response(
                    self.get_serializer(produto).data,
                    status=status.HTTP_200_OK,
                )

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    @staticmethod
    def _produto_por_nome(restaurante, nome):
        return Produto.objects.annotate(
            nome_normalizado=Lower(Trim("nome")),
        ).filter(
            restaurante=restaurante,
            nome_normalizado=nome.strip().lower(),
        ).first()

    def perform_create(self, serializer):
        serializer.save(restaurante=self.get_restaurante())


class PratoViewSet(RestauranteScopedViewSet):
    queryset = Prato.objects.all()
    serializer_class = PratoSerializer

    # pesquisa exata
    # filterset_fields = ["nome"]
    # pesquisa parcial '%teste%'
    search_fields = ["nome"]

    def get_queryset(self):
        return Prato.objects.filter(restaurante=self.get_restaurante()).prefetch_related(
            Prefetch(
                "pratoproduto_set__produto",
                queryset=produto_com_ultimo_item(),
            )
        )

    def perform_create(self, serializer):
        restaurante = self.get_restaurante()
        serializer.save(
            restaurante=restaurante,
            margem_lucro_percentual=restaurante.margem_lucro_percentual,
        )


class PratoProdutoViewSet(RestauranteScopedViewSet):
    queryset = PratoProduto.objects.all()
    serializer_class = PratoProdutoSerializer

    def get_queryset(self):
        return PratoProduto.objects.filter(prato__restaurante=self.get_restaurante()) \
            .select_related("produto") \
            .prefetch_related(
                Prefetch( 
                    "produto__itens",
                    queryset=ultimo_item_queryset(),
                    to_attr="ultimo_item_lista",
                )
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance = serializer.save()

        instance = self.get_queryset().get(pk=instance.pk)

        response_serializer = self.get_serializer(instance)

        headers = self.get_success_headers(response_serializer.data)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )