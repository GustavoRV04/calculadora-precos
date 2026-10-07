from django.contrib.auth.models import User, Group, Permission
from rest_framework import serializers
from .models import Item, Prato, PratoItem, Produto

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

class PratoSerializer(serializers.ModelSerializer):
    itens = ItemSerializer(many=True, read_only=True)
    class Meta:
        model = Prato
        fields = '__all__'

class PratoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PratoItem
        fields = '__all__'