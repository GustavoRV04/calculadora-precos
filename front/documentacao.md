# Executar o json server

É importante ver que o json server e o react estão atualmente dentro da pasta "front"

para acessar a pasta no termianal:
''
cd calculadora-precos-main/front
``

Primeiro, nessa pasta, é necessário instalar os pacotes

```
npm install
```
para rodar:
'''
npm run / npm run dev
'''

se um erro ocorrer ao tentar rodar o comando acima tente instalar as dependencias com este comando:

npm install -D @rolldown/binding-win32-x64-msvc
'''

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