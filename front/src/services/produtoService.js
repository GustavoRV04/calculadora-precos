import { requisicaoApi } from "./api";

export const LIMITE_PAGINACAO = 20;

function caminhoPaginado(recurso, offset = 0, search = "") {
  const parametros = new URLSearchParams({
    limit: String(LIMITE_PAGINACAO),
    offset: String(offset),
  });

  if (search.trim()) parametros.set("search", search.trim());
  return `/${recurso}?${parametros}`;
}

export async function listarProdutos(offset = 0, search = "") {
  return requisicaoApi(caminhoPaginado("produtos", offset, search));
}

export async function listarItens(offset = 0, search = "") {
  return requisicaoApi(caminhoPaginado("itens", offset, search));
}

export async function criarProduto(nome) {
  return requisicaoApi("/produtos", {
    method: "POST",
    body: { nome },
  });
}

export async function criarItem(
  produtoId,
  preco_custo,
  quantidade_compra,
  unidade_medida,
) {
  return requisicaoApi("/itens", {
    method: "POST",
    body: {
      produto_id: produtoId,
      preco_custo,
      quantidade_compra,
      unidade_medida,
    },
  });
}
