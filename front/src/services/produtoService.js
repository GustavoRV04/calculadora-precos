import API_URL from "./api";

//deixei comentado pois ainda não implementamos Restaurantes.
// export async function listarProdutos(restauranteId) { //get produtos
//   const resposta = await fetch(
//     `${API_URL}/produtos?restauranteId=${restauranteId}`,
//   );
//   console.log("todos os prod: ", resposta);

//   return resposta.json();
// }

export async function listarProdutos() {
  //get produtos
  const resposta = await fetch(`${API_URL}/produtos`);
  const produtos = await resposta.json();

  console.log("todos os prod: ", produtos);

  return produtos;
}

export async function listarItens() {
  //get Itens / Ingredientes
  const resposta = await fetch(`${API_URL}/itens`);
  const itens = await resposta.json();
  console.log("todos os itens: ", itens);

  return itens;
}

export async function buscarItemPorProduto(itemId) {
  const resposta = await fetch(`${API_URL}/itens/${itemId}`);

  const itens = await resposta.json();

  return itens;
}

export async function buscarProdutoPorItem(produtoId) {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}`);

  const produtos = await resposta.json();

  return produtos;
}

export async function criarProduto(nome) {
  const resposta = await fetch(`${API_URL}/produtos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome,
    }),
  });

  return resposta.json();
}

export async function criarItem(
  produto,
  preco_custo,
  quantidade_compra,
  unidade_medida,
) {
  const resposta = await fetch(`${API_URL}/itens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      produto,
      preco_custo,
      quantidade_compra,
      unidade_medida,
    }),
  });

  return resposta.json();
}
