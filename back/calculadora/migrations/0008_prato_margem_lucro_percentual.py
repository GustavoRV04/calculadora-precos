from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("calculadora", "0007_restaurant_scoping"),
    ]

    operations = [
        migrations.AddField(
            model_name="prato",
            name="margem_lucro_percentual",
            field=models.DecimalField(decimal_places=2, default=20, max_digits=5),
        ),
    ]
