# Executar o back pela primeira vez

1. Criar o ambiente virtual
   python -m venv venv

2. Ativar o isolamento
   .\venv\Scripts\activate

3. Instalar dependÊncias
   pip install -r requirements.txt

4. Aplicar as migrations
   python manage.py migrate

5. Inicializar o servidor
   python manage.py runserver

## API

A API REST fica em `http://localhost:8000/api/v1`. Os endpoints são:

- `produtos`
- `itens` (envie `produto_id` para vincular a compra ao produto)
- `pratos`
- `prato-itens` (envie `prato_id`, `item_id` e `quantidade`)

O front-end usa essa URL por padrão. Para apontar para outra instância, defina `VITE_API_URL` antes de iniciar/buildar o Vite.
