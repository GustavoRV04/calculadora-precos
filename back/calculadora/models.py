from django.db import models

# Create your models here.
class Insumo(models.Model):
    nome = models.CharField(max_length=100)
    preco_custo = models.DecimalField(max_digits=10, decimal_places=2)
    unidade_medida = models.CharField(max_length=20) # Ex: gramas, ml, unidade

    def __str__(self):
        return self.nome

class Produto(models.Model):
    nome = models.CharField(max_length=100)
    margem_lucro_percentual = models.DecimalField(max_digits=5, decimal_places=2) # Ex: 30.00 para 30%
    
    def __str__(self):
        return self.nome