# Executar o front-end

Na pasta `front`, instale as dependências e inicie o Vite:

```sh
npm install
npm run dev
```

# Executar a API

Siga as instruções em [`../back/documentation.md`](../back/documentation.md) para iniciar o Django. A API local fica em `http://localhost:8000/api/v1`.

Os endpoints disponíveis são `produtos`, `itens`, `pratos` e `prato-itens`. O front pode apontar para outra API definindo `VITE_API_URL` no ambiente de build.