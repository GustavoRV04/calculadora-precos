import API_URL from "./api";
import { calcularCustoIngrediente } from "../utils/calculadoraPreco";

export async function calcularPrato(pratoId) {
  const resposta = await fetch(`${API_URL}/prato-itens?pratoId=${pratoId}`);
  const prato = await fetch(`${API_URL}/pratos?pratoId=${pratoId}`);
  const ingredientes = await resposta.json();

  console.log(ingredientes);
  console.log("prato: ", prato.body);
  console.log("pratoID: ", pratoId);
  let total = 0;

  for (const ingrediente of ingredientes) {
    const custo = calcularCustoIngrediente(
      ingrediente.precoCompra,
      ingrediente.quantidadeCompra,
      ingrediente.quantidadeUtilizada,
    );

    total += custo;
  }

  return total;
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
      item,
      quantidade,
    }),
  });

  return resposta.json();
}

export async function listarPratos() {
  const resposta = await fetch(`${API_URL}/pratos`);

  return resposta.json();
}

export async function obterIngredientesDoPrato(pratoId) {
  const resposta = await fetch(`${API_URL}/prato-itens?pratoId=${pratoId}`);

  return resposta.json();
}
