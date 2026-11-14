from django.db import migrations, models
from django.db.models import F
from django.db.models.functions import Lower, Trim
from django.utils import timezone


def unificar_produtos_duplicados(apps, schema_editor):
    Produto = apps.get_model("calculadora", "Produto")
    Item = apps.get_model("calculadora", "Item")
    banco = schema_editor.connection.alias

    produtos_por_nome = {}
    produtos = Produto.objects.using(banco).order_by("id")
    for produto in produtos.iterator():
        nome_normalizado = produto.nome.strip().lower()
        chave = (produto.restaurante_id, nome_normalizado)
        produto_principal_id = produtos_por_nome.get(chave)

        if produto_principal_id is None:
            produtos_por_nome[chave] = produto.id
            nome_limpo = produto.nome.strip()
            if produto.nome != nome_limpo:
                Produto.objects.using(banco).filter(pk=produto.pk).update(
                    nome=nome_limpo,
                )
            continue

        Item.objects.using(banco).filter(produto_id=produto.id).update(
            produto_id=produto_principal_id,
        )
        Produto.objects.using(banco).filter(pk=produto.id).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("calculadora", "0009_restaurante_margem_lucro_percentual"),
    ]

    operations = [
        migrations.RunPython(
            unificar_produtos_duplicados,
            migrations.RunPython.noop,
        ),
        migrations.AddField(
            model_name="item",
            name="criado_em",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="item",
            name="criado_em",
            field=models.DateTimeField(blank=True, default=timezone.now, null=True),
        ),
        migrations.AddConstraint(
            model_name="produto",
            constraint=models.UniqueConstraint(
                Lower(Trim("nome")),
                F("restaurante"),
                name="produto_nome_normalizado_restaurante_uniq",
            ),
        ),
    ]
