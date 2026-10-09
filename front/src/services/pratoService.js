import API_URL from "./api";

import { calcularCustoIngrediente } from "../utils/calculadoraPreco";

export async function calcularPrato(prato) {
  let total = 0;

  for (const pratoItem of prato?.prato_itens ?? []) {
    const custo = calcularCustoIngrediente(
      pratoItem.item.preco_custo,
      pratoItem.item.quantidade_compra,
      pratoItem.quantidade,
    );

    total += custo;
  }

  return total;
}

export async function pratoPorId(pratoId) {
  const prato = await fetch(`${API_URL}/pratos/${pratoId}`);
  const pratoObj = await prato.json();

  return pratoObj;
}

export async function criarPrato(nome) {
  const resposta = await fetch(`${API_URL}/pratos`, {
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

export async function adicionarIngrediente(prato, item, quantidade) {
  //aqui o id do item vem 6 que é o id do produto, preciso do id do item.

  const resposta = await fetch(`${API_URL}/prato-itens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prato,
      item_id: item,
      quantidade,
    }),
  });

  return resposta.json();
}

export async function listarPratos() {
  const resposta = await fetch(`${API_URL}/pratos`);

  return resposta.json();
}
