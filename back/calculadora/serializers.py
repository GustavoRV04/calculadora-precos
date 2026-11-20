from decimal import Decimal

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import F
from rest_framework import serializers
from .models import Item, Prato, PratoProduto, Produto, Restaurante
class RestauranteCadastroSerializer(serializers.Serializer):
    nome = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return email

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("senha")
        email = validated_data.pop("email")
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
        )
        return Restaurante.objects.create(usuario=user, **validated_data)


class RestauranteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurante
        fields = ["id", "nome", "margem_lucro_percentual"]


class MargemLucroGeralSerializer(serializers.ModelSerializer):
    margem_lucro_percentual = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal("0"),
        max_value=Decimal("99.99"),
    )

    class Meta:
        model = Restaurante
        fields = ["margem_lucro_percentual"]


class ItemSerializer(serializers.ModelSerializer):
    # produto = ProdutoSerializer(read_only=True)
    produto_id = serializers.PrimaryKeyRelatedField(
        source='produto',
        queryset=Produto.objects.all(),
    )
    preco_custo = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )
    unidade_medida = serializers.ChoiceField(choices=["KG", "G", "L", "ML", "UN"])
    quantidade_compra = serializers.DecimalField(
        max_digits=10,
        decimal_places=3,
        min_value=Decimal("0.001"),
    )
    
    class Meta:
        model = Item
        fields = [
            "id",
            # "produto",
            "produto_id",
            "preco_custo",
            "unidade_medida",
            "quantidade_compra",
            "criado_em",
        ]
        read_only_fields = ["criado_em"]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            fields["produto_id"].queryset = Produto.objects.filter(
                restaurante__usuario=request.user
            )
        return fields


class ProdutoSerializer(serializers.ModelSerializer):
    ultimo_item = serializers.SerializerMethodField()

    def get_ultimo_item(self, obj):
        itens = getattr(obj, "ultimo_item_lista", None)
        if itens is None:
            item = obj.itens.order_by(
                F("criado_em").desc(nulls_last=True),
                "-id",
            ).first()
            return (
                ItemSerializer(item, context=self.context).data
                if item
                else None
            )
        if itens:
            return ItemSerializer(itens[0], context=self.context).data
        return None

    def validate_nome(self, value):
        nome = value.strip()
        if not nome:
            raise serializers.ValidationError("Informe o nome do insumo.")
        return nome

    class Meta:
        model = Produto
        fields = ["id", "nome", "restaurante_id", "ultimo_item"]
        read_only_fields = ["restaurante_id"]

class PratoProdutoSerializer(serializers.ModelSerializer):
    # produto = serializers.SerializerMethodField()
    produto = ProdutoSerializer(read_only=True)
    produto_id = serializers.PrimaryKeyRelatedField(
        source='produto',
        queryset=Produto.objects.all(),
        write_only=True
    )
    prato = serializers.PrimaryKeyRelatedField(read_only=True)
    prato_id = serializers.PrimaryKeyRelatedField(
        source='prato',
        queryset=Prato.objects.all(),
        write_only=True
    )
    quantidade = serializers.DecimalField(
        max_digits=10,
        decimal_places=3,
        min_value=Decimal("0.001"),
    )

    class Meta:
        model = PratoProduto
        fields = ["id", "prato", "prato_id", "produto", "produto_id", "quantidade"]

    # def get_produto(self, obj):
    #     produto_id = obj.item.produto_id
    #     itens_atuais = self.context.setdefault("_itens_atuais_por_produto", {})
    #     if produto_id not in itens_atuais:
    #         itens_atuais[produto_id] = (
    #             Item.objects.filter(produto_id=produto_id)
    #             .order_by(F("criado_em").desc(nulls_last=True), "-id")
    #             .first()
    #         )
    #     return ItemSerializer(
    #         itens_atuais[produto_id],
    #         context=self.context,
    #     ).data

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            fields["prato_id"].queryset = Prato.objects.filter(
                restaurante__usuario=request.user
            )
            fields["produto_id"].queryset = Produto.objects.filter(
                restaurante__usuario=request.user
            )
        return fields


class PratoSerializer(serializers.ModelSerializer):
    margem_lucro_percentual = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=0,
        max_value=Decimal("99.99"),
        required=False,
    )
    prato_produtos = PratoProdutoSerializer(
        source='pratoproduto_set',
        many=True,
        read_only=True
    )
    class Meta:
        model = Prato
        fields = ["id", "nome", "restaurante_id", "margem_lucro_percentual", "prato_produtos"]
        read_only_fields = ["restaurante_id", "prato_produtos"]
