import API_URL from "./api";
import { buscarItemPorProduto }
from "./produtoService";

import {
  calcularCustoIngrediente
}
from "../utils/calculadoraPreco";

export async function calcularPrato(
  pratoId
) {

  const resposta = await fetch(
    `${API_URL}/pratoItens?pratoId=${pratoId}`
  );

  const ingredientes =
    await resposta.json();

  let total = 0;

  for (const ingrediente of ingredientes) {

    const item =
      await buscarItemPorProduto(
        ingrediente.produtoId
      );

    const custo =
      calcularCustoIngrediente(
        item.precoCompra,
        item.quantidadeCompra,
        ingrediente.quantidadeUtilizada
      );

    total += custo;
  }

  return total;
}

export async function criarPrato(nome) {

  const resposta = await fetch(
    `${API_URL}/pratos`,
    {
      method: "POST",
      headers: {
        "Content-Type":
        "application/json"
      },
      body: JSON.stringify({
        nome
      })
    }
  );

  return resposta.json();
}

export async function adicionarIngrediente(
  pratoId,
  produtoId,
  quantidadeUtilizada
) {

  const resposta = await fetch(
    `${API_URL}/pratoItens`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        pratoId,
        produtoId,
        quantidadeUtilizada
      })
    }
  );

  return resposta.json();
}

export async function listarPratos() {

  const resposta = await fetch(
    `${API_URL}/pratos`
  );

  return resposta.json();
}