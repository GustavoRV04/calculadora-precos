
import API_URL from "./api";

export async function listarProdutos() {
  const resposta = await fetch(
    `${API_URL}/produtos`
  );

  return resposta.json();
}

export async function listarItens() {
  const resposta = await fetch(
    `${API_URL}/itens`
  );

  return resposta.json();
}

export async function buscarItemPorProduto(
  produtoId
) {
  const resposta = await fetch(
    `${API_URL}/itens?produtoId=${produtoId}`
  );

  const itens = await resposta.json();

  return itens[0];
}

export async function criarProduto(nome) {

  const resposta = await fetch(
    `${API_URL}/produtos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
      }),
    }
  );

  return resposta.json();
}

export async function criarItem(
  produtoId,
  precoCompra,
  quantidadeCompra,
  unidadeMedida
) {

  const resposta = await fetch(
    `${API_URL}/itens`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        produtoId,
        precoCompra,
        quantidadeCompra,
        unidadeMedida
      })
    }
  );

  return resposta.json();
}