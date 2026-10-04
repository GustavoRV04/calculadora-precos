# Executar o back pela primeira vez

1. Criar o ambiente virtual
   python -m venv venv

2. Ativar o isolamento
   .\venv\Scripts\activate

3. Instalar dependÊncias
   pip install -r requirements.txt

4. Aplicar as migrations
   python manage.py migrate

5. INicializar o Servidor
   python manage.py runserver
