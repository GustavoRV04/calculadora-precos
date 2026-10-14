# Executar o back localmente

Abra um terminal na raiz do projeto e execute os comandos abaixo. O ambiente virtual e o banco SQLite serão criados dentro de `back`.

```powershell
cd back
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

O servidor fica disponível em `http://localhost:8000`. Mantenha esse terminal aberto.

## API

A base da API REST é `http://localhost:8000/api/v1`. As rotas não usam barra no final.

- `POST /restaurantes`: cria um comércio. Envie `nome`, `email` e `senha` (mínimo de 8 caracteres); a resposta contém `token` e `restaurante`.
- `POST /login`: inicia sessão com `email` e `senha`; devolve `token` e `restaurante`.
- `GET/POST /produtos`: consulta ou cadastra insumos do comércio autenticado.
- `GET/POST /itens`: consulta ou registra compras; envie `produto_id`, `preco_custo`, `quantidade_compra` e `unidade_medida`.
- `GET/POST /pratos`: consulta ou cadastra pratos do comércio autenticado.
- `GET/POST /prato-itens`: consulta ou associa um item a um prato; envie `prato_id`, `item_id` e `quantidade`.

Após cadastro/login, envie `Authorization: Token <token>` nas chamadas de produtos, itens, pratos e associações. O servidor identifica o comércio pelo token e impede acesso ou associação a registros de outro comércio.

O SQLite é usado por padrão e não requer configuração adicional. `python manage.py migrate` deve ser executado após atualizar o projeto ou clonar o repositório pela primeira vez.
