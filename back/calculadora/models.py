from django.db import models

# Create your models here.
class Produto(models.Model):
    nome = models.CharField(max_length=100)

class Item(models.Model):
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name="itens",
    )
    preco_custo = models.DecimalField(max_digits=10, decimal_places=2)
    unidade_medida = models.CharField(max_length=20) # Ex: gramas, ml, unidade
    quantidade_compra = models.DecimalField(max_digits=10, decimal_places=3, help_text="Quantidade comprada do prato")

    def __str__(self):
        return self.nome

class Prato(models.Model):
    nome = models.CharField(max_length=100)
    # margem_lucro_percentual = models.DecimalField(max_digits=5, decimal_places=2) # Ex: 30.00 para 30%
    itens = models.ManyToManyField(Item, through='PratoItem')
    
    def __str__(self):
        return self.nome

class PratoItem(models.Model):
    prato = models.ForeignKey(Prato, on_delete=models.PROTECT)
    item = models.ForeignKey(Item, on_delete=models.PROTECT)
    quantidade = models.DecimalField(max_digits=10, decimal_places=3, help_text="Quantidade usada na receita")

    def __str__(self):
        return f"{self.quantidade} {self.item.unidade_medida} de {self.item.nome} em {self.prato.nome}"
