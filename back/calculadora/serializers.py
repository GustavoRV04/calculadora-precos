from django.contrib.auth.models import User, Group, Permission
from rest_framework import serializers
from .models import Item, Prato, PratoItem, Produto

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    produto = ProdutoSerializer(read_only=True)
    produto_id = serializers.PrimaryKeyRelatedField(
        source='produto',
        queryset=Produto.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = Item
        fields = '__all__'

class PratoItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        source='item',
        queryset=Item.objects.all(),
        write_only=True
    )

    class Meta:
        model = PratoItem
        fields = '__all__'

class PratoSerializer(serializers.ModelSerializer):
    prato_itens = PratoItemSerializer(
        source='pratoitem_set',
        many=True,
        read_only=True
    )
    class Meta:
        model = Prato
        fields = '__all__'
