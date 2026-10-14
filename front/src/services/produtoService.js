import { requisicaoApi } from "./api";

export async function listarProdutos() {
  return requisicaoApi("/produtos");
}

export async function listarItens() {
  return requisicaoApi("/itens");
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
