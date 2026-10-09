from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets

from .models import Item, Prato, PratoItem, Produto, Produto
from .serializers import ItemSerializer, PratoItemSerializer, PratoSerializer, ProdutoSerializer


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    # filter_backends = [DjangoFilterBackend]
    # filter_backends = [filters.SearchFilter]
    # filterset_fields = ['nome', 'descricao','categorias']
    # search_fields = ['nome', 'descricao','categorias']


class PratoViewSet(viewsets.ModelViewSet):
    queryset = Prato.objects.all().prefetch_related('pratoitem_set__item__produto')
    serializer_class = PratoSerializer


class PratoItemViewSet(viewsets.ModelViewSet):
    queryset = PratoItem.objects.all()
    serializer_class = PratoItemSerializer