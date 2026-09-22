# Executar o json server

Primeiro, nessa pasta, é necessário instalar os pacotes

```
npm install
```

Agora, para rodar o backend json-server, execute:
```
npx json-server db.json
```

tem 4 endpoints

http://localhost:3000/produtos
http://localhost:3000/itens
http://localhost:3000/pratos
http://localhost:3000/pratoItens

Todos da para fazer um GET, um PUT, um DELETE (por id), e um POST

O formato do retorno do GET, ou do payload do PUT ou POST é igual ao objeto dentro do arquivo `db.json`