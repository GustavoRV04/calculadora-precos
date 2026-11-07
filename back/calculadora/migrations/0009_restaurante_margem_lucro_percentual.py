from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("calculadora", "0008_prato_margem_lucro_percentual"),
    ]

    operations = [
        migrations.AddField(
            model_name="restaurante",
            name="margem_lucro_percentual",
            field=models.DecimalField(decimal_places=2, default=20, max_digits=5),
        ),
    ]
