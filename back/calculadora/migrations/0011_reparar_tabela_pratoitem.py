from django.db import migrations


def reparar_tabela_pratoitem(apps, schema_editor):
    PratoItem = apps.get_model("calculadora", "PratoItem")
    connection = schema_editor.connection
    table_name = PratoItem._meta.db_table
    legacy_table_name = "calculadora_produtoingrediente"
    existing_tables = set(connection.introspection.table_names())

    if table_name in existing_tables:
        return

    if legacy_table_name in existing_tables:
        schema_editor.alter_db_table(
            PratoItem,
            legacy_table_name,
            table_name,
        )
        return

    schema_editor.create_model(PratoItem)


class Migration(migrations.Migration):

    dependencies = [
        ("calculadora", "0010_unificar_produtos_e_historico_compras"),
    ]

    operations = [
        migrations.RunPython(
            reparar_tabela_pratoitem,
            migrations.RunPython.noop,
        ),
    ]
