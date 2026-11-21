import { requisicaoApi } from "./api";
import { LIMITE_PAGINACAO } from "./produtoService";

import { calcularCustoIngredienteReceita } from "../utils/calculadoraPreco";

export function calcularPrato(prato) {
  const total = (prato?.prato_produtos ?? []).reduce((soma, pratoProduto) => {
    const item = pratoProduto.produto?.ultimo_item;
    if (!item) return soma;

    return (
      soma +
      calcularCustoIngredienteReceita(
        item.preco_custo,
        item.quantidade_compra,
        pratoProduto.quantidade,
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

export async function adicionarIngrediente(pratoId, produtoId, quantidade) {
  return requisicaoApi("/prato-produtos", {
    method: "POST",
    body: {
      prato_id: pratoId,
      produto_id: produtoId,
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

export async function removerIngrediente(pratoProdutoId) {
  return requisicaoApi(`/prato-produtos/${pratoProdutoId}`, { method: "DELETE" });
}

export async function atualizarIngredientePratoService(
  pratoProdutoId,
  dadosAtualizados,
) {
  return requisicaoApi(`/prato-produtos/${pratoProdutoId}`, {
    body: dadosAtualizados,
    method: "PUT",
  });
}
