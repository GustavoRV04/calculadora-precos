import { requisicaoApi, salvarSessao } from "./api";

export async function cadastrarRestaurante({ nome, email, senha }) {
  const sessao = await requisicaoApi("/restaurantes", {
    method: "POST",
    autenticada: false,
    body: { nome, email, senha },
  });
  return salvarSessao(sessao);
}

export async function entrarNoRestaurante({ email, senha }) {
  const sessao = await requisicaoApi("/login", {
    method: "POST",
    autenticada: false,
    body: { email, senha },
  });
  return salvarSessao(sessao);
}