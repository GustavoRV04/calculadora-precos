import API_URL from "./api";

import { calcularCustoIngrediente } from "../utils/calculadoraPreco";

export async function calcularPrato(prato) {
  let total = 0;

  for (const pratoItem of prato?.prato_itens ?? []) {
    const item = pratoItem.item;
    if (!item) continue;

    const custo = calcularCustoIngrediente(
      item.preco_custo,
      item.quantidade_compra,
      pratoItem.quantidade,
      item.unidade_medida,
    );

    total += custo;
  }

  return Number(total.toFixed(2));
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

export async function adicionarIngrediente(pratoId, itemId, quantidade) {
  const resposta = await fetch(`${API_URL}/prato-itens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prato_id: pratoId,
      item_id: itemId,
      quantidade,
    }),
  });

  return resposta.json();
}

export async function listarPratos() {
  const resposta = await fetch(`${API_URL}/pratos`);

  return resposta.json();
}
