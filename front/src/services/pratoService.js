import { requisicaoApi } from "./api";

import { calcularCustoIngrediente } from "../utils/calculadoraPreco";

export function calcularPrato(prato) {
  const total = (prato?.prato_itens ?? []).reduce((soma, pratoItem) => {
    const item = pratoItem.item;
    if (!item) return soma;

    return soma + calcularCustoIngrediente(
      item.preco_custo,
      item.quantidade_compra,
      pratoItem.quantidade,
      item.unidade_medida,
    );
  }, 0);

  return Number(total.toFixed(2));
}

export async function pratoPorId(pratoId) {
  return requisicaoApi(`/pratos/${pratoId}`);
}

export async function criarPrato(nome) {
  return requisicaoApi("/pratos", {
    method: "POST",
    body: { nome },
  });
}

export async function adicionarIngrediente(pratoId, itemId, quantidade) {
  return requisicaoApi("/prato-itens", {
    method: "POST",
    body: {
      prato_id: pratoId,
      item_id: itemId,
      quantidade,
    },
  });
}

export async function listarPratos() {
  return requisicaoApi("/pratos");
}

export async function removerIngrediente(pratoItemId) {
  return requisicaoApi(`/prato-itens/${pratoItemId}`, { method: "DELETE" });
}
