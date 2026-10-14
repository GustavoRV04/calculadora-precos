from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from .models import Item, Prato, PratoItem, Produto, Restaurante


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
        fields = ["id", "nome"]

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ["id", "nome", "restaurante_id"]
        read_only_fields = ["restaurante_id"]

class ItemSerializer(serializers.ModelSerializer):
    produto = ProdutoSerializer(read_only=True)
    produto_id = serializers.PrimaryKeyRelatedField(
        source='produto',
        queryset=Produto.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = Item
        fields = [
            "id",
            "produto",
            "produto_id",
            "preco_custo",
            "unidade_medida",
            "quantidade_compra",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            fields["produto_id"].queryset = Produto.objects.filter(
                restaurante__usuario=request.user
            )
        return fields

class PratoItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        source='item',
        queryset=Item.objects.all(),
        write_only=True
    )
    prato = serializers.PrimaryKeyRelatedField(read_only=True)
    prato_id = serializers.PrimaryKeyRelatedField(
        source='prato',
        queryset=Prato.objects.all(),
        write_only=True
    )

    class Meta:
        model = PratoItem
        fields = ["id", "prato", "prato_id", "item", "item_id", "quantidade"]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            fields["prato_id"].queryset = Prato.objects.filter(
                restaurante__usuario=request.user
            )
            fields["item_id"].queryset = Item.objects.filter(
                produto__restaurante__usuario=request.user
            )
        return fields

class PratoSerializer(serializers.ModelSerializer):
    prato_itens = PratoItemSerializer(
        source='pratoitem_set',
        many=True,
        read_only=True
    )
    class Meta:
        model = Prato
        fields = ["id", "nome", "restaurante_id", "prato_itens"]
        read_only_fields = ["restaurante_id", "prato_itens"]
