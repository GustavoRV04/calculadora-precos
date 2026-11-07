import { requisicaoApi } from "./api";
import { LIMITE_PAGINACAO } from "./produtoService";

import { calcularCustoIngrediente } from "../utils/calculadoraPreco";

export function calcularPrato(prato) {
  const total = (prato?.prato_itens ?? []).reduce((soma, pratoItem) => {
    const item = pratoItem.item;
    if (!item) return soma;

    return (
      soma +
      calcularCustoIngrediente(
        item.preco_custo,
        item.quantidade_compra,
        pratoItem.quantidade,
        item.unidade_medida,
      )
    );
  }, 0);

  return Number(total.toFixed(2));
}

export async function pratoPorId(pratoId) {
  return requisicaoApi(`/pratos/${pratoId}`);
}

export async function atualizarMargemPrato(pratoId, margem) {
  return requisicaoApi(`/pratos/${pratoId}`, {
    method: "PATCH",
    body: { margem_lucro_percentual: margem },
  });
}

export async function obterMargemGeral() {
  return requisicaoApi("/restaurantes/margem-lucro");
}

export async function atualizarMargemGeral(margem) {
  return requisicaoApi("/restaurantes/margem-lucro", {
    method: "PATCH",
    body: { margem_lucro_percentual: margem },
  });
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

export async function listarPratos(offset = 0, search = "") {
  const parametros = new URLSearchParams({
    limit: String(LIMITE_PAGINACAO),
    offset: String(offset),
  });

  if (search.trim()) parametros.set("search", search.trim());
  return requisicaoApi(`/pratos?${parametros}`);
}

export async function removerIngrediente(pratoItemId) {
  return requisicaoApi(`/prato-itens/${pratoItemId}`, { method: "DELETE" });
}

export async function atualizarIngredientePratoService(
  pratoItemId,
  dadosAtualizados,
) {
  return requisicaoApi(`/prato-itens/${pratoItemId}`, {
    body: dadosAtualizados,
    method: "PUT",
  });
}
