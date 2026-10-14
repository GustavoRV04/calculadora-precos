# Executar o front-end localmente

Em um segundo terminal, abra a pasta `front`, instale as dependências e inicie o Vite:

```powershell
cd front
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`. Deixe o terminal do front aberto. A API Django deve estar rodando em outro terminal; siga [`../back/documentation.md`](../back/documentation.md).

## Comércio e dados

Na primeira abertura, crie um comércio com nome, e-mail e senha de pelo menos 8 caracteres. Nas próximas visitas, entre com o mesmo e-mail e senha. Produtos, compras e pratos ficam isolados por comércio.

Por padrão, o front usa `http://localhost:8000/api/v1`. Para apontar para outra API, crie `front/.env` com:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Reinicie o Vite depois de alterar essa variável. Em desenvolvimento, o Django permite as origens `localhost:5173` e `127.0.0.1:5173`; se o Vite subir em outra porta, atualize `CORS_ALLOWED_ORIGINS` em `back/setup/settings.py`.