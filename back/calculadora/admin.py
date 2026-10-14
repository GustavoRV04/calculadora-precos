from django.contrib import admin
from .models import Item, Prato, PratoItem, Produto, Restaurante

admin.site.register(Restaurante)
admin.site.register(Produto)
admin.site.register(Item)
admin.site.register(Prato)
admin.site.register(PratoItem)
