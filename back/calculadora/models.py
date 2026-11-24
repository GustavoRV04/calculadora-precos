from django.conf import settings
from django.db import models
from django.db.models import F
from django.db.models.functions import Lower, Trim
from django.utils import timezone

# Create your models here.

class Restaurante(models.Model):
    nome = models.CharField(max_length=100)
    margem_lucro_percentual = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20,
    )
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="restaurante",
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.nome


class Produto(models.Model):
    nome = models.CharField(max_length=100)
    restaurante = models.ForeignKey(
        Restaurante,
        on_delete=models.CASCADE,
        related_name="produtos",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower(Trim("nome")),
                F("restaurante"),
                name="produto_nome_normalizado_restaurante_uniq",
            ),
        ]

class Item(models.Model):
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name="itens",
    )
    preco_custo = models.DecimalField(max_digits=10, decimal_places=2)
    unidade_medida = models.CharField(max_length=20) # Ex: gramas, ml, unidade
    quantidade_compra = models.DecimalField(max_digits=10, decimal_places=3, help_text="Quantidade comprada do prato")
    criado_em = models.DateTimeField(null=True, blank=True, default=timezone.now)

    def __str__(self):
        return self.produto.nome

class Prato(models.Model):
    nome = models.CharField(max_length=100)
    margem_lucro_percentual = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20,
    )
    restaurante = models.ForeignKey(
        Restaurante,
        on_delete=models.CASCADE,
        related_name="pratos",
    )
    # margem_lucro_percentual = models.DecimalField(max_digits=5, decimal_places=2) # Ex: 30.00 para 30%
    produtos = models.ManyToManyField(Produto, through='PratoProduto')

    
    def __str__(self):
        return self.nome

class PratoProduto(models.Model):
    prato = models.ForeignKey(Prato, on_delete=models.PROTECT)
    produto = models.ForeignKey(Produto, on_delete=models.PROTECT)
    quantidade = models.DecimalField(max_digits=10, decimal_places=3, help_text="Quantidade usada na receita")

    def __str__(self):
        ultimo_item = self.produto.itens.order_by(
            F("criado_em").desc(nulls_last=True),
            "-id",
        ).first()
        unidade = f" {ultimo_item.unidade_medida}" if ultimo_item else ""
        return f"{self.quantidade}{unidade} de {self.produto.nome} em {self.prato.nome}"
