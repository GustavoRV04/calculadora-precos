import API_URL from "./api";

export async function listarRestaurantes() {
  const resposta = await fetch(`${API_URL}/restaurantes`);
  return resposta.json();
}

export async function criarRestaurante(nome) {
  const resposta = await fetch(`${API_URL}/restaurantes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome }),
  });

  return resposta.json();
}